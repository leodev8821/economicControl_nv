// models/role.ts
import { DataTypes, Model as SequelizeModel, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";

const connection = getSequelizeConfig();

/**
 * Posibles valores para el campo role.
 */
export enum RoleType {
  ADMINISTRADOR = "Administrador",
  SUPER_USER = "SuperUser",
}

/**
 * Atributos del modelo Role.
 */
export interface RoleAttributes {
  id: number;
  role: RoleType;
}

/**
 * Atributos para creación de Role (id es opcional porque es autoincremental).
 */
export interface RoleCreationAttributes extends Optional<RoleAttributes, "id"> {}

/**
 * Clase Role que extiende de Sequelize.Model
 */
export class RoleModel extends SequelizeModel<RoleAttributes, RoleCreationAttributes> implements RoleAttributes
{
  declare id: number;
  declare role: RoleType;
}

/** Inicialización del modelo */
RoleModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(RoleType)),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize: connection,
    tableName: "roles",
    timestamps: false,
    modelName: 'Role'
  }
);