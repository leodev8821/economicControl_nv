import { DataTypes, Model as SequelizeModel, type Optional } from "sequelize";

import { getSequelizeConfig } from "@config/sequelize.config.js";

import { GENDER, STATUS, type StatusType } from "@economic-control/shared";

const connection = getSequelizeConfig();

/** Tipos del modelo */

export interface MemberAttributes {
  id: number;
  user_id: number | null;
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  birth_date: string;
  status: StatusType;
  visit_date: string;
  is_visible: boolean;
}

export type MemberSearchData = {
  id?: number;
  user_id?: number | null;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  birth_date?: string;
  status?: StatusType;
  visit_date?: string;
  is_visible?: boolean;
};

/** Campos opcionales al crear (id autoincremental, is_visible tiene un valor por defecto) */

export interface MemberCreationAttributes extends Optional<
  MemberAttributes,
  "id" | "is_visible" | "user_id"
> {}

/** Clase tipada de Sequelize */
export class MemberModel
  extends SequelizeModel<MemberAttributes, MemberCreationAttributes>
  implements MemberAttributes
{
  declare id: number;
  declare user_id: number | null;
  declare first_name: string;
  declare last_name: string;
  declare phone: string;
  declare gender: string;
  declare birth_date: string;
  declare status: StatusType;
  declare visit_date: string;
  declare is_visible: boolean;
}

/** Inicialización del modelo */

MemberModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },

    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING(15),
      unique: true,
      allowNull: false,
    },

    gender: {
      type: DataTypes.ENUM(...GENDER),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...STATUS),
      allowNull: false,
    },

    birth_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    visit_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },

  {
    sequelize: connection,
    tableName: "members",
    timestamps: false,
    modelName: "Member",
    scopes: {
      visible: {
        where: { is_visible: true },
      },
    },
  },
);
