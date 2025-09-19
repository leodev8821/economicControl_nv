import { DataTypes, Op } from "sequelize";
import { getSequelizeConfig } from "../config/mysql.js";
import { Income } from './income.model.js';
import { Outcome } from './outcome.model.js';

const connection = getSequelizeConfig();


export const Week = connection.define('Week', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    week_start: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true,
    },
    week_end: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true,
    }
}, {
    tableName: 'weeks',
    timestamps: false,
});

/**
 * Obtiene todos los ingresos agrupados por semana.
 * @async
 * @function getIncomesByWeek
 * @param {number} weekId - ID de la semana.
 * @returns {Promise<object[]>} - Lista de ingresos de la semana.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getIncomesByWeek(weekId) {
    try {
        return await Income.findAll({
            where: { week_id: weekId },
            raw: true
        });
    } catch (error) {
        console.error('Error al obtener ingresos por semana:', error.message);
        throw new Error(`Error al obtener ingresos por semana: ${error.message}`);
    }
}

/**
 * Obtiene todos los gastos agrupados por semana.
 * @async
 * @function getOutcomesByWeek
 * @param {number} weekId - ID de la semana.
 * @returns {Promise<object[]>} - Lista de gastos de la semana.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getOutcomesByWeek(weekId) {
    try {
        return await Outcome.findAll({
            where: { week_id: weekId },
            raw: true
        });
    } catch (error) {
        console.error('Error al obtener gastos por semana:', error.message);
        throw new Error(`Error al obtener gastos por semana: ${error.message}`);
    }
}



/**
 * Crea una nueva semana.
 * @async
 * @function createNewWeek
 * @param {object} data - Datos de la nueva semana.
 * @returns {Promise<object|null>} - La nueva semana creada o null si ya existe.
 * @throws {Error} - Lanza un error si hay un problema al crear la semana.
 */
export async function createNewWeek(data) {
    try {
        const uniqueFields = ["week_start", "week_end"];
        const week = await Week.findOne({
            where: {
                [Op.or]: uniqueFields.map((field) => ({ [field]: data[field] }))
            }
        });
        if (week) {
            return null;
        }
        const newWeek = await Week.create(data);
        return newWeek.dataValues;
    } catch (error) {
        console.error('Error al crear Semana:', error.message);
        throw new Error(`Error al crear Semana: ${error.message}`);
    }
};

/**
 * Obtiene todas las semanas.
 * @async
 * @function getAllWeeks
 * @returns {Promise<object[]>} - Lista de todas las semanas.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getAllWeeks() {
    try {
        return await Week.findAll({ raw: true });
    } catch (error) {
        console.error('Error al consultar la base de datos: ', error.message);
        throw new Error(`Error al consultar la base de datos: ${error.message}`);
    }
};

/**
 * Obtiene una semana por ID, fecha de inicio o fin
 * @async
 * @function getOneWeek
 * @param {string|number} data - ID, week_start o week_end.
 * @returns {Promise<object|null>} - La semana encontrada o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getOneWeek(data) {
    try {
        const fields = ["id", "week_start", "week_end"];
        const searchValue = typeof data === 'string' ? data.trim() : data;
        const week = await Week.findOne({
            where: {
                [Op.or]: fields.map((field) => ({ [field]: searchValue }))
            },
            raw: true
        });
        if (!week) {
            return null;
        }
        return week;
    } catch (error) {
        console.error(`Error al buscar semana con Id, inicio o fin "${data}":`, error.message);
        throw new Error(`Error al buscar semana con Id, inicio o fin "${data}": ${error.message}`);
    }
};

/**
 * Actualiza una semana por ID, fecha de inicio o fin
 * @async
 * @function updateOneWeek
 * @param {string[]} weekInfo - Array de campos para buscar la semana (id, week_start, week_end).
 * @param {object} newData - Datos para actualizar la semana.
 * @returns {Promise<object|null>} - La semana actualizada o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al actualizar la semana.
 */
export async function updateOneWeek(weekInfo, newData) {
    try {
        // Buscar la semana por los campos indicados en weekInfo usando los valores de newData
        const whereClause = {};
        weekInfo.forEach(field => {
            if (newData[field] !== undefined) {
                whereClause[field] = newData[field];
            }
        });
        const week = await Week.findOne({
            where: whereClause,
            raw: true
        });
        if (!week) {
            return null;
        }
        await Week.update(newData, { where: whereClause });
        // Retornar los datos actualizados
        const updatedWeek = await Week.findOne({ where: whereClause, raw: true });
        return updatedWeek;
    } catch (error) {
        console.error('Error al actualizar semana:', error.message);
        throw new Error(`Error al actualizar semana: ${error.message}`);
    }
}

/**
 * Elimina una semana por ID, fecha de inicio o fin
 * @async
 * @function deleteWeek
 * @param {string[]} weekInfo - Array de campos para buscar la semana (id, week_start, week_end).
 * @returns {Promise<object|null>} - La semana eliminada o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al eliminar la semana.
 */
export async function deleteWeek(weekInfo) {
    try {
        // Buscar la semana por los campos indicados en weekInfo usando los valores de weekInfo
        const whereClause = {};
        weekInfo.forEach(field => {
            if (weekInfo[field] !== undefined) {
                whereClause[field] = weekInfo[field];
            }
        });
        const week = await Week.findOne({
            where: whereClause,
            raw: false
        });
        if (!week) {
            return null;
        }
        await week.destroy(); // hard delete
        return week;
    } catch (error) {
        console.error(`Error al eliminar la semana ${JSON.stringify(weekInfo)}`, error.message);
        throw new Error(`Error al eliminar la Semana: ${error.message}`);
    }
};