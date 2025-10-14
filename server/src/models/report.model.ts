import { DataTypes, Model as SequelizeModel, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";

const connection = getSequelizeConfig();

/** Tipos para el modelo */
export interface ReportAttributes {
  id: number;
  week_id: number;
  total_income: number;
  total_outcome: number;
  net_balance: number;
}

/** Campos opcionales al crear (id autoincremental) */
export interface ReportCreationAttributes
  extends Optional<ReportAttributes, "id"> {}

/** Clase tipada de Sequelize */
export class ReportModel
  extends SequelizeModel<ReportAttributes, ReportCreationAttributes>
  implements ReportAttributes
{
  declare id: number;
  declare week_id: number;
  declare total_income: number;
  declare total_outcome: number;
  declare net_balance: number;
}

/** Inicialización del modelo */
ReportModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    week_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "weeks",
        key: "id",
      },
      unique: true, // Aseguramos que solo haya un informe por semana
    },
    total_income: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    total_outcome: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    net_balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
  },
  {
    sequelize: connection,
    tableName: "reports",
    timestamps: false,
    modelName: 'Report'
  }
);