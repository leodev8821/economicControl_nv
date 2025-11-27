import { DataTypes, Model, type Optional } from "sequelize";
import { getSequelizeConfig } from "../config/sequelize.config.ts";
import { PersonModel } from "./person.model.ts";
import { WeekModel } from "./week.model.ts";
import { CashModel, CashActions } from "./cash.model.ts";
import { INCOME_SOURCES, type IncomeSource } from "@economic-control/shared";

const connection = getSequelizeConfig();

// Interfaces para el modelo Income
export interface IncomeAttributes {
  id: number;
  person_id: number | null; // Usar 'null' para manejar la opcionalidad explícitamente en la base de datos
  cash_id: number;
  week_id: number;
  date: string;
  amount: number;
  source: IncomeSource;
}

export type IncomeSearchData = {
  id?: number;
  person_id?: number;
  cash_id?: number;
  week_id?: number;
  date?: string;
  source?: string | IncomeSource;
};

// Opcionalidad para la creación (id es auto-generado)
export interface IncomeCreationAttributes
  extends Optional<IncomeAttributes, "id" | "person_id"> {}

// Definición del modelo
export class IncomeModel
  extends Model<IncomeAttributes, IncomeCreationAttributes>
  implements IncomeAttributes
{
  declare id: number;
  declare person_id: number | null;
  declare cash_id: number;
  declare week_id: number;
  declare date: string;
  declare amount: number;
  declare source: IncomeSource;
}

// 💡 Constante para la configuración de inclusión (JOINs)
const INCOME_INCLUDE_CONFIG = [
  {
    model: PersonModel,
    as: "Person",
    attributes: ["id", "dni", "first_name", "last_name"],
    required: false,
  },
  {
    model: CashModel,
    as: "Cash",
    attributes: ["id", "name", "actual_amount", "pettyCash_limit"],
    required: true,
  },
  {
    model: WeekModel,
    as: "Week",
    attributes: ["id", "week_start", "week_end"],
    required: true,
  },
];

// Inicialización del modelo
IncomeModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    person_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "persons",
        key: "id",
      },
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
        const val = this.getDataValue("amount");
        return val ? parseFloat(String(val)) : 0;
      },
    },
    source: {
      type: DataTypes.ENUM(...INCOME_SOURCES),
      allowNull: false,
    },
  },
  {
    sequelize: connection,
    tableName: "incomes",
    timestamps: false,
    modelName: "Income",
  }
);

export class IncomeActions {
  /**
   * Obtiene todas las ingresos de la base de datos.
   * @returns promise con un array de objetos IncomeAttributes.
   */
  public static async getAll(): Promise<IncomeAttributes[]> {
    const incomes = await IncomeModel.findAll({
      include: INCOME_INCLUDE_CONFIG,
    });
    return incomes.map((income) => income.get({ plain: true }));
  }

  /**
   * obtiene un ingreso que cumpla con los criterios de búsqueda proporcionados.
   * @param data criterios de búsqueda.
   * @returns promise con un objeto IncomeAttributes o null si no se encuentra ningun ingreso.
   */
  public static async getOne(
    data: IncomeSearchData
  ): Promise<IncomeAttributes | null> {
    const income = await IncomeModel.findOne({
      where: data,
      include: INCOME_INCLUDE_CONFIG,
    });
    return income ? income.get({ plain: true }) : null;
  }

  /**
   * Crea un nuevo ingreso en la base de datos y actualiza el saldo de la caja.
   * @param data datos del ingreso a crear.
   * @returns promise con el objeto IncomeAttributes creado.
   */
  public static async create(
    data: IncomeCreationAttributes
  ): Promise<IncomeAttributes> {
    // Iniciamos una transacción
    return connection.transaction(async (t) => {
      // 1. Crear el ingreso DENTRO de la transacción
      const newIncome = await IncomeModel.create(data, { transaction: t });

      // 2. Obtener la caja (pasando la transacción si getOne lo soporta, o lockeando)
      const currentCash = await CashModel.findByPk(data.cash_id, {
        transaction: t,
      });

      if (currentCash) {
        const newAmount =
          parseFloat(String(currentCash.actual_amount)) +
          parseFloat(String(data.amount));

        // 3. Actualizar la caja DENTRO de la transacción
        await CashActions.update(data.cash_id, { actual_amount: newAmount }, t);
      }

      return newIncome.get({ plain: true });
    });
  }

  /**
   * Elimina un ingreso de la base de datos y revierte la transacción en la caja.
   * @param data criterios de búsqueda para el ingreso a eliminar.
   * @returns promise con un booleano que indica si la eliminación fue exitosa.
   */
  public static async delete(data: IncomeSearchData): Promise<boolean> {
    const incomeToDelete = await IncomeActions.getOne(data);
    const deletedCount = await IncomeModel.destroy({ where: data });

    if (deletedCount > 0 && incomeToDelete) {
      const currentCash = await CashActions.getOne({
        id: incomeToDelete.cash_id,
      });

      if (currentCash) {
        const newAmount =
          parseFloat(String(currentCash.actual_amount)) -
          parseFloat(String(incomeToDelete.amount));
        await CashActions.update(incomeToDelete.cash_id, {
          actual_amount: newAmount,
        });
      }
    }

    return deletedCount > 0;
  }

