import { DataTypes, Op, Model, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";
import { Person } from "./person.model"

const connection = getSequelizeConfig();

// Enum para los tipos de fuente de ingresos
export enum IncomeSource {
    DIEZMO = 'Diezmo',
    OFRENDA = 'Ofrenda',
    CAFETERIA = 'Cafetería',
    OTRO = 'Otro'
}

// Interfaces para el modelo Income
export interface IncomeAttributes {
    id: number;
    person_id?: number;
    week_id: number;
    date: string; // DATEONLY se maneja como string en formato 'YYYY-MM-DD'
    amount: number;
    source: IncomeSource;
}

interface IncomeCreationAttributes extends Optional<IncomeAttributes, 'id'> {}

// Definición del modelo con tipado
class IncomeModel extends Model<IncomeAttributes, IncomeCreationAttributes> implements IncomeAttributes {
    declare id: number;
    declare person_id?: number;
    declare week_id: number;
    declare date: string;
    declare amount: number;
    declare source: IncomeSource;
}

// Inicialización del modelo
(IncomeModel as unknown as typeof Model).init({
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
    sequelize: connection,
    tableName: 'incomes',
    timestamps: false,
    modelName: 'Income'
});

// Extender el tipo de instancia del modelo
interface IIncomeModel extends IncomeModel {
    get: (options: { plain: true }) => IncomeAttributes;
}

export const Income = IncomeModel as unknown as typeof IncomeModel & {
    new (): IIncomeModel;
    findOne: (options: any) => Promise<IIncomeModel | null>;
    findAll: (options: any) => Promise<IIncomeModel[]>;
    create: (data: CreateIncomeData) => Promise<IIncomeModel>;
    update: (data: UpdateIncomeData, options: any) => Promise<[number]>;
    destroy: (options: any) => Promise<number>;
};

// Tipos auxiliares
type DNI = string | number;
type CreateIncomeData = Omit<IncomeCreationAttributes, 'id'>;
type UpdateIncomeData = Partial<IncomeCreationAttributes>;

/**
 * Obtiene todos los ingresos de tipo 'Diezmo' para una persona usando su DNI.
 * @async
 * @function getTitheIncomesByPerson
 * @param {DNI} dni - DNI de la persona.
 * @returns {Promise<IncomeAttributes[]>} - Lista de ingresos de tipo 'Diezmo'.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getTitheIncomesByPerson(dni: DNI): Promise<IncomeAttributes[]> {
    try {
        const person = await Person.findOne({ where: { dni }, raw: true });
        if (!person) {
            throw new Error(`No se encontró persona con DNI: ${dni}`);
        }
        
        return await Income.findAll({
            where: {
                person_id: person.id,
                source: IncomeSource.DIEZMO
            },
            raw: true
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error al obtener ingresos Diezmo:', errorMessage);
        throw new Error(`Error al obtener ingresos Diezmo: ${errorMessage}`);
    }
}

/**
 * Crea un nuevo ingreso.
 * @async
 * @function createNewIncome
 * @param {CreateIncomeData} data - Datos del nuevo ingreso.
 * @returns {Promise<IncomeAttributes>} - El nuevo ingreso creado.
 * @throws {Error} - Lanza un error si hay un problema al crear el ingreso.
 */
export async function createNewIncome(data: CreateIncomeData): Promise<IncomeAttributes> {
    try {
        const newIncome = await Income.create(data);
        return newIncome.get({ plain: true });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error al crear Ingreso:', errorMessage);
        throw new Error(`Error al crear Ingreso: ${errorMessage}`);
    }
}

/**
 * Obtiene todos los ingresos.
 * @async
 * @function getAllIncomes
 * @returns {Promise<IncomeAttributes[]>} - Lista de todos los ingresos.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getAllIncomes(): Promise<IncomeAttributes[]> {
    try {
        return await Income.findAll({ raw: true });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error al consultar la base de datos: ', errorMessage);
        throw new Error(`Error al consultar la base de datos: ${errorMessage}`);
    }
}

/**
 * Obtiene un ingreso por ID.
 * @async
 * @function getOneIncome
 * @param {number} id - ID del ingreso.
 * @returns {Promise<IncomeAttributes|null>} - El ingreso encontrado o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getOneIncome(id: number): Promise<IncomeAttributes | null> {
    try {
        const income = await Income.findOne({
            where: { id },
            raw: true
        });
        
        if (!income) {
            return null;
        }
        
        return income;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error(`Error al buscar ingreso con Id "${id}":`, errorMessage);
        throw new Error(`Error al buscar ingreso con Id "${id}": ${errorMessage}`);
    }
}

/**
 * Actualiza un ingreso por ID.
 * @async
 * @function updateOneIncome
 * @param {number} id - ID del ingreso.
 * @param {UpdateIncomeData} newData - Datos para actualizar el ingreso.
 * @returns {Promise<IncomeAttributes|null>} - El ingreso actualizado o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al actualizar el ingreso.
 */
export async function updateOneIncome(id: number, newData: UpdateIncomeData): Promise<IncomeAttributes | null> {
    try {
        const income = await Income.findOne({
            where: { id },
            raw: true
        });
        
        if (!income) {
            return null;
        }
        
        await Income.update(newData, { where: { id } });
        
        // Obtener el registro actualizado
        const updatedIncome = await Income.findOne({
            where: { id },
            raw: true
        });
        
        return updatedIncome;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error al actualizar ingreso:', errorMessage);
        throw new Error(`Error al actualizar ingreso: ${errorMessage}`);
    }
}

/**
 * Elimina un ingreso por ID.
 * @async
 * @function deleteIncome
 * @param {number} id - ID del ingreso.
 * @returns {Promise<IncomeModel|null>} - El ingreso eliminado o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al eliminar el ingreso.
 */
export async function deleteIncome(id: number): Promise<IncomeAttributes | null> {
    try {
        const income = await Income.findOne({
            where: { id },
            raw: true
        });
        
        if (!income) {
            return null;
        }
        
        await Income.destroy({ where: { id } });
        return income; // Retornamos el objeto plano que encontramos antes de eliminar
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error(`Error al eliminar el ingreso ${id}`, errorMessage);
        throw new Error(`Error al eliminar el Ingreso: ${errorMessage}`);
    }
}