import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";

const connection = getSequelizeConfig();

export enum IncomeSource {
    DIEZMO = 'Diezmo',
    OFRENDA = 'Ofrenda',
    CAFETERIA = 'Cafetería',
    OTRO = 'Otro'
}

// Interfaces para el modelo Income
export interface IncomeAttributes {
    id: number;
    person_id: number | null; // Usar 'null' para manejar la opcionalidad explícitamente en la base de datos
    week_id: number;
    date: string;
    amount: number;
    source: IncomeSource;
}

// Opcionalidad para la creación (id es auto-generado)
export interface IncomeCreationAttributes extends Optional<IncomeAttributes, 'id' | 'person_id'> {}

// Definición del modelo
export class IncomeModel extends Model<IncomeAttributes, IncomeCreationAttributes> implements IncomeAttributes {
    declare id: number;
    declare person_id: number | null;
    declare week_id: number;
    declare date: string;
    declare amount: number;
    declare source: IncomeSource;
}

// Inicialización del modelo
IncomeModel.init({
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
        type: DataTypes.ENUM(...Object.values(IncomeSource)),
        allowNull: false,
    }
}, {
    sequelize: connection,
    tableName: 'incomes',
    timestamps: false,
    modelName: 'Income'
});