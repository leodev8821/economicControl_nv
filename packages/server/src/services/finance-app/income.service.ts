import { Op, fn, col, Transaction } from "sequelize";
import { getSequelizeConfig } from "@config/sequelize.config.js";
import { IncomeModel, IncomeAttributes, IncomeCreationAttributes, IncomeSearchData } from "@models/finance-app/income.model.js";
import { PersonModel } from "@models/finance-app/person.model.js";
import { WeekModel } from "@models/finance-app/week.model.js";
import { CashModel } from "@models/finance-app/cash.model.js";
import { cashService } from "@services/finance-app/cash.service.js";
import { INCOME_SOURCES, type IncomeSource } from "@economic-control/shared";
import { DashboardFilter } from "@shared/dashboard.types.js";

const connection = getSequelizeConfig();

/** Helper para obtener la configuración de includes */
const getIncludeConfig = () => [
    {
        model: CashModel,
        as: "Cash",
        attributes: ["id", "name", "actual_amount"],
        required: true,
    },
    {
        model: WeekModel,
        as: "Week",
        attributes: ["id", "week_start", "week_end"],
        required: true,
    },
    {
        model: PersonModel,
        as: "Person",
        attributes: ["id", "dni", "first_name", "last_name"],
        required: false,
    },
];

/** Función helper de normalización */
const normalizeIncomeSource = (source: string): IncomeSource => {
    const found = INCOME_SOURCES.find(
        (s: string) => s.toLowerCase() === source.toLowerCase(),
    );

    if (!found) {
        throw new Error(`Fuente de ingreso inválida: ${source}`);
    }

    return found as IncomeSource;
};

/**
 * Obtiene todos los ingresos de la base de datos.
 * @returns promise con un array de objetos IncomeAttributes.
 */
async function getAll(): Promise<IncomeAttributes[]> {
    const incomes = await IncomeModel.findAll({
        include: getIncludeConfig(),
    });

    if (!incomes) {
        throw new Error("No se encontraron ingresos");
    }

    return incomes.map((income) => income.get({ plain: true }));
}

/**
 * Obtiene un ingreso que cumpla con los criterios de búsqueda proporcionados.
 * @param filters criterios de búsqueda.
 * @param t (Opcional) Objeto de transacción de Sequelize.
 * @returns promise con un objeto IncomeAttributes.
 */
async function getOne(
    filters: IncomeSearchData,
    t?: Transaction
): Promise<IncomeAttributes> {
    const income = await IncomeModel.findOne({
        where: { ...filters },
        include: getIncludeConfig(),
        transaction: t,
    });

    if (!income) {
        throw new Error("No se encontró el ingreso");
    }

    return income.get({ plain: true }) as IncomeAttributes;
}

/**
 * Crea un nuevo ingreso en la base de datos y actualiza el saldo de la caja.
 * @param data datos del ingreso a crear.
 * @returns promise con el objeto IncomeAttributes creado.
 */
async function create(
    data: IncomeCreationAttributes
): Promise<IncomeAttributes> {
    if (!INCOME_SOURCES.includes(data.source)) {
        throw new Error(`Fuente inválida: ${data.source}`);
    }

    return connection.transaction(async (t) => {
        const normalizedData = {
            ...data,
            source: normalizeIncomeSource(data.source),
        };

        const newIncome = await IncomeModel.create(normalizedData, { transaction: t });
        const currentCash = await CashModel.findByPk(data.cash_id, { transaction: t });

        if (currentCash) {
            const newAmount =
                parseFloat(String(currentCash.actual_amount)) +
                parseFloat(String(data.amount));

            await cashService.update(data.cash_id, { actual_amount: newAmount }, t);
        } else {
            throw new Error("La caja especificada no existe");
        }

        const createdIncome = await IncomeModel.findByPk(newIncome.id, {
            include: getIncludeConfig(),
            transaction: t
        });

        return createdIncome!.get({ plain: true });
    });
}

/**
 * Actualiza un ingreso existente en la base de datos y corrige los saldos de caja afectados.
 * @param id ID del ingreso a actualizar.
 * @param data datos a actualizar (puede incluir amount o cash_id).
 * @returns promise con el objeto IncomeAttributes actualizado.
 */
async function update(
    id: number,
    data: Partial<IncomeCreationAttributes>
): Promise<IncomeAttributes> {
    return connection.transaction(async (t) => {
        const originalIncome = await IncomeModel.findByPk(id, { transaction: t });
        
        if (!originalIncome) {
            throw new Error("Ingreso no encontrado");
        }

        const isAmountChanged =
            data.amount !== undefined &&
            parseFloat(String(data.amount)) !== parseFloat(String(originalIncome.amount));
            
        const isCashIdChanged =
            data.cash_id !== undefined && data.cash_id !== originalIncome.cash_id;

        if (isAmountChanged || isCashIdChanged) {
            const oldAmount = parseFloat(String(originalIncome.amount));
            const oldCashId = originalIncome.cash_id;

            const newAmount = data.amount !== undefined ? parseFloat(String(data.amount)) : oldAmount;
            const newCashId = data.cash_id !== undefined ? data.cash_id : oldCashId;

            // 1. Revertir la transacción en la caja original
            let oldCash = await cashService.getOne({ id: oldCashId }, t);
            const oldCashNewAmount = parseFloat(String(oldCash.actual_amount)) - oldAmount;
            await cashService.update(oldCashId, { actual_amount: oldCashNewAmount }, t);

            // Refrescar oldCash en caso de que sea la misma caja
            oldCash = await cashService.getOne({ id: oldCashId }, t);

            // 2. Aplicar la nueva transacción en la caja objetivo
            let targetCash = oldCashId === newCashId ? oldCash : await cashService.getOne({ id: newCashId }, t);
            
            const newCashNewAmount = parseFloat(String(targetCash.actual_amount)) + newAmount;
            await cashService.update(newCashId, { actual_amount: newCashNewAmount }, t);
        }

        const [updatedCount] = await IncomeModel.update(data, {
            where: { id },
            transaction: t,
        });

        if (updatedCount === 0) {
            throw new Error("Error al actualizar el ingreso");
        }

        const updatedIncome = await IncomeModel.findByPk(id, {
            include: getIncludeConfig(),
            transaction: t 
        });

        return updatedIncome!.get({ plain: true });
    });
}

