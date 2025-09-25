// models/week.ts
import { DataTypes, Model as SequelizeModel, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";

const connection = getSequelizeConfig();

/** Tipos del modelo */
export interface WeekAttributes {
  id: number;
  week_start: string; // DATEONLY -> string (YYYY-MM-DD)
  week_end: string;   // DATEONLY -> string (YYYY-MM-DD)
}

/** Campos opcionales al crear (id autoincremental) */
export interface WeekCreationAttributes extends Optional<WeekAttributes, 'id'> {}

/** Clase tipada Sequelize */
export class WeekModel extends SequelizeModel<WeekAttributes, WeekCreationAttributes> implements WeekAttributes {
  public id!: number;
  public week_start!: string;
  public week_end!: string;
}

/** Inicialización del modelo */
WeekModel.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  week_start: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
  week_end: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  }
}, {
  sequelize: connection,
  tableName: 'weeks',
  timestamps: false,
  modelName: 'Week'
});