import { Transaction } from "sequelize";
import { BillDetailModel, BillDetailAttributes, BillDetailSearchData } from "@models/cafeteria/bill_details.model.js";
import { ProductModel } from "@models/cafeteria/product.model.js";
import { BillModel } from "@models/cafeteria/bill.model.js";

/**
 * Este servicio está enfocado en recuperar datos granulares, lo cual es sumamente útil para hacer un endpoint de analíticas 
 * (por ejemplo, "cuántas empanadas se vendieron este mes").
 */

/**
 * Obtiene todos los detalles de venta, útil para reportes de productos vendidos.
 */
async function getAll(filters?: BillDetailSearchData): Promise<BillDetailAttributes[]> {
    const details = await BillDetailModel.findAll({
        where: filters ? { ...filters } : undefined,
        include: [
            {
                model: ProductModel,
                as: "Product",
                attributes: ["code", "name"],
            }
        ]
    });

    return details.map((detail) => detail.get({ plain: true }));
}

/**
 * Obtiene un detalle específico por su ID.
 */
async function getOne(id: number, t?: Transaction): Promise<BillDetailAttributes> {
    const detail = await BillDetailModel.findByPk(id, {
        transaction: t,
        include: [
            {
                model: ProductModel,
                as: "Product",
            },
            {
                model: BillModel,
                as: "Bill",
            }
        ],
    });

    if (!detail) {
        throw new Error("Detalle de factura no encontrado");
    }

    return detail.get({ plain: true });
}

/**
 * Obtiene todos los detalles asociados a una factura en particular.
 */
async function getByBillId(bill_id: number, t?: Transaction): Promise<BillDetailAttributes[]> {
    const details = await BillDetailModel.findAll({
        where: { bill_id },
        transaction: t,
        include: [
            {
                model: ProductModel,
                as: "Product",
                attributes: ["code", "name", "unit_price"],
            }
        ],
    });

    return details.map((detail) => detail.get({ plain: true }));
}

export const billDetailService = {
    getAll,
    getOne,
    getByBillId,
};