import { DataTypes, Op } from "sequelize";
import { getSequelizeConfig } from "../config/mysql.js";

const connection = getSequelizeConfig();

export const Cash = connection.define('Cash', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    actual_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    pettyCash_limit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
    },
}, {
    tableName: 'cashes',
    timestamps: false,
});

/**
 * Crea una nueva caja.
 * @async
 * @function createNewCash
 * @param {object} data - Datos de la nueva caja.
 * @returns {Promise<object|null>} - La nueva caja creada o null si ya existe.
 * @throws {Error} - Lanza un error si hay un problema al crear la caja.
 */
export async function createNewCash(data) {
    try {
        const uniqueFields = ["name"];
        const cash = await Cash.findOne({
            where: {
                [Op.or]: uniqueFields.map((field) => ({ [field]: data[field] }))
            }
        });
        if (cash) {
            return null;
        }
        const newCash = await Cash.create(data);
        return newCash.dataValues;
    } catch (error) {
        console.error('Error al crear Caja:', error.message);
        throw new Error(`Error al crear Caja: ${error.message}`);
    }
};

/**
 * Obtiene todas las cajas.
 * @async
 * @function getAllCash
 * @returns {Promise<object[]>} - Lista de todas las cajas.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getAllCash() {
    try {
        return await Cash.findAll({ raw: true });
    } catch (error) {
        console.error('Error al consultar la base de datos: ', error.message);
        throw new Error(`Error al consultar la base de datos: ${error.message}`);
    }
};

/**
 * Obtiene una caja por ID o nombre
 * @async
 * @function getOneCash
 * @param {string|number} data - ID o nombre.
 * @returns {Promise<object|null>} - La caja encontrada o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getOneCash(data) {
    try {
        const fields = ["id", "name"];
        const searchValue = typeof data === 'string' ? data.trim() : data;
        const cash = await Cash.findOne({
            where: {
                [Op.or]: fields.map((field) => ({ [field]: searchValue }))
            },
            raw: true
        });
        if (!cash) {
            return null;
        }
        return cash;
    } catch (error) {
        console.error(`Error al buscar caja con Id o nombre "${data}":`, error.message);
        throw new Error(`Error al buscar caja con Id o nombre "${data}": ${error.message}`);
    }
};

/**
 * Actualiza una caja por ID o nombre
 * @async
 * @function updateOneCash
 * @param {string[]} cashInfo - Array de campos para buscar la caja (id, name).
 * @param {object} newData - Datos para actualizar la caja.
 * @returns {Promise<object|null>} - La caja actualizada o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al actualizar la caja.
 */
export async function updateOneCash(cashInfo, newData) {
    try {
        const cash = await Cash.findOne({
            where: {
                [Op.or]: cashInfo.map((field) => ({ [field]: newData[field] }))
            },
            raw: true
        });
        if (!cash) {
            return null;
        }
        await Cash.update(newData, {
            where: {
                [Op.or]: cashInfo.map((field) => ({ [field]: newData[field] }))
            }
        });
        // Retornar los datos actualizados
        const updatedCash = await Cash.findOne({
            where: {
                [Op.or]: cashInfo.map((field) => ({ [field]: newData[field] }))
            },
            raw: true
        });
        return updatedCash;
    } catch (error) {
        console.error('Error al actualizar caja:', error.message);
        throw new Error(`Error al actualizar caja: ${error.message}`);
    }
}

/**
 * Elimina una caja por ID o nombre
 * @async
 * @function deleteCash
 * @param {string[]} cashInfo - Array de campos para buscar la caja (id, name).
 * @returns {Promise<object|null>} - La caja eliminada o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al eliminar la caja.
 */
export async function deleteCash(cashInfo) {
    try {
        const cash = await Cash.findOne({
            where: {
                [Op.or]: cashInfo.map((field) => ({ [field]: cashInfo[field] }))
            },
            raw: false
        });
        if (!cash) {
            return null;
        }
        await cash.destroy(); // hard delete
        return cash;
    } catch (error) {
        console.error(`Error al eliminar la caja ${cashInfo}`, error.message);
        throw new Error(`Error al eliminar la Caja: ${error.message}`);
    }
};