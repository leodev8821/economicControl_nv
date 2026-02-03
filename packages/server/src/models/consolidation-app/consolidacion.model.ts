// models/outcome.ts
import { DataTypes, Model, type Optional } from "sequelize";
import { getSequelizeConfig } from "../../config/sequelize.config.js";
import { RegisterModel } from "./registro-persona.model.js";
import { LiderModel } from "./leader.model.js";
import { NetworkModel } from "./network.model.js";
import {
  CLASIFICATION,
  type ClasificationType,
} from "@economic-control/shared";

const connection = getSequelizeConfig();

export interface ConsolidationAttributes {
  id: number;
  register_id: number;
  lider_id: number | null;
  red_id: number | null;
  church_visit_date: Date;
  call_date: Date | null;
  visit_date: Date | null;
  observations: string | null;
  invited_by: string | null;
  clasification: ClasificationType;
  is_visible: boolean;
}

export type ConsolidationSearchData = {
  id?: number;
  register_id?: number;
  lider_id?: number;
  red_id?: number;
  church_visit_date?: Date;
  call_date?: Date;
  visit_date?: Date;
  observations?: string;
  invited_by?: string;
  clasification?: ClasificationType;
  is_visible?: boolean;
};

/** Campos opcionales al crear un Outcome (id auto-incremental) */
export interface ConsolidationCreationAttributes extends Optional<
  ConsolidationAttributes,
  "id" | "is_visible"
> {}

/** Clase del modelo tipada */
export class ConsolidationModel
  extends Model<ConsolidationAttributes, ConsolidationCreationAttributes>
  implements ConsolidationAttributes
{
  declare id: number;
  declare register_id: number;
  declare lider_id: number | null;
  declare red_id: number | null;
  declare church_visit_date: Date;
  declare call_date: Date | null;
  declare visit_date: Date | null;
  declare observations: string | null;
  declare invited_by: string | null;
  declare clasification: ClasificationType;
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
    register_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "registers",
        key: "id",
      },
    },
    lider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "leaders",
        key: "id",
      },
    },
    red_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "reds",
        key: "id",
      },
    },
    church_visit_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    call_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    visit_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    observations: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invited_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    clasification: {
      type: DataTypes.ENUM(...CLASIFICATION),
      allowNull: false,
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
    scopes: {
      visible: {
        where: { is_visible: true },
      },
      populated: {
        include: [
          {
            model: RegisterModel,
            as: "Register",
            attributes: ["id", "first_name", "last_name", "phone"],
            required: true,
          },
          {
            model: LiderModel,
            as: "Lider",
            attributes: ["id", "first_name", "last_name", "phone"],
            required: false,
          },
          {
            model: NetworkModel,
            as: "Red",
            attributes: ["id", "name"],
            required: false,
          },
        ],
      },
    },
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
