import { DataTypes, Model, type Optional } from "sequelize";
import { getSequelizeConfig } from "@config/sequelize.config.js";

const connection = getSequelizeConfig();

/** Tipos del modelo */
export interface PersonAttributes {
  id: number;
  first_name: string;
  last_name: string;
  dni: string;
  is_visible: boolean;
}

export type PersonSearchData = {
  id?: number;
  first_name?: string;
  last_name?: string;
  dni?: string | undefined;
  is_visible?: boolean;
};

/** Campos opcionales al crear (id autoincremental, is_visible tiene un valor por defecto) */
export interface PersonCreationAttributes extends Optional<
  PersonAttributes,
  "id" | "is_visible"
> {}

/** Clase tipada de Sequelize */
export class PersonModel
  extends Model<PersonAttributes, PersonCreationAttributes>
  implements PersonAttributes
{
  declare id: number;
  declare first_name: string;
  declare last_name: string;
  declare dni: string;
  declare is_visible: boolean;
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
    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize: connection,
    tableName: "persons",
    timestamps: false,
    modelName: "Person",
  },
);