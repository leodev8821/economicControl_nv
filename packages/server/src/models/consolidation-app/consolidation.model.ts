import { DataTypes, Model, type Optional } from "sequelize";
import { getSequelizeConfig } from "../../config/sequelize.config.js";
import {
  CALL_OBSERVATIONS,
  type CallObservationType,
} from "@economic-control/shared";

const connection = getSequelizeConfig();

export interface ConsolidationAttributes {
  id: number;
  user_id: number;
  member_id: number;
  network_id: number | null;
  call_date: Date | null;
  call_observations: CallObservationType | null;
  other_observations: string | null;
  visit_date: Date | null;
  visit_observations: string | null;
  is_visible: boolean;
}

export type ConsolidationSearchData = {
  id?: number;
  user_id?: number;
  member_id?: number;
  network_id?: number;
  call_date?: Date | null;
  call_observations?: CallObservationType | null;
  other_observations?: string | null;
  visit_date?: Date | null;
  visit_observations?: string | null;
  is_visible?: boolean;
};

/** Campos opcionales al crear un Consolidation (id auto-incremental) */
export interface ConsolidationCreationAttributes extends Optional<
  ConsolidationAttributes,
  | "id"
  | "is_visible"
  | "network_id"
  | "call_observations"
  | "other_observations"
  | "call_date"
  | "visit_observations"
  | "visit_date"
> {}

/** Clase del modelo tipada */
export class ConsolidationModel
  extends Model<ConsolidationAttributes, ConsolidationCreationAttributes>
  implements ConsolidationAttributes
{
  declare id: number;
  declare user_id: number;
  declare member_id: number;
  declare network_id: number | null;
  declare call_date: Date | null;
  declare call_observations: CallObservationType | null;
  declare other_observations: string | null;
  declare visit_date: Date | null;
  declare visit_observations: string | null;
  declare is_visible: boolean;
}

/** Inicialización del modelo */
ConsolidationModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "members",
        key: "id",
      },
    },
    network_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "networks",
        key: "id",
      },
    },
    call_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    call_observations: {
      type: DataTypes.ENUM(...CALL_OBSERVATIONS),
      allowNull: true,
    },
    other_observations: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    visit_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    visit_observations: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize: connection,
    tableName: "consolidations",
    timestamps: false,
    modelName: "Consolidation",
  },
);

// Añade los scopes al modelo
/* ConsolidationModel.addScope("visible", {
  where: { is_visible: true },
}); */

ConsolidationModel.addScope("populated", {
  include: [
    { association: "User", attributes: ["id", "username"] },
    {
      association: "Member",
      attributes: [
        "id",
        "first_name",
        "last_name",
        "gender",
        "phone",
        "birth_date",
        "status",
        "visit_date",
        "how_know_us",
        "invited_by",
      ],
    },
    { association: "Network", attributes: ["id", "name"] },
  ],
});
