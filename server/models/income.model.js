import { DataTypes, Op } from "sequelize";
import { getSequelizeConfig } from "../config/mysql.js";
import { Person } from "./person.model.js";

const connection = getSequelizeConfig();

export const Income = connection.define('Income', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    person_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'persons',
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
    source: {
        type: DataTypes.ENUM('Diezmo', 'Ofrenda', 'Cafetería', 'Otro'),
        allowNull: false,
    }
}, {
    tableName: 'incomes',
    timestamps: false,
});

/**
 * Obtiene todos los ingresos de tipo 'Diezmo' para una persona usando su DNI.
 * @async
 * @function getTitheIncomesByPerson
 * @param {string|number} dni - DNI de la persona.
 * @returns {Promise<object[]>} - Lista de ingresos de tipo 'Diezmo'.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getTitheIncomesByPerson(dni) {
    try {
        const person = await Person.findOne({ where: { dni }, raw: true });
        if (!person) {
            throw new Error(`No se encontró persona con DNI: ${dni}`);
        }
        return await Income.findAll({
            where: {
                person_id: person.id,
                source: 'Diezmo'
            },
            raw: true
        });
    } catch (error) {
        console.error('Error al obtener ingresos Diezmo:', error.message);
        throw new Error(`Error al obtener ingresos Diezmo: ${error.message}`);
    }
}

/**
 * Crea un nuevo ingreso.
 * @async
 * @function createNewIncome
 * @param {object} data - Datos del nuevo ingreso.
 * @returns {Promise<object>} - El nuevo ingreso creado.
 * @throws {Error} - Lanza un error si hay un problema al crear el ingreso.
 */
export async function createNewIncome(data) {
    try {
        const newIncome = await Income.create(data);
        return newIncome.dataValues;
    } catch (error) {
        console.error('Error al crear Ingreso:', error.message);
        throw new Error(`Error al crear Ingreso: ${error.message}`);
    }
};

/**
 * Obtiene todos los ingresos.
 * @async
 * @function getAllIncomes
 * @returns {Promise<object[]>} - Lista de todos los ingresos.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getAllIncomes() {
    try {
        return await Income.findAll({ raw: true });
    } catch (error) {
        console.error('Error al consultar la base de datos: ', error.message);
        throw new Error(`Error al consultar la base de datos: ${error.message}`);
    }
};

/**
 * Obtiene un ingreso por ID.
 * @async
 * @function getOneIncome
 * @param {number} id - ID del ingreso.
 * @returns {Promise<object|null>} - El ingreso encontrado o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getOneIncome(id) {
    try {
        const income = await Income.findOne({
            where: { id },
            raw: true
        });
        if (!income) {
            return null;
        }
        return income;
    } catch (error) {
        console.error(`Error al buscar ingreso con Id "${id}":`, error.message);
        throw new Error(`Error al buscar ingreso con Id "${id}": ${error.message}`);
    }
};

/**
 * Actualiza un ingreso por ID.
 * @async
 * @function updateOneIncome
 * @param {number} id - ID del ingreso.
 * @param {object} newData - Datos para actualizar el ingreso.
 * @returns {Promise<object|null>} - El ingreso actualizado o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al actualizar el ingreso.
 */
export async function updateOneIncome(id, newData) {
    try {
        const income = await Income.findOne({
            where: { id },
            raw: true
        });
        if (!income) {
            return null;
        }
        await Income.update(newData, { where: { id } });
        return { ...income, ...newData };
    } catch (error) {
        console.error('Error al actualizar ingreso:', error.message);
        throw new Error(`Error al actualizar ingreso: ${error.message}`);
    }
}


/**
 * Elimina un ingreso por ID.
 * @async
 * @function deleteIncome
 * @param {number} id - ID del ingreso.
 * @returns {Promise<object|null>} - El ingreso eliminado o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al eliminar el ingreso.
 */
export async function deleteIncome(id) {
    try {
        const income = await Income.findOne({
            where: { id },
            raw: false
        });
        if (!income) {
            return null;
        }
        await income.destroy(); // hard delete
        return income;
    } catch (error) {
        console.error(`Error al eliminar el ingreso ${id}`, error.message);
        throw new Error(`Error al eliminar el Ingreso: ${error.message}`);
    }
};