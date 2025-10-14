// models/outcome.ts
import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";

const connection = getSequelizeConfig();

/** Tipos para los atributos del modelo */
export enum OutcomeCategory {
  FIJOS = "Fijos",
  VARIABLES = "Variables",
  OTRO = "Otro",
}

export interface OutcomeAttributes {
  id: number;
  cash_id: number;
  week_id: number;
  date: string;
  amount: number; // DECIMAL -> number en TypeScript para cálculos
  description: string;
  category: OutcomeCategory;
}

/** Campos opcionales al crear un Outcome (id auto-incremental) */
export interface OutcomeCreationAttributes extends Optional<OutcomeAttributes, "id"> {}

/** Clase del modelo tipada */
export class OutcomeModel extends Model<OutcomeAttributes, OutcomeCreationAttributes> implements OutcomeAttributes {
  declare id: number;
  declare cash_id: number;
  declare week_id: number;
  declare date: string;
  declare amount: number;
  declare description: string;
  declare category: OutcomeCategory;
}

/** Inicialización del modelo */
OutcomeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(...Object.values(OutcomeCategory)),
      allowNull: false,
    },
  },
  {
    sequelize: connection,
    tableName: "outcomes",
    timestamps: false,
    modelName: 'Outcome'
  }
);