// models/week.ts
import {
  DataTypes,
  Model as SequelizeModel,
  type Optional,
  Op,
} from "sequelize";
import { getSequelizeConfig } from "../config/sequelize.config.ts";
import { addDays, addWeeks, startOfWeek } from "date-fns";

const connection = getSequelizeConfig();

/** Tipos del modelo */
export interface WeekAttributes {
  id: number;
  week_start: string; // DATEONLY -> string (YYYY-MM-DD)
  week_end: string; // DATEONLY -> string (YYYY-MM-DD)
}

export type WeekSearchData = {
  id?: number;
  week_start?: string;
  week_end?: string;
};

/** Campos opcionales al crear (id autoincremental) */
export interface WeekCreationAttributes
  extends Optional<WeekAttributes, "id"> {}

/** Clase tipada Sequelize */
export class WeekModel
  extends SequelizeModel<WeekAttributes, WeekCreationAttributes>
  implements WeekAttributes
{
  declare id: number;
  declare week_start: string;
  declare week_end: string;
}

/** Inicialización del modelo */
WeekModel.init(
  {
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
    },
  },
  {
    sequelize: connection,
    tableName: "weeks",
    timestamps: false,
    modelName: "Week",
  }
);

export class WeekActions {
  /**
   * Obtiene todas las semanas de la base de datos.
   * @returns promise con un array de objetos WeekAttributes.
   */
  public static async getAll(): Promise<WeekAttributes[]> {
    const weeks = await WeekModel.findAll();
    return weeks.map((week) => week.get({ plain: true }));
  }

  /**
   * obtiene un semana que cumpla con los criterios de búsqueda proporcionados.
   * @param data criterios de búsqueda.
   * @returns promise con un objeto WeekAttributes o null si no se encuentra ningun semana.
   */
  public static async getOne(
    data: WeekSearchData
  ): Promise<WeekAttributes | null> {
    const week = await WeekModel.findOne({ where: data });
    return week ? week.get({ plain: true }) : null;
  }

  /**
   * Crea un nuevo semana en la base de datos.
   * @param data datos de la semana a crear.
   * @returns promise con el objeto WeekAttributes creado.
   */
  public static async create(
    data: WeekCreationAttributes
  ): Promise<WeekAttributes> {
    return connection.transaction(async (t) => {
      const newWeek = await WeekModel.create(data, { transaction: t });
      return newWeek.get({ plain: true });
    });
  }

  /**
   * Elimina un semana de la base de datos por su ID.
   * @param data criterios de búsqueda para la semana a eliminar.
   * @returns promise con un booleano que indica si la eliminación fue exitosa.
   */
  public static async delete(data: WeekSearchData): Promise<boolean> {
    return connection.transaction(async (t) => {
      const deletedCount = await WeekModel.destroy({
        where: data,
        transaction: t,
      });
      return deletedCount > 0;
    });
  }

  /**
   * Actualiza un semana existente en la base de datos.
   * @param id ID de la semana a actualizar.
   * @param data datos a actualizar.
   * @returns promise con un booleano que indica si la actualización fue exitosa.
   */
  public static async update(
    id: number,
    data: Partial<WeekCreationAttributes>
  ): Promise<WeekAttributes | null> {
    return connection.transaction(async (t) => {
      const [updatedCount] = await WeekModel.update(data, {
        where: { id },
        transaction: t,
      });
      if (updatedCount === 0) {
        return null;
      }
      const updatedWeek = await WeekModel.findByPk(id, { transaction: t });
      return updatedWeek ? updatedWeek.get({ plain: true }) : null;
    });
  }

  // Genera semanas para un año específico
  public static async generateWeeksForYear(
    year: number
  ): Promise<WeekAttributes[]> {
    if (typeof year !== "number" || year < 1970 || year > 2100) {
      throw new Error("Año inválido. Debe ser un número entre 1970 y 2100.");
    }

    try {
      let currentMonday = startOfWeek(new Date(`${year}-01-01`), {
        weekStartsOn: 1,
      });
      if (currentMonday.getFullYear() < year) {
        currentMonday = addWeeks(currentMonday, 1);
      }
      const lastDay = new Date(`${year}-12-31`);
      const weeksToCreate: WeekCreationAttributes[] = [];

      while (currentMonday <= lastDay) {
        const currentSunday = addDays(currentMonday, 6);
        weeksToCreate.push({
          week_start: currentMonday.toISOString().slice(0, 10),
          week_end: currentSunday.toISOString().slice(0, 10),
        });
        currentMonday = addWeeks(currentMonday, 1);
      }

      const newWeeks = await WeekModel.bulkCreate(weeksToCreate, {
        ignoreDuplicates: true,
      });

      return newWeeks ? newWeeks.map((w) => w.get({ plain: true })) : [];
    } catch (error) {
      throw new Error(`Error al generar las semanas para el año ${year}`);
    }
  }

  /**
   * Obtiene semanas para un año específico.
   */
  public static async getByYear(year: number): Promise<WeekAttributes[]> {
    const weeks = await WeekModel.findAll({
      where: {
        week_start: {
          [Op.between]: [`${year}-01-01`, `${year}-12-31`],
        },
      },
    });
    return weeks.map((w) => w.get({ plain: true }));
  }
}
