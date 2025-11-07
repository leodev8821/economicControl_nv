import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";

const connection = getSequelizeConfig();

// Interfaces para el modelo Cash
export interface CashAttributes {
    id: number;
    name: string;
    actual_amount: number;
    pettyCash_limit: number | null;
}

// Tipo para criterios de búsqueda simple
export type CashSearchData = {
    id?: number;
    name?: string;
};

// Opcionalidad para la creación (id es auto-generado, pettyCash_limit tiene un valor por defecto)
export interface CashCreationAttributes extends Optional<CashAttributes, 'id' | 'pettyCash_limit'> {}

// Definición del modelo con tipado
export class CashModel extends Model<CashAttributes, CashCreationAttributes> implements CashAttributes {
    declare id: number;
    declare name: string;
    declare actual_amount: number;
    declare pettyCash_limit: number | null;
}

// Inicialización del modelo
CashModel.init({
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
        defaultValue: null, // Cambiado a null para ser coherente con la interfaz
    },
}, {
    sequelize: connection,
    tableName: 'cashes',
    timestamps: false,
    modelName: 'Cash'
});

export class CashActions {

    /**
     * Obtiene todas las cajas de la base de datos.
     * @returns promise con un array de objetos CashAttributes.
     */
    public static async getAll(): Promise<CashAttributes[]> {
        const cashs = await CashModel.findAll();
        return cashs.map(cash => cash.get({ plain: true }));
    }

    /**
     * obtiene una caja que cumpla con los criterios de búsqueda proporcionados.
     * @param data criterios de búsqueda.
     * @returns promise con un objeto CashAttributes o null si no se encuentra ninguna caja.
     */
    public static async getOne(data: CashSearchData): Promise<CashAttributes | null> {
        const cash = await CashModel.findOne({ where: data});
        return cash ? cash.get({ plain: true }) : null;
    }

    /**
     * Crea una nueva caja en la base de datos.
     * @param data datos de la caja a crear.
     * @returns promise con el objeto CashAttributes creado.
     */
    public static async create(data: CashCreationAttributes): Promise<CashAttributes> {
        const newCash = await CashModel.create(data);
        return newCash.get({ plain: true });
    }

    /**
     * Elimina una caja de la base de datos por su ID.
     * @param data criterios de búsqueda para la caja a eliminar.
     * @returns promise con un booleano que indica si la eliminación fue exitosa.
     */
    public static async delete(data: CashSearchData): Promise<boolean> {
        const deletedCount = await CashModel.destroy({ where: data });
        return deletedCount > 0;
    }

    /**
     * Actualiza una caja existente en la base de datos.
     * @param id ID de la caja a actualizar.
     * @param data datos a actualizar.
     * @returns promise con un booleano que indica si la actualización fue exitosa.
     */
    public static async update(id: number, data: Partial<CashCreationAttributes>): Promise<CashAttributes | null> {
        const [updatedCount] = await CashModel.update(data, { where: { id } });
        if(updatedCount === 0) {
            return null;
        }
        const updatedCash = await CashModel.findByPk(id);
        return updatedCash ? updatedCash.get({ plain: true }) : null;
    }
}