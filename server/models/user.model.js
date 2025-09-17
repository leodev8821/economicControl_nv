import { DataTypes, Op } from "sequelize";
import bcrypt from "bcryptjs";
import { getSequelizeConfig } from "../config/mysql.js";
import { Role } from "./role.model.js";

const connection = getSequelizeConfig();


export const User = connection.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    role: {
        type: DataTypes.ENUM('Administrador', 'SuperUser'),
        allowNull: false,
        references: {
            model: 'roles',
            key: 'role',
        },
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    tableName: 'users',
    timestamps: false,
    hooks: {
        beforeValidate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);
                user.password = hashedPassword;
            }
        }
    }
});


/**
 * Crea un nuevo usuario.
 *
 * @async
 * @function createNewUser
 * @param {object} data - Datos del nuevo usuario.
 * @returns {Promise<UserAttributes|null>} - El nuevo usuario creado o null si ya existe.
 * @throws {Error} - Lanza un error si hay un problema al crear el usuario.
 */
export async function createNewUser(data) {
    try {
        const loginData = ["username"];
        const user = await User.findOne({
            where: {
                [Op.or]: loginData.map((field) => ({ [field]: data[field] }))
            }
        });
        if (user) {
            return null;
        }
        const newUser = await User.create(data);
        return newUser.dataValues;
    } catch (error) {
        console.error('Error al crear Usuario:', error.message);
        throw new Error(`Error al crear Usuario: ${error.message}`);
    }
};

/**
 * Obtiene todos los usuarios.
 *
 * @async
 * @function getAllUsers
 * @returns {Promise<UserAttributes[]>} - Lista de todos los usuarios.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getAllUsers() {
    try {
        return await User.findAll({raw: true});
    } catch (error) {
        console.error('Error al consultar la base de datos: ', error.message);
        throw new Error(`Error al consultar la base de datos: ${error.message}`);
    }
};

/**
 * Obtiene un usuario por ID, nombre de usuario
 *
 * @async
 * @function getOneUser
 * @param {string|number} data - ID, nombre de usuario.
 * @returns {Promise<UserAttributes|null>} - El usuario encontrado o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getOneUser(data) {
    try {
        const fields = ["id", "username"];
        const searchValue = data.trim();
        const user = await User.findOne({
            where: {
                [Op.and]: [
                    { isVisible: 1 }
                ],
                [Op.or]: fields.map((field) => ({ [field]: searchValue }))
            },
            raw: true
        });
        if (!user) {
            return null;
        }
        return user;
    } catch (error) {
        console.error(`Error al buscar usuario con Id, username "${data}":`, error.message);
        throw new Error(`Error al buscar usuario con Id, username "${data}": ${error.message}`);
    }
};

/**
 * Actualiza un usuario por ID, nombre de usuario
 *
 * @async
 * @function updateOneUser
 * @param {string[]} userInfo - Array de campos para buscar el usuario (id, username).
 * @param {object} newData - Datos para actualizar el usuario.
 * @returns {Promise<UserAttributes|null>} - El usuario actualizado o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al actualizar el usuario.
 */
export async function updateOneUser(userInfo, newData) {
    try {
        const user = await User.findOne({
            where: {
                [Op.or]: userInfo.map((field) => ({ [field]: data[field] }))
            },
            raw: true
        });
        if (!user) {
            return null;
        }
        await User.update(newData, {
            where: {
                [Op.or]: userInfo.map((field) => ({ [field]: data[field] }))
            }
        });
        return user;
    } catch (error) {
        console.error('Error al actualizar usuario:', error.message);
        throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
}

/**
 * Elimina (establece isVisible = 0) un usuario por ID, nombre de usuario
 *
 * @async
 * @function deleteUser
 * @param {string[]} userInfo - Array de campos para buscar el usuario (id, username).
 * @returns {Promise<UserAttributes|null>} - El usuario modificado (eliminado) o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al eliminar el usuario.
 */
export async function deleteUser(userInfo) {
    try {
        const user = await User.findOne({
            where: {
                [Op.or]: userInfo.map((field) => ({ [field]: data[field] }))
            },
            raw: true
        });
        if (!user) {
            return null;
        }
        user.isVisible = false;
        await user.save();
        return user;
    } catch (error) {
        console.error(`Error al eliminar el usuario ${userInfo}`, error.message);
        throw new Error(`Error al eliminar el Usuario: ${error.message}`);
    }
};