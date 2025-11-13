// models/outcome.ts
import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";
import { CashModel } from "./cash.model";
import { WeekModel } from "./week.model";

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
  amount: number;
  description: string;
  category: OutcomeCategory;
}

export type OutcomeSearchData = {
  id?: number;
  cash_id?: number;
  week_id?: number;
  date?: string;
  category?: string | OutcomeCategory;
};

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

// 💡 Constante para la configuración de inclusión (JOINs)
const OUTCOME_INCLUDE_CONFIG = [
    {
        model: CashModel, 
        as: 'Cash',
        attributes: ['id', 'name', 'actual_amount', 'pettyCash_limit'],
        required: true,
    },
    {
        model: WeekModel, 
        as: 'Week',
        attributes: ['id', 'week_start', 'week_end'],
        required: true,
    }
];

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
      defaultValue: DataTypes.NOW,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      get() {
        const val = this.getDataValue('amount');
        return val ? parseFloat(String(val)) : 0;
      },
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

export class OutcomeActions {

    /**
     * Obtiene todas las egresos de la base de datos.
     * @returns promise con un array de objetos OutcomeAttributes.
     */
    public static async getAll(): Promise<OutcomeAttributes[]> {
        const outcomes = await OutcomeModel.findAll({ include: OUTCOME_INCLUDE_CONFIG });
        return outcomes.map(outcome => outcome.get({ plain: true }));
    }

    /**
     * obtiene un egreso que cumpla con los criterios de búsqueda proporcionados.
     * @param data criterios de búsqueda.
     * @returns promise con un objeto OutcomeAttributes o null si no se encuentra ningun egreso.
     */
    public static async getOne(data: OutcomeSearchData): Promise<OutcomeAttributes | null> {
        const outcome = await OutcomeModel.findOne({ where: data, include: OUTCOME_INCLUDE_CONFIG });
        return outcome ? outcome.get({ plain: true }) : null;
    }

    /**
     * Crea un nuevo egreso en la base de datos.
     * @param data datos de la egreso a crear.
     * @returns promise con el objeto OutcomeAttributes creado.
     */
    public static async create(data: OutcomeCreationAttributes): Promise<OutcomeAttributes> {
        const newOutcome = await OutcomeModel.create(data);
        return newOutcome.get({ plain: true });
    }

    /**
     * Elimina un egreso de la base de datos por su ID.
     * @param data criterios de búsqueda para la egreso a eliminar.
     * @returns promise con un booleano que indica si la eliminación fue exitosa.
     */
    public static async delete(data: OutcomeSearchData): Promise<boolean> {
        const deletedCount = await OutcomeModel.destroy({ where: data });
        return deletedCount > 0;
    }

    /**
     * Actualiza un egreso existente en la base de datos.
     * @param id ID de la egreso a actualizar.
     * @param data datos a actualizar.
     * @returns promise con un booleano que indica si la actualización fue exitosa.
     */
    public static async update(id: number, data: Partial<OutcomeCreationAttributes>): Promise<OutcomeAttributes | null> {
        const [updatedCount] = await OutcomeModel.update(data, { where: { id } });
        if(updatedCount === 0) {
            return null;
        }
        const updatedOutcome = await OutcomeModel.findByPk(id);
        return updatedOutcome ? updatedOutcome.get({ plain: true }) : null;
    }

     /**
     * Obtiene todos los egresos asociados a una caja (cash_id).
     */
    public static async getOutcomesByCashId(cashId: number): Promise<OutcomeAttributes[]> {
        const outcomes = await OutcomeModel.findAll({ 
            where: { cash_id: cashId },
            include: OUTCOME_INCLUDE_CONFIG,
        });
        return outcomes.map(outcome => outcome.get({ plain: true }));
    }

    /**
     * Obtiene todos los egresos para una fecha específica.
     */
    public static async getOutcomesByDate(date: string): Promise<OutcomeAttributes[]> {
        const outcomes = await OutcomeModel.findAll({ 
            where: { date },
            include: OUTCOME_INCLUDE_CONFIG,
        });
        return outcomes.map(outcome => outcome.get({ plain: true }));
    }

    /**
     * Obtiene todos los egresos para un ID de semana específico.
     */
    public static async getOutcomesByWeekId(weekId: number): Promise<OutcomeAttributes[]> {
        const outcomes = await OutcomeModel.findAll({ 
            where: { week_id: weekId },
            include: OUTCOME_INCLUDE_CONFIG,
        });
        return outcomes.map(outcome => outcome.get({ plain: true }));
    }

}