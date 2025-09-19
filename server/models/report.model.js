import { DataTypes } from "sequelize";
import { getSequelizeConfig } from "../config/mysql.js";

const connection = getSequelizeConfig();

export const Report = connection.define('Report', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    week_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'weeks',
            key: 'id',
        },
    },
    total_income: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    total_outcome: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    net_balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    }
}, {
    tableName: 'reports',
    timestamps: false,
});


/**
 * Obtiene el informe único de una semana.
 * @async
 * @function getReportByWeek
 * @param {number} weekId - ID de la semana.
 * @returns {Promise<object|null>} - El informe de la semana o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getReportByWeek(weekId) {
    try {
        return await Report.findOne({
            where: { week_id: weekId },
            raw: true
        });
    } catch (error) {
        console.error('Error al obtener informe por semana:', error.message);
        throw new Error(`Error al obtener informe por semana: ${error.message}`);
    }
}

/**
 * Crea un nuevo informe.
 * @async
 * @function createNewReport
 * @param {object} data - Datos del nuevo informe.
 * @returns {Promise<object|null>} - El nuevo informe creado o null si ya existe para la semana.
 * @throws {Error} - Lanza un error si hay un problema al crear el informe.
 */
export async function createNewReport(data) {
    try {
        // Solo uno por semana
        const existing = await Report.findOne({ where: { week_id: data.week_id } });
        if (existing) {
            return null;
        }
        const newReport = await Report.create(data);
        return newReport.dataValues;
    } catch (error) {
        console.error('Error al crear Informe:', error.message);
        throw new Error(`Error al crear Informe: ${error.message}`);
    }
};

/**
 * Obtiene todos los informes.
 * @async
 * @function getAllReports
 * @returns {Promise<object[]>} - Lista de todos los informes.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getAllReports() {
    try {
        return await Report.findAll({ raw: true });
    } catch (error) {
        console.error('Error al consultar la base de datos: ', error.message);
        throw new Error(`Error al consultar la base de datos: ${error.message}`);
    }
};

/**
 * Obtiene un informe por ID.
 * @async
 * @function getOneReport
 * @param {number} id - ID del informe.
 * @returns {Promise<object|null>} - El informe encontrado o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getOneReport(id) {
    try {
        const report = await Report.findOne({
            where: { id },
            raw: true
        });
        if (!report) {
            return null;
        }
        return report;
    } catch (error) {
        console.error(`Error al buscar informe con Id "${id}":`, error.message);
        throw new Error(`Error al buscar informe con Id "${id}": ${error.message}`);
    }
};

/**
 * Actualiza un informe por ID.
 * @async
 * @function updateOneReport
 * @param {number} id - ID del informe.
 * @param {object} newData - Datos para actualizar el informe.
 * @returns {Promise<object|null>} - El informe actualizado o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al actualizar el informe.
 */
export async function updateOneReport(id, newData) {
    try {
        const report = await Report.findOne({
            where: { id },
            raw: true
        });
        if (!report) {
            return null;
        }
        await Report.update(newData, { where: { id } });
        return { ...report, ...newData };
    } catch (error) {
        console.error('Error al actualizar informe:', error.message);
        throw new Error(`Error al actualizar informe: ${error.message}`);
    }
}

/**
 * Elimina un informe por ID.
 * @async
 * @function deleteReport
 * @param {number} id - ID del informe.
 * @returns {Promise<object|null>} - El informe eliminado o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al eliminar el informe.
 */
export async function deleteReport(id) {
    try {
        const report = await Report.findOne({
            where: { id },
            raw: false
        });
        if (!report) {
            return null;
        }
        await report.destroy(); // hard delete
        return report;
    } catch (error) {
        console.error(`Error al eliminar el informe ${id}`, error.message);
        throw new Error(`Error al eliminar el Informe: ${error.message}`);
    }
};

