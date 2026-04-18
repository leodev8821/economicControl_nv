import { CashCreationDTO, CashUpdateDTO } from "@economic-control/shared";
import { CashModel, CashAttributes, CashSearchData } from "@models/finance-app/cash.model.js";
import { CashDenominationModel } from "@models/finance-app/cash-denomination.model.js";
import { getSequelizeConfig } from "@config/sequelize.config.js";
import { Transaction } from "sequelize";

const connection = getSequelizeConfig();

/**
 * Crea una nueva caja en la base de datos.
 * @param dto datos de la caja a crear.
 * @returns promise con el objeto CashAttributes creado.
 */
async function create(
    dto: CashCreationDTO
): Promise<CashAttributes> {
    return connection.transaction(async (t) => {
        //crear caja
        const newCash = await CashModel.create(dto, { transaction: t });

        //denominaciones por defecto (euros)
        const defaultDenominations = [
            500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01,
        ];

        //crear arqueo inicial
        await CashDenominationModel.bulkCreate(
            defaultDenominations.map((value) => ({
                cash_id: newCash.id,
                denomination_value: value,
                quantity: 0,
            })),
            { transaction: t },
        );

        const createdCash = await CashModel.findByPk(newCash.id, {
            include: [{ model: CashDenominationModel, as: "denominations" }],
            transaction: t,
        });

        if (!createdCash) {
            throw new Error("Error al crear la caja");
        }

        return createdCash.get({ plain: true });
    })
}

/**
 * Obtiene todas las cajas de la base de datos.
 * @returns promise con un array de objetos CashAttributes.
 */
async function getAll(): Promise<CashAttributes[]> {
    const cashs = await CashModel.findAll();

    if (!cashs) {
        throw new Error("No se encontraron cajas");
    }

    return cashs.map((cash) => cash.get({ plain: true }));
}

/**
 * obtiene una caja que cumpla con los criterios de búsqueda proporcionados.
 * @param filters criterios de búsqueda.
 * @param t (Opcional) Objeto de transacción de Sequelize.
 * @returns promise con un objeto CashAttributes.
 */
async function getOne(filters: CashSearchData, t?: Transaction): Promise<CashAttributes> {
    const cash = await CashModel.findOne({
        where: { ...filters },
        transaction: t,
        include: [
            {
                model: CashDenominationModel,
                as: "denominations",
            },
        ],
    });

    if (!cash) {
        throw new Error("No se encontró la caja");
    }

    return cash.get({ plain: true }) as CashAttributes;
}

/**
 * Actualiza una caja existente en la base de datos, con soporte para transacciones.
 * @param id ID de la caja a actualizar.
 * @param dto datos a actualizar.
 * @param t (Opcional) Objeto de transacción de Sequelize.
 * @returns promise con el objeto CashAttributes actualizado.
 */
async function update(
    id: number,
    dto: CashUpdateDTO,
    t?: Transaction
): Promise<CashAttributes> {
    const transaction = t ?? null;

    // Se añade el objeto de transacción a las opciones de la llamada:
    const [updatedCount] = await CashModel.update(dto, {
        where: { id },
        transaction: transaction,
    });

    if (updatedCount === 0) {
        throw new Error("Caja no encontrada");
    }

    // Se incluye la transacción en findByPk también:
    const updatedCash = await CashModel.findByPk(id, {
        transaction: transaction,
    });

    if (!updatedCash) {
        throw new Error("Error al actualizar la caja");
    }

    return updatedCash.get({ plain: true });
}

/**
 * Elimina una caja de la base de datos por su ID.
 * @param id ID de la caja a eliminar.
 * @returns promise con un booleano que indica si la eliminación fue exitosa.
 */
async function remove(id: number): Promise<boolean> {
    const deleted = await CashModel.destroy({ where: { id } });

    if (!deleted) {
        throw new Error("Caja no encontrada");
    }

    return deleted > 0;
}

export const cashService = {
    create,
    getAll,
    getOne,
    update,
    remove
}