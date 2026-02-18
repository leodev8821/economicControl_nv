// models/outcome.ts
import { col, DataTypes, fn, Model, Op, type Optional } from "sequelize";
import { getSequelizeConfig } from "../../config/sequelize.config.js";
import { CashModel, CashActions } from "./cash.model.js";
import { WeekModel } from "./week.model.js";
import {
  OUTCOME_CATEGORIES,
  type OutcomeCategories,
} from "@economic-control/shared";
import { DashboardFilter } from "../../shared/dashboard.types.js";

const connection = getSequelizeConfig();

export interface OutcomeAttributes {
  id: number;
  cash_id: number;
  week_id: number;
  date: Date;
  amount: number;
  description: string;
  category: OutcomeCategories;
}

export type OutcomeSearchData = {
  id?: number;
  cash_id?: number;
  week_id?: number;
  date?: Date;
  category?: string | OutcomeCategories;
};

/** Campos opcionales al crear un Outcome (id auto-incremental) */
export interface OutcomeCreationAttributes extends Optional<
  OutcomeAttributes,
  "id"
> {}

/** Clase del modelo tipada */
export class OutcomeModel
  extends Model<OutcomeAttributes, OutcomeCreationAttributes>
  implements OutcomeAttributes
{
  declare id: number;
  declare cash_id: number;
  declare week_id: number;
  declare date: Date;
  declare amount: number;
  declare description: string;
  declare category: OutcomeCategories;
}

// 💡 Constante para la configuración de inclusión (JOINs)
/* const OUTCOME_INCLUDE_CONFIG = [
  {
    model: CashModel,
    as: "Cash",
    attributes: ["id", "name", "actual_amount"],
    required: true,
  },
  {
    model: WeekModel,
    as: "Week",
    attributes: ["id", "week_start", "week_end"],
    required: true,
  },
]; */

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
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      get() {
        const val = this.getDataValue("amount");
        return val ? parseFloat(String(val)) : 0;
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(...OUTCOME_CATEGORIES),
      allowNull: false,
    },
  },
  {
    sequelize: connection,
    tableName: "outcomes",
    timestamps: false,
    modelName: "Outcome",
  },
);

/** Función helper de normalización */
const normalizeOutcomeCategory = (category: string): OutcomeCategories => {
  const found = OUTCOME_CATEGORIES.find(
    (s: string) => s.toLowerCase() === category.toLowerCase(),
  );

  if (!found) {
    throw new Error(`Categoría de egreso inválida: ${category}`);
  }

  return found;
};

export class OutcomeActions {
  /**
   * Helper privado para evitar dependencias circulares en la inicialización
   */
  private static getIncludeConfig() {
    return [
      {
        model: CashModel,
        as: "Cash",
        attributes: ["id", "name", "actual_amount"],
        required: true,
      },
      {
        model: WeekModel,
        as: "Week",
        attributes: ["id", "week_start", "week_end"],
        required: true,
      },
    ];
  }

  /**
   * Obtiene todas las egresos de la base de datos.
   * @returns promise con un array de objetos OutcomeAttributes.
   */
  public static async getAll(): Promise<OutcomeAttributes[]> {
    const outcomes = await OutcomeModel.findAll({
      include: this.getIncludeConfig(),
    });
    return outcomes.map((outcome) => outcome.get({ plain: true }));
  }

  /**
   * obtiene un egreso que cumpla con los criterios de búsqueda proporcionados.
   * @param data criterios de búsqueda.
   * @returns promise con un objeto OutcomeAttributes o null si no se encuentra ningun egreso.
   */
  public static async getOne(
    data: OutcomeSearchData,
  ): Promise<OutcomeAttributes | null> {
    const outcome = await OutcomeModel.findOne({
      where: data,
      include: this.getIncludeConfig(),
    });
    return outcome ? outcome.get({ plain: true }) : null;
  }

