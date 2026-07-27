import { Transaction } from "sequelize";
import { getSequelizeConfig } from "@config/sequelize.config.js";
import { BillCreationDTO } from "@economic-control/shared";
import { BillModel, BillAttributes } from "@models/cafeteria/bill.model.js";
import { BillDetailModel } from "@models/cafeteria/bill_details.model.js";
import { ProductModel } from "@models/cafeteria/product.model.js";

const connection = getSequelizeConfig();

/**
 * Crea una nueva factura (ticket) calculando los precios reales desde la DB.
 * @param dto Datos del pedido (método de pago y array de productos con cantidades).
 * @returns Promise con el ticket completo y sus detalles.
 */
async function create(dto: BillCreationDTO): Promise<BillAttributes> {
    return connection.transaction(async (t: Transaction) => {
        // 1. Extraer los IDs de los productos solicitados para buscarlos de una sola vez
        const productIds = dto.details.map((detail) => detail.product_id);

        const products = await ProductModel.findAll({
            where: { id: productIds },
            transaction: t,
        });

        // 2. Validar que todos los productos existan y estén activos
        if (products.length !== productIds.length) {
            throw new Error("Uno o más productos no existen en la base de datos");
        }

        // 3. Preparar los detalles y calcular el monto total de la factura
        let totalAmount = 0;
        const detailsToInsert = [];

        for (const item of dto.details) {
            const product = products.find((p) => p.id === item.product_id);

            if (!product) {
                throw new Error(`Producto con ID ${item.product_id} no encontrado`);
            }
            if (!product.is_active) {
                throw new Error(`El producto ${product.name} no se encuentra activo para la venta`);
            }

            const subtotal = product.unit_price * item.quantity;
            totalAmount += subtotal;

            detailsToInsert.push({
                product_id: product.id,
                quantity: item.quantity,
                unit_price: product.unit_price, // Precio real sacado de la DB
                subtotal: subtotal,
            });
        }

        // 4. Crear la cabecera del ticket (Bill)
        const newBill = await BillModel.create(
            {
                amount: totalAmount,
                pay_method: dto.pay_method,
                date: new Date(),
                created_at: new Date()
            },
            { transaction: t }
        );

        // 5. Inyectar el ID de la factura a cada detalle y guardarlos
        const finalDetails = detailsToInsert.map((detail) => ({
            ...detail,
            bill_id: newBill.id,
        }));

        await BillDetailModel.bulkCreate(finalDetails, { transaction: t });

        // 6. Recuperar la factura completa con las relaciones para el ticket de impresión
        const createdBill = await BillModel.findByPk(newBill.id, {
            include: [
                {
                    model: BillDetailModel,
                    as: "Details",
                    include: [
                        {
                            model: ProductModel,
                            as: "Product",
                            attributes: ["code", "name"],
                        },
                    ],
                },
            ],
            transaction: t,
        });

        if (!createdBill) {
            throw new Error("Error al generar la factura");
        }

        return createdBill.get({ plain: true });
    });
}

/**
 * Obtiene todas las facturas de la base de datos.
 * @returns Promise con un array de objetos BillAttributes.
 */
async function getAll(): Promise<BillAttributes[]> {
    const bills = await BillModel.findAll({
        order: [["date", "DESC"]],
        include: [
            {
                model: BillDetailModel,
                as: "Details",
                include: [
                    {
                        model: ProductModel,
                        as: "Product",
                        attributes: ["code", "name"],
                    },
                ],
            },
        ],
    });

    return bills.map((bill) => bill.get({ plain: true }));
}

/**
 * Obtiene una factura específica con todos sus detalles.
 * @param id ID de la factura
 * @param t (Opcional) Objeto de transacción de Sequelize.
 * @returns Promise con un objeto BillAttributes.
 */
async function getOne(id: number, t?: Transaction): Promise<BillAttributes> {
    const bill = await BillModel.findByPk(id, {
        transaction: t,
        include: [
            {
                model: BillDetailModel,
                as: "Details",
                include: [
                    {
                        model: ProductModel,
                        as: "Product",
                        attributes: ["code", "name"],
                    },
                ],
            },
        ],
    });

    if (!bill) {
        throw new Error("No se encontró la factura");
    }

    return bill.get({ plain: true });
}

/**
 * Elimina una factura (y por cascada sus detalles).
 * Nota: En sistemas contables reales rara vez se borra físicamente, pero sirve para desarrollo.
 */
async function remove(id: number): Promise<boolean> {
    const deleted = await BillModel.destroy({ where: { id } });

    if (!deleted) {
        throw new Error("Factura no encontrada");
    }

    return deleted > 0;
}

export const billService = {
    create,
    getAll,
    getOne,
    remove,
};