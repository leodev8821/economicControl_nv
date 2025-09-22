// models/outcome.ts
import { DataTypes, Model, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";

const connection = getSequelizeConfig();

/** Tipos para los atributos del modelo */
export type CategoryType = "Fijos" | "Variables" | "Otro";

export interface OutcomeAttributes {
  id: number;
  cash_id: number;
  week_id: number;
  date: string; // DATEONLY -> string (YYYY-MM-DD)
  amount: string; // DECIMAL -> string para evitar pérdida de precisión
  description: string;
  category: CategoryType;
}

/** Campos opcionales al crear un Outcome (id auto-incremental) */
export interface OutcomeCreationAttributes
  extends Optional<OutcomeAttributes, "id"> {}

/** Clase del modelo tipada */
class OutcomeModel
  extends Model<OutcomeAttributes, OutcomeCreationAttributes>
  implements OutcomeAttributes
{
  declare id: number;
  declare cash_id: number;
  declare week_id: number;
  declare date: string;
  declare amount: string;
  declare description: string;
  declare category: CategoryType;
}

// Extender el tipo de instancia del modelo
interface IOutcomeModel extends OutcomeModel {
    get: (options: { plain: true }) => OutcomeAttributes;
}

// Exportar el modelo con los tipos correctos
export const Outcome = OutcomeModel as unknown as typeof OutcomeModel & {
    new (): IOutcomeModel;
    findOne: (options: any) => Promise<IOutcomeModel | null>;
    findAll: (options: any) => Promise<IOutcomeModel[]>;
    create: (data: OutcomeCreationAttributes) => Promise<IOutcomeModel>;
    update: (data: Partial<OutcomeAttributes>, options: any) => Promise<[number]>;
    destroy: (options: any) => Promise<number>;
};

/** Inicialización del modelo */
(OutcomeModel as unknown as typeof Model).init(
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
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM("Fijos", "Variables", "Otro"),
      allowNull: false,
    },
  },
  {
    sequelize: connection,
    tableName: "outcomes",
    timestamps: false,
  }
);

/** Funciones CRUD con tipos */

/**
 * Obtiene todos los gastos asociados a una caja (cash_id).
 * @param cashId - ID de la caja
 * @returns Promise<OutcomeAttributes[]>
 */
export async function getOutcomesByCash(
  cashId: number
): Promise<OutcomeAttributes[]> {
  try {
    return await Outcome.findAll({ where: { cash_id: cashId }, raw: true });
  } catch (error: any) {
    console.error("Error al obtener gastos por caja:", error.message);
    throw new Error(`Error al obtener gastos por caja: ${error.message}`);
  }
}

/**
 * Crea un nuevo gasto.
 * @param data - datos del nuevo gasto
 * @returns Promise<OutcomeAttributes>
 */
export async function createNewOutcome(
  data: OutcomeCreationAttributes
): Promise<OutcomeAttributes> {
  try {
    const newOutcome = await Outcome.create(data);
    return newOutcome.get({ plain: true }) as OutcomeAttributes;
  } catch (error: any) {
    console.error("Error al crear Gasto:", error.message);
    throw new Error(`Error al crear Gasto: ${error.message}`);
  }
}

/**
 * Obtiene todos los gastos.
 * @returns Promise<OutcomeAttributes[]>
 */
export async function getAllOutcomes(): Promise<OutcomeAttributes[]> {
  try {
    return await Outcome.findAll({ raw: true });
  } catch (error: any) {
    console.error("Error al consultar la base de datos: ", error.message);
    throw new Error(`Error al consultar la base de datos: ${error.message}`);
  }
}

/**
 * Obtiene un gasto por id.
 * @param id - id del gasto
 * @returns Promise<OutcomeAttributes | null>
 */
export async function getOneOutcome(
  id: number
): Promise<OutcomeAttributes | null> {
  try {
    const outcome = await Outcome.findOne({ where: { id }, raw: true });
    if (!outcome) return null;
    return outcome as OutcomeAttributes;
  } catch (error: any) {
    console.error(`Error al buscar gasto con Id "${id}":`, error.message);
    throw new Error(`Error al buscar gasto con Id "${id}": ${error.message}`);
  }
}

/**
 * Actualiza un gasto por id.
 * @param id - id del gasto
 * @param newData - nuevos datos a aplicar
 * @returns Promise<OutcomeAttributes | null>
 */
export async function updateOneOutcome(
  id: number,
  newData: Partial<OutcomeAttributes>
): Promise<OutcomeAttributes | null> {
  try {
    // obtenemos el registro actual (raw para usarlo como plain object)
    const outcome = await Outcome.findOne({ where: { id }, raw: true });
    if (!outcome) return null;

    await Outcome.update(newData, { where: { id } });

    // devolvemos la mezcla de los datos antiguos con los nuevos (como en tu JS original)
    return { ...(outcome as OutcomeAttributes), ...(newData as object) } as OutcomeAttributes;
  } catch (error: any) {
    console.error("Error al actualizar gasto:", error.message);
    throw new Error(`Error al actualizar gasto: ${error.message}`);
  }
}

/**
 * Elimina un gasto por id (hard delete).
 * @param id - id del gasto
 * @returns Promise<OutcomeAttributes | null> - datos del gasto eliminado o null si no existe
 */
export async function deleteOutcome(id: number): Promise<OutcomeAttributes | null> {
  try {
    const outcome = await Outcome.findOne({ where: { id }, raw: true });
    if (!outcome) return null;

    await Outcome.destroy({ where: { id } });
    return outcome as OutcomeAttributes;
  } catch (error: any) {
    console.error(`Error al eliminar el gasto ${id}`, error.message);
    throw new Error(`Error al eliminar el Gasto: ${error.message}`);
  }
}
