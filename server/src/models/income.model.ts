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

export interface IncomeCreationAttributes extends Optional<IncomeAttributes, 'id'> {}

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
type DNI = string;
type CreateIncomeData = Omit<IncomeCreationAttributes, 'id'>;
export type UpdateIncomeData = Partial<IncomeCreationAttributes>;

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
 * Obtiene todos los ingresos para una fecha específica.
 * @async
 * @function getIncomeByDate
 * @param {string} date - La fecha en formato 'YYYY-MM-DD'.
 * @returns {Promise<IncomeAttributes[]>} - Lista de todos los ingresos de esa fecha.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getIncomeByDate(date: string): Promise<IncomeAttributes[]> {
    try {
        // La fecha debe tener un formato válido para la base de datos
        if (!date || date.trim() === '') {
            throw new Error('La fecha no puede estar vacía.');
        }

        // Validación para asegurar que la fecha tenga el formato 'YYYY-MM-DD'
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            throw new Error('Formato de fecha inválido. Debe ser YYYY-MM-DD.');
        }

        // Buscar todos los ingresos que coincidan con la fecha proporcionada
        return await Income.findAll({
            where: {
                date: date
            },
            raw: true
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error al obtener ingresos por fecha:', errorMessage);
        throw new Error(`Error al obtener ingresos por fecha: ${errorMessage}`);
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
        // Validar que los campos obligatorios tengan información
        if (!data.week_id || !data.date || !data.amount || !data.source) {
            throw new Error('Faltan datos obligatorios para crear el ingreso.');
        }

        if (data.person_id && typeof data.person_id !== 'number') {
            throw new Error('person_id debe ser un número válido.');
        }

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
         if (typeof id !== 'number' || isNaN(id) || id <= 0) {
            throw new Error('ID de ingreso inválido. Debe ser un número positivo.');
        }

        const income = await Income.findOne({
            where: { id },
            raw: true
        });
        
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
        if (typeof id !== 'number' || isNaN(id) || id <= 0) {
            throw new Error('ID de ingreso inválido. Debe ser un número positivo.');
        }

        if (Object.keys(newData).length === 0) {
            throw new Error('Se requiere al menos un campo para actualizar.');
        }

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
        if (typeof id !== 'number' || isNaN(id) || id <= 0) {
            throw new Error('ID de ingreso inválido. Debe ser un número positivo.');
        }

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

/**
 * Valida los datos para actualizar un ingreso
 * @param updateData - Datos a validar
 * @returns Objeto con validación exitosa o error
 */
export function validateUpdateIncomeData(updateData: any): { isValid: boolean; error?: string; validatedData?: UpdateIncomeData } {
    const validatedData: UpdateIncomeData = {};
    
    // Validar amount
    if (updateData.amount !== undefined) {
        if (typeof updateData.amount !== 'number' || updateData.amount < 0) {
            return { isValid: false, error: 'El monto debe ser un número positivo.' };
        }
        validatedData.amount = updateData.amount;
    }
    
    // Validar source
    if (updateData.source !== undefined) {
        if (!Object.values(IncomeSource).includes(updateData.source)) {
            return { 
                isValid: false, 
                error: `Fuente de ingreso inválida. Valores permitidos: ${Object.values(IncomeSource).join(', ')}` 
            };
        }
        validatedData.source = updateData.source;
    }
    
    // Validar person_id
    if (updateData.person_id !== undefined) {
        if (updateData.person_id !== null && (typeof updateData.person_id !== 'number' || updateData.person_id <= 0)) {
            return { isValid: false, error: 'person_id debe ser un número positivo o null.' };
        }
        validatedData.person_id = updateData.person_id;
    }
    
    // Validar week_id
    if (updateData.week_id !== undefined) {
        if (typeof updateData.week_id !== 'number' || updateData.week_id <= 0) {
            return { isValid: false, error: 'week_id debe ser un número positivo.' };
        }
        validatedData.week_id = updateData.week_id;
    }
    
    // Validar date
    if (updateData.date !== undefined) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(updateData.date)) {
            return { isValid: false, error: 'Formato de fecha inválido. Debe ser YYYY-MM-DD.' };
        }
        validatedData.date = updateData.date;
    }
    
    // Verificar que se proporcionó al menos un campo
    if (Object.keys(validatedData).length === 0) {
        return { isValid: false, error: 'No se proporcionaron datos para actualizar el ingreso.' };
    }
    
    return { isValid: true, validatedData };
}

/**
 * Valida un ID de ingreso
 * @param id - ID a validar (string o number)
 * @returns Objeto con validación exitosa o error
 */
export function validateIncomeId(id: string | number): { isValid: boolean; error?: string; validatedId?: number } {
    if (!id) {
        return { isValid: false, error: 'Falta el ID del ingreso.' };
    }
    
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    if (isNaN(numericId) || numericId <= 0) {
        return { isValid: false, error: 'ID de ingreso inválido. Debe ser un número positivo.' };
    }
    
    return { isValid: true, validatedId: numericId };
}

/**
 * Valida los datos para crear un nuevo ingreso
 * @param data - Datos a validar
 * @returns Objeto con validación exitosa o error
 */
export function validateCreateIncomeData(data: any): { isValid: boolean; error?: string; validatedData?: CreateIncomeData } {
    // Validar campos obligatorios
    if (!data.week_id || !data.date || !data.amount || !data.source) {
        return { isValid: false, error: 'Faltan datos obligatorios para crear el ingreso (week_id, date, amount, source).' };
    }

    // Validar amount
    if (typeof data.amount !== 'number' || data.amount < 0) {
        return { isValid: false, error: 'El monto debe ser un número positivo.' };
    }

    // Validar source
    if (!Object.values(IncomeSource).includes(data.source)) {
        return { 
            isValid: false, 
            error: `Fuente de ingreso inválida. Valores permitidos: ${Object.values(IncomeSource).join(', ')}` 
        };
    }

    // Validar week_id
    if (typeof data.week_id !== 'number' || data.week_id <= 0) {
        return { isValid: false, error: 'week_id debe ser un número positivo.' };
    }

    // Validar date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
        return { isValid: false, error: 'Formato de fecha inválido. Debe ser YYYY-MM-DD.' };
    }

    // Validar person_id si está presente
    if (data.person_id !== undefined && data.person_id !== null) {
        if (typeof data.person_id !== 'number' || data.person_id <= 0) {
            return { isValid: false, error: 'person_id debe ser un número positivo o null.' };
        }
    }

    const validatedData: CreateIncomeData = {
        amount: data.amount,
        source: data.source,
        week_id: data.week_id,
        date: data.date,
        ...(data.person_id !== undefined && { person_id: data.person_id })
    };

    return { isValid: true, validatedData };
}

/**
 * Valida un DNI
 * @param dni - DNI a validar
 * @returns Objeto con validación exitosa o error
 */
export function validateDNI(dni: string): { isValid: boolean; error?: string; validatedDni?: string } {
    if (!dni) {
        return { isValid: false, error: 'Falta el DNI de la persona.' };
    }

    if (typeof dni !== 'string' || dni.trim() === '') {
        return { isValid: false, error: 'DNI inválido.' };
    }

    return { isValid: true, validatedDni: dni.trim() };
}

/**
 * Valida una fecha
 * @param date - Fecha a validar
 * @returns Objeto con validación exitosa o error
 */
export function validateDate(date: string): { isValid: boolean; error?: string; validatedDate?: string } {
    if (!date) {
        return { isValid: false, error: 'Falta el parámetro de fecha.' };
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return { isValid: false, error: 'Formato de fecha inválido. Debe ser YYYY-MM-DD.' };
    }

    return { isValid: true, validatedDate: date };
}