import { DataTypes, Model, type Optional } from "sequelize";
import { getSequelizeConfig } from "@config/sequelize.config.js";
import { INCOME_SOURCES, type IncomeSource } from "@economic-control/shared";

const connection = getSequelizeConfig();

// Interfaces para el modelo Income
export interface IncomeAttributes {
  id: number;
  person_id: number | null; // Usar 'null' para manejar la opcionalidad explícitamente en la base de datos
  cash_id: number;
  week_id: number;
  date: Date;
  amount: number;
  source: IncomeSource;
}

export type IncomeSearchData = {
  id?: number;
  person_id?: number;
  cash_id?: number;
  week_id?: number;
  date?: Date;
  source?: string | IncomeSource;
};

// Opcionalidad para la creación (id es auto-generado)
export interface IncomeCreationAttributes extends Optional<
  IncomeAttributes,
  "id" | "person_id"
> { }

// Definición del modelo
export class IncomeModel
  extends Model<IncomeAttributes, IncomeCreationAttributes>
  implements IncomeAttributes {
  declare id: number;
  declare person_id: number | null;
  declare cash_id: number;
  declare week_id: number;
  declare date: Date;
  declare amount: number;
  declare source: IncomeSource;
}

// Inicialización del modelo
IncomeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    person_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "persons",
        key: "id",
      },
    },
    cash_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "cashes",
        key: "id",
      },
    },
    week_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "weeks",
        key: "id",
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      get() {
        const val = this.getDataValue("amount");
        return val ? parseFloat(String(val)) : 0;
      },
    },
    source: {
      type: DataTypes.ENUM(...INCOME_SOURCES),
      allowNull: false,
    },
  },
  {
    sequelize: connection,
    tableName: "incomes",
    timestamps: false,
    modelName: "Income",
  },
);