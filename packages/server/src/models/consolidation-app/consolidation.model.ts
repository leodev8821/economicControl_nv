// models/outcome.ts
import { DataTypes, Model, type Optional } from "sequelize";
import { getSequelizeConfig } from "../../config/sequelize.config.js";
import {
  CALL_OBSERVATIONS,
  HOW_KNOW_US,
  type CallObservationType,
  type HowKnowUsType,
} from "@economic-control/shared";

const connection = getSequelizeConfig();

export interface ConsolidationAttributes {
  id: number;
  user_id: number;
  member_id: number;
  network_id: number;
  how_know_us: HowKnowUsType;
  invited_by: string | null;
  call_date: Date | null;
  call_observations: CallObservationType;
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
  how_know_us?: HowKnowUsType;
  invited_by?: string | null;
  call_date?: Date | null;
  call_observations?: CallObservationType;
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
  | "other_observations"
  | "visit_observations"
  | "call_observations"
  | "call_date"
  | "visit_date"
  | "invited_by"
> {}

/** Clase del modelo tipada */
export class ConsolidationModel
  extends Model<ConsolidationAttributes, ConsolidationCreationAttributes>
  implements ConsolidationAttributes
{
  declare id: number;
  declare user_id: number;
  declare member_id: number;
  declare network_id: number;
  declare how_know_us: HowKnowUsType;
  declare invited_by: string | null;
  declare call_date: Date | null;
  declare call_observations: CallObservationType;
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
      allowNull: false,
      references: {
        model: "networks",
        key: "id",
      },
    },
    how_know_us: {
      type: DataTypes.ENUM(...HOW_KNOW_US),
      allowNull: false,
    },
    invited_by: {
      type: DataTypes.STRING,
      allowNull: true,
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

export class ConsolidationActions {
  public static async getAll(): Promise<ConsolidationAttributes[]> {
    // Combinamos scopes: visible + populated (includes)
    const consolidations = await ConsolidationModel.scope([
      "visible",
      "populated",
    ]).findAll();
    return consolidations.map((c) => c.get({ plain: true }));
  }

  public static async getOne(
    data: ConsolidationSearchData,
  ): Promise<ConsolidationAttributes | null> {
    const result = await ConsolidationModel.scope([
      "visible",
      "populated",
    ]).findOne({
      where: data,
    });
    return result ? result.get({ plain: true }) : null;
  }

  public static async create(
    data: ConsolidationCreationAttributes,
  ): Promise<ConsolidationAttributes> {
    // Si necesitas transacciones internas, manténlas, pero la estructura externa sigue a User
    return await connection.transaction(async (t) => {
      const newConsolidation = await ConsolidationModel.create(data, {
        transaction: t,
      });
      // Recargamos para traer las relaciones si es necesario, o devolvemos directo
      return newConsolidation.get({ plain: true });
    });
  }

  public static async delete(id: number): Promise<boolean> {
    const [count] = await ConsolidationModel.update(
      { is_visible: false },
      { where: { id } },
    );
    return count > 0;
  }

  public static async update(
    id: number,
    data: Partial<ConsolidationCreationAttributes>,
  ): Promise<ConsolidationAttributes | null> {
    const [count] = await ConsolidationModel.update(data, { where: { id } });
    if (!count) return null;

    const updated = await ConsolidationModel.scope("populated").findByPk(id);
    return updated ? updated.get({ plain: true }) : null;
  }
}
