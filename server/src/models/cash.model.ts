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