/**
 * Elimina un ingreso de la base de datos por su ID y revierte el saldo en la caja.
 * @param id ID del ingreso a eliminar.
 * @returns promise con un booleano que indica si la eliminación fue exitosa.
 */
async function remove(id: number): Promise<boolean> {
    return connection.transaction(async (t) => {
        const incomeToDelete = await IncomeModel.findByPk(id, { transaction: t });
        
        if (!incomeToDelete) {
            throw new Error("Ingreso no encontrado");
        }

        // Revertir el saldo en la caja
        const currentCash = await cashService.getOne({ id: incomeToDelete.cash_id }, t);
        const newAmount = parseFloat(String(currentCash.actual_amount)) - parseFloat(String(incomeToDelete.amount));
        
        await cashService.update(incomeToDelete.cash_id, { actual_amount: newAmount }, t);

        // Eliminar el ingreso
        const deletedCount = await IncomeModel.destroy({ 
            where: { id },
            transaction: t 
        });

        return deletedCount > 0;
    });
}

/**
 * Obtiene ingresos de tipo 'Diezmo' para una persona por su DNI.
 */
async function getTitheIncomesByDni(dni: string): Promise<IncomeAttributes[]> {
    const person = await PersonModel.findOne({
        where: { dni },
        attributes: ["id"],
    });

    if (!person) {
        throw new Error("Persona no encontrada");
    }

    const incomes = await IncomeModel.findAll({
        where: { person_id: person.id, source: "Diezmo" },
        include: getIncludeConfig(),
    });

    return incomes.map((income) => income.get({ plain: true }));
}

/**
 * Obtiene todos los ingresos para una fecha específica.
 */
async function getIncomesByDate(date: string): Promise<IncomeAttributes[]> {
    const incomes = await IncomeModel.findAll({
        where: { date },
        include: getIncludeConfig(),
    });

    return incomes.map((income) => income.get({ plain: true }));
}

/**
 * Obtiene todos los ingresos para un ID de semana específico.
 */
async function getIncomesByWeekId(weekId: number): Promise<IncomeAttributes[]> {
    const incomes = await IncomeModel.findAll({
        where: { week_id: weekId },
        include: getIncludeConfig(),
    });

    return incomes.map((income) => income.get({ plain: true }));
}

/**
 * Crea múltiples ingresos en una sola transacción y actualiza los saldos de caja.
 * @param dataList Arreglo de datos de ingresos a crear.
 * @returns Promise con el array de ingresos creados.
 */
async function createMultipleIncomes(
    dataList: IncomeCreationAttributes[]
): Promise<IncomeAttributes[]> {
    return connection.transaction(async (t) => {
        const normalizedData = dataList.map((item) => ({
            ...item,
            source: normalizeIncomeSource(item.source),
        }));

        const newIncomes = await IncomeModel.bulkCreate(normalizedData, {
            transaction: t,
            validate: true,
        });

        const cashTotals = new Map<number, number>();

        for (const { cash_id, amount } of dataList) {
            const value = Number(amount);
            if (!Number.isFinite(value)) continue;
            cashTotals.set(cash_id, (cashTotals.get(cash_id) ?? 0) + value);
        }

        for (const [cashId, totalAmount] of cashTotals) {
            await CashModel.increment(
                { actual_amount: totalAmount },
                {
                    where: { id: cashId },
                    transaction: t,
                },
            );
        }

        return newIncomes.map((income) => income.get({ plain: true }));
    });
}

/**
 * Obtiene el resumen de ingresos agrupado por caja y fuente.
 */
async function getSummaryByCash(
    filters: DashboardFilter = {}
): Promise<any[]> {
    const where: any = {};

    if (filters.week_id) {
        where.week_id = filters.week_id;
    } else if (filters.startDate && filters.endDate) {
        where.date = { [Op.between]: [filters.startDate, filters.endDate] };
    }

    return await IncomeModel.findAll({
        attributes: [
            "cash_id",
            "source",
            [fn("SUM", col("amount")), "total_amount"],
        ],
        where,
        group: ["cash_id", "source"],
        raw: true,
    });
}

export const incomeService = {
    getAll,
    getOne,
    create,
    update,
    remove,
    getTitheIncomesByDni,
    getIncomesByDate,
    getIncomesByWeekId,
    createMultipleIncomes,
    getSummaryByCash
};