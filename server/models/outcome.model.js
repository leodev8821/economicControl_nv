import { DataTypes, Op } from "sequelize";
import { getSequelizeConfig } from "../config/mysql.js";

const connection = getSequelizeConfig();

export const Outcome = connection.define('Outcome', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    cash_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'cashes',
            key: 'id',
        },
    },
    week_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'weeks',
            key: 'id',
        },
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category: {
        type: DataTypes.ENUM('Fijos', 'Variables', 'Otro'),
        allowNull: false,
    }
}, {
    tableName: 'outcomes',
    timestamps: false,
});

/*
 * @param {number} cashId - ID de la caja.
 * @returns {Promise<object[]>} - Lista de gastos pagados desde la caja.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getOutcomesByCash(cashId) {
    try {
        return await Outcome.findAll({
            where: { cash_id: cashId },
            raw: true
        });
    } catch (error) {
        console.error('Error al obtener gastos por caja:', error.message);
        throw new Error(`Error al obtener gastos por caja: ${error.message}`);
    }
}

/**
 * Crea un nuevo gasto.
 * @async
 * @function createNewOutcome
 * @param {object} data - Datos del nuevo gasto.
 * @returns {Promise<object>} - El nuevo gasto creado.
 * @throws {Error} - Lanza un error si hay un problema al crear el gasto.
 */
export async function createNewOutcome(data) {
    try {
        const newOutcome = await Outcome.create(data);
        return newOutcome.dataValues;
    } catch (error) {
        console.error('Error al crear Gasto:', error.message);
        throw new Error(`Error al crear Gasto: ${error.message}`);
    }
};

/**
 * Obtiene todos los gastos.
 * @async
 * @function getAllOutcomes
 * @returns {Promise<object[]>} - Lista de todos los gastos.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getAllOutcomes() {
    try {
        return await Outcome.findAll({ raw: true });
    } catch (error) {
        console.error('Error al consultar la base de datos: ', error.message);
        throw new Error(`Error al consultar la base de datos: ${error.message}`);
    }
};

/**
 * Obtiene un gasto por ID.
 * @async
 * @function getOneOutcome
 * @param {number} id - ID del gasto.
 * @returns {Promise<object|null>} - El gasto encontrado o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getOneOutcome(id) {
    try {
        const outcome = await Outcome.findOne({
            where: { id },
            raw: true
        });
        if (!outcome) {
            return null;
        }
        return outcome;
    } catch (error) {
        console.error(`Error al buscar gasto con Id "${id}":`, error.message);
        throw new Error(`Error al buscar gasto con Id "${id}": ${error.message}`);
    }
};

/**
 * Actualiza un gasto por ID.
 * @async
 * @function updateOneOutcome
 * @param {number} id - ID del gasto.
 * @param {object} newData - Datos para actualizar el gasto.
 * @returns {Promise<object|null>} - El gasto actualizado o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al actualizar el gasto.
 */
export async function updateOneOutcome(id, newData) {
    try {
        const outcome = await Outcome.findOne({
            where: { id },
            raw: true
        });
        if (!outcome) {
            return null;
        }
        await Outcome.update(newData, { where: { id } });
        return { ...outcome, ...newData };
    } catch (error) {
        console.error('Error al actualizar gasto:', error.message);
        throw new Error(`Error al actualizar gasto: ${error.message}`);
    }
}

/**
 * Elimina un gasto por ID.
 * @async
 * @function deleteOutcome
 * @param {number} id - ID del gasto.
 * @returns {Promise<object|null>} - El gasto eliminado o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al eliminar el gasto.
 */
export async function deleteOutcome(id) {
    try {
        const outcome = await Outcome.findOne({
            where: { id },
            raw: false
        });
        if (!outcome) {
            return null;
        }
        await outcome.destroy(); // hard delete
        return outcome;
    } catch (error) {
        console.error(`Error al eliminar el gasto ${id}`, error.message);
        throw new Error(`Error al eliminar el Gasto: ${error.message}`);
    }
};