  /**
   * Crea un nuevo egreso en la base de datos y actualiza el saldo de la caja.
   * @param data datos del egreso a crear.
   * @returns promise con el objeto OutcomeAttributes creado.
   */
  public static async create(
    data: OutcomeCreationAttributes,
  ): Promise<OutcomeAttributes> {
    return await connection.transaction(async (t) => {
      // Validamos la fuente de ingreso
      const normalizedData = {
        ...data,
        category: normalizeOutcomeCategory(data.category),
      };

      // 1. Crear el egreso dentro de la transacción
      const newOutcome = await OutcomeModel.create(normalizedData, {
        transaction: t,
      });

      // 2. Obtener la caja bloqueando la fila dentro de la transacción
      const currentCash = await CashActions.getOne({ id: data.cash_id }, t);

      if (currentCash) {
        // Cálculo: Saldo actual - Monto del egreso
        const newAmount =
          parseFloat(String(currentCash.actual_amount)) -
          parseFloat(String(data.amount));

        // 3. Actualizar caja pasando la transacción
        await CashActions.update(data.cash_id, { actual_amount: newAmount }, t);
      }

      return newOutcome.get({ plain: true });
    });
  }

  /**
   * Elimina un egreso de la base de datos por su ID y revierte la transacción en la caja.
   * @param data criterios de búsqueda para el egreso a eliminar.
   * @returns promise con un booleano que indica si la eliminación fue exitosa.
   */
  public static async delete(data: OutcomeSearchData): Promise<boolean> {
    return await connection.transaction(async (t) => {
      // 1. Buscar el egreso antes de borrarlo
      const outcomeToDelete = await OutcomeModel.findOne({
        where: data,
        transaction: t,
      });

      if (!outcomeToDelete) return false;

      // 2. Eliminar el registro
      const deletedCount = await OutcomeModel.destroy({
        where: data,
        transaction: t,
      });

      if (deletedCount > 0) {
        const currentCash = await CashActions.getOne(
          { id: outcomeToDelete.cash_id },
          t,
        );

        if (currentCash) {
          // Devolver el dinero a la caja (Revertir resta)
          const newAmount =
            parseFloat(String(currentCash.actual_amount)) +
            parseFloat(String(outcomeToDelete.amount));
          await CashActions.update(
            outcomeToDelete.cash_id,
            {
              actual_amount: newAmount,
            },
            t,
          );
        }
      }

      return deletedCount > 0;
    });
  }

  /**
   * Actualiza un egreso existente en la base de datos y corrige los saldos de caja afectados.
   * @param id ID del egreso a actualizar.
   * @param data datos a actualizar (puede incluir amount o cash_id).
   * @returns promise con el objeto OutcomeAttributes actualizado o null.
   */
  public static async update(
    id: number,
    data: Partial<OutcomeCreationAttributes>,
  ): Promise<OutcomeAttributes | null> {
    return connection.transaction(async (t) => {
      // 1. Obtener registro original
      const originalOutcome = await OutcomeModel.findByPk(id, {
        transaction: t,
      });
      if (!originalOutcome) return null;

      const isAmountChanged =
        data.amount !== undefined &&
        parseFloat(String(data.amount)) !==
          parseFloat(String(originalOutcome.amount));
      const isCashIdChanged =
        data.cash_id !== undefined && data.cash_id !== originalOutcome.cash_id;

      if (isAmountChanged || isCashIdChanged) {
        const oldAmount = parseFloat(String(originalOutcome.amount));
        const oldCashId = originalOutcome.cash_id;
        const newAmount =
          data.amount !== undefined
            ? parseFloat(String(data.amount))
            : oldAmount;
        const newCashId = data.cash_id !== undefined ? data.cash_id : oldCashId;

        // A. Revertir en caja vieja (Sumar lo que se había restado)
        const oldCash = await CashActions.getOne({ id: oldCashId }, t);
        if (oldCash) {
          const oldCashNewAmount =
            parseFloat(String(oldCash.actual_amount)) + oldAmount;
          await CashActions.update(
            oldCashId,
            { actual_amount: oldCashNewAmount },
            t,
          );
        }

        // B. Aplicar en caja nueva/actual (Restar el nuevo monto)
        const targetCashId = newCashId;
        // Si es la misma caja, necesitamos refrescar el dato recién actualizado
        // getOne con transacción nos dará el dato fresco dentro de la tx
        const targetCash = await CashActions.getOne({ id: targetCashId }, t);

        if (targetCash) {
          const newCashNewAmount =
            parseFloat(String(targetCash.actual_amount)) - newAmount;
          await CashActions.update(
            targetCashId,
            { actual_amount: newCashNewAmount },
            t,
          );
        }
      }

      const [updatedCount] = await OutcomeModel.update(data, {
        where: { id },
        transaction: t,
      });
      if (updatedCount === 0) return null;

      const updatedOutcome = await OutcomeModel.findByPk(id, {
        transaction: t,
      });
      return updatedOutcome ? updatedOutcome.get({ plain: true }) : null;
    });
  }

