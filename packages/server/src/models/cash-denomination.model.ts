import { DataTypes, Model, type Optional, type Transaction } from "sequelize";
import { getSequelizeConfig } from "../config/sequelize.config.ts";

const connection = getSequelizeConfig();

// Interfaces para el modelo CashDenomination
export interface CashDenominationAttributes {
  id: number;
  value: string;
  quantity: number;
}

// Tipo para criterios de búsqueda simple
export type CashDenominationSearchData = {
  id?: number;
  value?: string;
};

// Opcionalidad para la creación (id es auto-generado, quantity tiene un valor por defecto)
export interface CashDenominationCreationAttributes
  extends Optional<CashDenominationAttributes, "id"> {}

// Definición del modelo con tipado
export class CashDenominationModel
  extends Model<CashDenominationAttributes, CashDenominationCreationAttributes>
  implements CashDenominationAttributes
{
  declare id: number;
  declare value: string;
  declare quantity: number;
}

// Inicialización del modelo
CashDenominationModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    value: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    sequelize: connection,
    tableName: "cash_denominations",
    timestamps: false,
    modelName: "CashDenomination",
  }
);

export class CashDenominationActions {
  /**
   * Obtiene todas las monedas de la base de datos.
   * @returns promise con un array de objetos CashDenominationAttributes.
   */
  public static async getAll(): Promise<CashDenominationAttributes[]> {
    const cash_denominations = await CashDenominationModel.findAll();
    return cash_denominations.map((cash_denomination) =>
      cash_denomination.get({ plain: true })
    );
  }

  /**
   * obtiene una moneda que cumpla con los criterios de búsqueda proporcionados.
   * @param data criterios de búsqueda.
   * @param t (Opcional) Objeto de transacción de Sequelize.
   * @returns promise con un objeto CashDenominationAttributes o null si no se encuentra ninguna moneda.
   */
  public static async getOne(
    data: CashDenominationSearchData,
    t?: Transaction
  ): Promise<CashDenominationAttributes | null> {
    const cash_denomination = await CashDenominationModel.findOne({
      where: data,
      transaction: t ?? null,
    });
    return cash_denomination ? cash_denomination.get({ plain: true }) : null;
  }

  /**
   * Crea una nueva moneda en la base de datos.
   * @param data datos de la moneda a crear.
   * @returns promise con el objeto CashDenominationAttributes creado.
   */
  public static async create(
    data: CashDenominationCreationAttributes
  ): Promise<CashDenominationAttributes> {
    return connection.transaction(async (t) => {
      const newCashDenomination = await CashDenominationModel.create(data, {
        transaction: t,
      });
      return newCashDenomination.get({ plain: true });
    });
  }

  /**
   * Elimina una moneda de la base de datos por su ID.
   * @param data criterios de búsqueda para la moneda a eliminar.
   * @returns promise con un booleano que indica si la eliminación fue exitosa.
   */
  public static async delete(
    data: CashDenominationSearchData
  ): Promise<boolean> {
    const deletedCount = await CashDenominationModel.destroy({ where: data });
    return deletedCount > 0;
  }

  /**
   * Actualiza una moneda existente en la base de datos, con soporte para transacciones.
   * @param id ID de la moneda a actualizar.
   * @param data datos a actualizar.
   * @param t (Opcional) Objeto de transacción de Sequelize.
   * @returns promise con el objeto CashDenominationAttributes actualizado o null.
   */
  public static async update(
    id: number,
    data: Partial<CashDenominationCreationAttributes>,
    t?: Transaction
  ): Promise<CashDenominationAttributes | null> {
    const transaction = t ?? null;

    // Se añade el objeto de transacción a las opciones de la llamada:
    const [updatedCount] = await CashDenominationModel.update(data, {
      where: { id },
      transaction: transaction,
    });

    if (updatedCount === 0) {
      return null;
    }

    // Se incluye la transacción en findByPk también:
    const updatedCashDenomination = await CashDenominationModel.findByPk(id, {
      transaction: transaction,
    });
    return updatedCashDenomination
      ? updatedCashDenomination.get({ plain: true })
      : null;
  }
}