  /**
   * Actualiza un ingreso existente en la base de datos y corrige los saldos de caja afectados.
   * @param id ID del ingreso a actualizar.
   * @param data datos a actualizar (puede incluir amount o cash_id).
   * @returns promise con el objeto IncomeAttributes actualizado o null.
   */
  public static async update(
    id: number,
    data: Partial<IncomeCreationAttributes>
  ): Promise<IncomeAttributes | null> {
    //Iniciar la transacción de Sequelize
    return connection.transaction(async (t) => {
      // 1. Obtener el registro original antes de la actualización
      const originalIncome = await IncomeModel.findByPk(id, { transaction: t });
      if (!originalIncome) {
        return null; // Ingreso no encontrado
      }

      // Determinar si el monto o la caja están siendo actualizados
      const isAmountChanged =
        data.amount !== undefined &&
        parseFloat(String(data.amount)) !==
          parseFloat(String(originalIncome.amount));
      const isCashIdChanged =
        data.cash_id !== undefined && data.cash_id !== originalIncome.cash_id;

      // Si hay cambios en la transacción que afectan el saldo (monto o caja)
      if (isAmountChanged || isCashIdChanged) {
        // Parámetros de la transacción original
        const oldAmount = parseFloat(String(originalIncome.amount));
        const oldCashId = originalIncome.cash_id;

        // Parámetros de la transacción nueva/actualizada
        const newAmount =
          data.amount !== undefined
            ? parseFloat(String(data.amount))
            : oldAmount;
        const newCashId = data.cash_id !== undefined ? data.cash_id : oldCashId;

        // --- 1. Revertir la transacción original (Restar el monto anterior) ---
        let oldCash = await CashActions.getOne({ id: oldCashId });
        if (oldCash) {
          // Cálculo: Saldo actual de la caja antigua - Monto antiguo (reversión de suma)
          const oldCashNewAmount =
            parseFloat(String(oldCash.actual_amount)) - oldAmount;
          await CashActions.update(
            oldCashId,
            { actual_amount: oldCashNewAmount },
            t
          );
          oldCash = await CashActions.getOne({ id: oldCashId }); // Refrescar el objeto oldCash
        }

        // --- 2. Aplicar la nueva transacción (Sumar el nuevo monto) ---
        // Si la caja no cambió, usamos el saldo recién actualizado de oldCash.
        const targetCashId = newCashId;
        let targetCash =
          oldCashId === newCashId
            ? oldCash
            : await CashActions.getOne({ id: targetCashId });

        if (targetCash) {
          // Cálculo: Saldo actual de la caja objetivo + Nuevo monto
          const newCashNewAmount =
            parseFloat(String(targetCash.actual_amount)) + newAmount;
          await CashActions.update(
            targetCashId,
            { actual_amount: newCashNewAmount },
            t
          );
        }
      }

      // 3. Actualizar el registro de la tabla 'incomes'
      const [updatedCount] = await IncomeModel.update(data, {
        where: { id },
        transaction: t,
      });

      if (updatedCount === 0) {
        return null;
      }

      // 4. Obtener y retornar el registro actualizado
      const updatedIncome = await IncomeModel.findByPk(id, { transaction: t });
      return updatedIncome ? updatedIncome.get({ plain: true }) : null;
    });
  }

  /**
   * Obtiene ingresos de tipo 'Diezmo' para una persona por su DNI.
   */
  public static async getTitheIncomesByDni(
    dni: string
  ): Promise<IncomeAttributes[]> {
    const person = await PersonModel.findOne({
      where: { dni },
      //include: INCOME_INCLUDE_CONFIG,
      include: ["id"],
    });
    if (!person) {
      return [];
    }
    const incomes = await IncomeModel.findAll({
      where: { person_id: person.id, source: "Diezmo" },
      include: INCOME_INCLUDE_CONFIG,
    });
    return incomes.map((income) => income.get({ plain: true }));
  }

  /**
   * Obtiene todos los ingresos para una fecha específica.
   */
  public static async getIncomesByDate(
    date: string
  ): Promise<IncomeAttributes[]> {
    const incomes = await IncomeModel.findAll({
      where: { date },
      include: INCOME_INCLUDE_CONFIG,
    });
    return incomes.map((income) => income.get({ plain: true }));
  }

  /**
   * Obtiene todos los ingresos para un ID de semana específico. ⬅️ NUEVA FUNCIÓN
   */
  public static async getIncomesByWeekId(
    weekId: number
  ): Promise<IncomeAttributes[]> {
    const incomes = await IncomeModel.findAll({
      where: { week_id: weekId },
      include: INCOME_INCLUDE_CONFIG,
    });
    return incomes.map((income) => income.get({ plain: true }));
  }
}