  /**
   * Obtiene todos los egresos asociados a una caja (cash_id).
   */
  public static async getOutcomesByCashId(
    cashId: number,
  ): Promise<OutcomeAttributes[]> {
    const outcomes = await OutcomeModel.findAll({
      where: { cash_id: cashId },
      include: this.getIncludeConfig(),
    });
    return outcomes.map((outcome) => outcome.get({ plain: true }));
  }

  /**
   * Obtiene todos los egresos para una fecha específica.
   */
  public static async getOutcomesByDate(
    date: string,
  ): Promise<OutcomeAttributes[]> {
    const outcomes = await OutcomeModel.findAll({
      where: { date },
      include: this.getIncludeConfig(),
    });
    return outcomes.map((outcome) => outcome.get({ plain: true }));
  }

  /**
   * Obtiene todos los egresos para un ID de semana específico.
   */
  public static async getOutcomesByWeekId(
    weekId: number,
  ): Promise<OutcomeAttributes[]> {
    const outcomes = await OutcomeModel.findAll({
      where: { week_id: weekId },
      include: this.getIncludeConfig(),
    });
    return outcomes.map((outcome) => outcome.get({ plain: true }));
  }

  /**
   * Crea múltiples egresos en una sola transacción y actualiza los saldos de caja.
   * @param dataList Arreglo de datos de egresos a crear.
   * @returns Promise con el array de egresos creados.
   */
  public static async createMultipleOutcomes(
    dataList: OutcomeCreationAttributes[],
  ): Promise<OutcomeAttributes[]> {
    return connection.transaction(async (t) => {
      const normalizedData = dataList.map((item) => ({
        ...item,
        category: normalizeOutcomeCategory(item.category),
      }));

      const newOutcomes = await OutcomeModel.bulkCreate(normalizedData, {
        transaction: t,
        validate: true,
      });

      const cashTotals = new Map<number, number>();
      for (const { cash_id, amount } of dataList) {
        const value = Number(amount);
        if (!Number.isFinite(value)) continue;
        cashTotals.set(cash_id, (cashTotals.get(cash_id) ?? 0) + value);
      }

      // ERROR CORREGIDO: Usamos decrement para que reste del saldo
      for (const [cashId, totalAmount] of cashTotals) {
        await CashModel.decrement(
          { actual_amount: totalAmount }, // Sequelize restará este valor
          {
            where: { id: cashId },
            transaction: t,
          },
        );
      }

      return newOutcomes.map((outcome) => outcome.get({ plain: true }));
    });
  }

  /**
   * Obtiene el resumen de egresos agrupado por caja y categoría.
   */
  public static async getSummaryByCash(
    filters: DashboardFilter = {},
  ): Promise<any[]> {
    const where: any = {};

    if (filters.week_id) {
      where.week_id = filters.week_id;
    } else if (filters.startDate && filters.endDate) {
      where.date = { [Op.between]: [filters.startDate, filters.endDate] };
    }

    return await OutcomeModel.findAll({
      attributes: [
        "cash_id",
        "category",
        [fn("SUM", col("amount")), "total_amount"],
      ],
      where, // Aplicamos el filtro aquí
      group: ["cash_id", "category"],
      raw: true,
    });
  }
}
