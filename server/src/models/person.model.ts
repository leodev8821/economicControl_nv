import { DataTypes, Model as SequelizeModel, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";

const connection = getSequelizeConfig();

/** Tipos del modelo */
export interface PersonAttributes {
  id: number;
  first_name: string;
  last_name: string;
  dni: string;
  isVisible: boolean;
}

/** Campos opcionales al crear (id autoincremental, isVisible tiene un valor por defecto) */
export interface PersonCreationAttributes extends Optional<PersonAttributes, "id" | "isVisible"> {}

/** Clase tipada de Sequelize */
export class PersonModel extends SequelizeModel<PersonAttributes, PersonCreationAttributes> implements PersonAttributes {
  declare id: number;
  declare first_name: string;
  declare last_name: string;
  declare dni: string;
  declare isVisible: boolean;
}

/** Inicialización del modelo */
PersonModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    dni: {
      type: DataTypes.STRING(9),
      unique: true,
      allowNull: false,
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize: connection,
    tableName: "persons",
    timestamps: false,
    modelName: 'Person'
  }
);