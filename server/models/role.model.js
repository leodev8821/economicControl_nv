import { DataTypes } from "sequelize";
import { getSequelizeConfig } from "../config/mysql.js";

const connection = getSequelizeConfig();

/**
 * Atributos del modelo Rol.
 * @typedef {object} RoleAttributes
 * @property {number} id - ID único del Rol.
 * @property {number} role - ID del rol al que pertenece (mas alto, mas permisos).
 * 1 - Administrador
 * 2 - SuperUser (*^*)
 */
export const Role = connection.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    role: {
        type: DataTypes.ENUM('Administrador', 'SuperUser'),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'roles',
    timestamps: false,
});

export async function getAllRoles() {
    try{
        const roles = await Role.findAll({
            raw: true
        });
        return roles;
    } catch (error) {
        console.error("Error fetching roles:", error.message);
        throw new Error(`Could not fetch roles: ${error.message}`);
    }
    
}