import { DataTypes, Op } from "sequelize";
import { getSequelizeConfig } from "../config/mysql.js";

const connection = getSequelizeConfig();

export const Person = connection.define('Person', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    dni: {
        type: DataTypes.STRING(9),
        unique: true,
        allowNull: false,
    },
    isVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    tableName: 'persons',
    timestamps: false,
});


/**
 * Crea una nueva persona.
 *
 * @async
 * @function createNewPerson
 * @param {object} data - Datos de la nueva persona.
 * @returns {Promise<object|null>} - La nueva persona creada o null si ya existe.
 * @throws {Error} - Lanza un error si hay un problema al crear la persona.
 */
export async function createNewPerson(data) {
    try {
        const uniqueFields = ["dni"];
        const person = await Person.findOne({
            where: {
                [Op.or]: uniqueFields.map((field) => ({ [field]: data[field] }))
            }
        });
        if (person) {
            return null;
        }
        const newPerson = await Person.create(data);
        return newPerson.dataValues;
    } catch (error) {
        console.error('Error al crear Persona:', error.message);
        throw new Error(`Error al crear Persona: ${error.message}`);
    }
};

/**
 * Obtiene todas las personas.
 *
 * @async
 * @function getAllPersons
 * @returns {Promise<object[]>} - Lista de todas las personas.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getAllPersons() {
    try {
        return await Person.findAll({ raw: true });
    } catch (error) {
        console.error('Error al consultar la base de datos: ', error.message);
        throw new Error(`Error al consultar la base de datos: ${error.message}`);
    }
};

/**
 * Obtiene una persona por ID o DNI
 *
 * @async
 * @function getOnePerson
 * @param {string|number} data - ID o DNI.
 * @returns {Promise<object|null>} - La persona encontrada o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getOnePerson(data) {
    try {
        const fields = ["id", "dni"];
        const searchValue = typeof data === 'string' ? data.trim() : data;
        const person = await Person.findOne({
            where: {
                [Op.or]: fields.map((field) => ({ [field]: searchValue }))
            },
            raw: true
        });
        if (!person) {
            return null;
        }
        return person;
    } catch (error) {
        console.error(`Error al buscar persona con Id o DNI "${data}":`, error.message);
        throw new Error(`Error al buscar persona con Id o DNI "${data}": ${error.message}`);
    }
};

/**
 * Actualiza una persona por ID o DNI
 *
 * @async
 * @function updateOnePerson
 * @param {string[]} personInfo - Array de campos para buscar la persona (id, dni).
 * @param {object} newData - Datos para actualizar la persona.
 * @returns {Promise<object|null>} - La persona actualizada o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al actualizar la persona.
 */
export async function updateOnePerson(personInfo, newData) {
    try {
        const person = await Person.findOne({
            where: {
                [Op.or]: personInfo.map((field) => ({ [field]: newData[field] }))
            },
            raw: true
        });
        if (!person) {
            return null;
        }
        await Person.update(newData, {
            where: {
                [Op.or]: personInfo.map((field) => ({ [field]: newData[field] }))
            }
        });
        return person;
    } catch (error) {
        console.error('Error al actualizar persona:', error.message);
        throw new Error(`Error al actualizar persona: ${error.message}`);
    }
}

/**
 * Elimina (soft delete) una persona por ID o DNI
 *
 * @async
 * @function deletePerson
 * @param {string[]} personInfo - Array de campos para buscar la persona (id, dni).
 * @returns {Promise<object|null>} - La persona modificada (eliminada) o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al eliminar la persona.
 */
export async function deletePerson(personInfo) {
    try {
        const person = await Person.findOne({
            where: {
                [Op.or]: personInfo.map((field) => ({ [field]: personInfo[field] }))
            },
            raw: false
        });
        if (!person) {
            return null;
        }
        // Si tienes un campo isVisible, puedes usarlo para soft delete
        if ('isVisible' in person) {
            person.isVisible = false;
            await person.save();
        } else {
            await person.destroy(); // hard delete si no existe isVisible
        }
        return person;
    } catch (error) {
        console.error(`Error al eliminar la persona ${personInfo}`, error.message);
        throw new Error(`Error al eliminar la Persona: ${error.message}`);
    }
};