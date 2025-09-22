import { DataTypes, Op, Model, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";

const connection = getSequelizeConfig();

// Interfaces para el modelo Cash
export interface CashAttributes {
    id: number;
    name: string;
    actual_amount: number;
    pettyCash_limit?: number | null | undefined; // Puede ser null en la base de datos
}

export interface CashCreationAttributes extends Optional<CashAttributes, 'id' | 'pettyCash_limit'> {
    pettyCash_limit?: number | null | undefined;
}

// Definición del modelo con tipado
class CashModel extends Model<CashAttributes, CashCreationAttributes> implements CashAttributes {
    public id!: number;
    public name!: string;
    public actual_amount!: number;
    public pettyCash_limit?: number | null;
}

// Inicialización del modelo
(CashModel as unknown as typeof Model).init({
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
    sequelize: connection,
    tableName: 'cashes',
    timestamps: false,
    modelName: 'Cash'
});

// Extender el tipo de instancia del modelo
interface ICashModel extends CashModel {
    get: (options: { plain: true }) => CashAttributes;
}

export const Cash = CashModel as unknown as typeof CashModel & {
    new (): ICashModel;
    findOne: (options: any) => Promise<ICashModel | null>;
    findAll: (options: any) => Promise<ICashModel[]>;
    create: (data: CreateCashData) => Promise<ICashModel>;
    update: (data: UpdateCashData, options: any) => Promise<[number]>;
    destroy: (options: any) => Promise<number>;
};

// Tipos para las funciones
type CashSearchValue = string | number;
type CashSearchObject = Partial<Record<CashField, CashSearchValue>>;
type CashField = keyof Pick<CashAttributes, 'id' | 'name'>;
type CreateCashData = Omit<CashCreationAttributes, 'id'>;
type UpdateCashData = Partial<CashCreationAttributes>;

/**
 * Crea una nueva caja.
 * @async
 * @function createNewCash
 * @param {CreateCashData} data - Datos de la nueva caja.
 * @returns {Promise<CashAttributes|null>} - La nueva caja creada o null si ya existe.
 * @throws {Error} - Lanza un error si hay un problema al crear la caja.
 */
export async function createNewCash(data: CreateCashData): Promise<CashAttributes | null> {
    try {
        const uniqueFields: (keyof CreateCashData)[] = ["name"];
        const cash = await Cash.findOne({
            where: {
                [Op.or]: uniqueFields.map((field) => ({ [field]: data[field] }))
            },
            raw: true
        });
        
        if (cash) {
            return null;
        }
        
        const newCash = await Cash.create(data);
        return newCash.get({ plain: true });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error al crear Caja:', errorMessage);
        throw new Error(`Error al crear Caja: ${errorMessage}`);
    }
}

/**
 * Obtiene todas las cajas.
 * @async
 * @function getAllCash
 * @returns {Promise<CashAttributes[]>} - Lista de todas las cajas.
 * @throws {Error} - Lanza un error si hay un problema al consultar la base de datos.
 */
export async function getAllCash(): Promise<CashAttributes[]> {
    try {
        return await Cash.findAll({ raw: true });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error al consultar la base de datos: ', errorMessage);
        throw new Error(`Error al consultar la base de datos: ${errorMessage}`);
    }
}

/**
 * Obtiene una caja por ID o nombre.
 * @async
 * @function getOneCash
 * @param {CashSearchValue | CashSearchObject} data - ID, nombre o un objeto con campos a buscar.
 * @returns {Promise<CashAttributes|null>} - La caja encontrada o null si no existe.
 */
export async function getOneCash(data: CashSearchValue | CashSearchObject): Promise<CashAttributes | null> {
    try {
        const fields: CashField[] = ["id", "name"];
        const whereClause = typeof data === 'object'
            ? Object.entries(data).map(([key, value]) => ({ [key]: value }))
            : fields.map((field) => ({ [field]: data }));

        const cash = await Cash.findOne({
            where: { [Op.or]: whereClause },
            raw: true
        });

        return cash;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error(`Error al buscar caja con Id o nombre "${JSON.stringify(data)}":`, errorMessage);
        throw new Error(`Error al buscar caja con Id o nombre "${JSON.stringify(data)}": ${errorMessage}`);
    }
}

/**
 * Actualiza una caja por ID.
 * @async
 * @function updateOneCash
 * @param {number} id - ID de la caja a actualizar.
 * @param {UpdateCashData} newData - Datos para actualizar la caja.
 * @returns {Promise<CashAttributes|null>} - La caja actualizada o null si no existe.
 */
export async function updateOneCash(
    id: number,
    newData: UpdateCashData
): Promise<CashAttributes | null> {
    try {
        const cash = await Cash.findOne({
            where: { id },
            raw: true
        });

        if (!cash) {
            return null;
        }

        await Cash.update(newData, {
            where: { id }
        });

        const updatedCash = await Cash.findOne({
            where: { id },
            raw: true
        });

        return updatedCash;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Error al actualizar caja:', errorMessage);
        throw new Error(`Error al actualizar caja: ${errorMessage}`);
    }
}

/**
 * Elimina una caja por ID o nombre
 * @async
 * @function deleteCash
 * @param {Record<CashField, CashSearchValue>} cashInfo - Objeto con campos para buscar la caja (id, name).
 * @returns {Promise<CashModel|null>} - La caja eliminada o null si no existe.
 * @throws {Error} - Lanza un error si hay un problema al eliminar la caja.
 */
export async function deleteCash(cashInfo: Record<CashField, CashSearchValue>): Promise<CashAttributes | null> {
    try {
        const cash = await Cash.findOne({
            where: {
                [Op.or]: Object.keys(cashInfo).map((field) => ({ 
                    [field]: cashInfo[field as CashField] 
                }))
            },
            raw: true
        });
        
        if (!cash) {
            return null;
        }
        
        await Cash.destroy({ 
            where: {
                [Op.or]: Object.keys(cashInfo).map((field) => ({ 
                    [field]: cashInfo[field as CashField] 
                }))
            }
        });
        
        return cash; // Retornamos el objeto plano que encontramos antes de eliminar
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error(`Error al eliminar la caja ${JSON.stringify(cashInfo)}`, errorMessage);
        throw new Error(`Error al eliminar la Caja: ${errorMessage}`);
    }
}