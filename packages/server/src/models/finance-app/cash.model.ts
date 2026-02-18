import { DataTypes, Model, type Optional, type Transaction } from "sequelize";
import { getSequelizeConfig } from "../../config/sequelize.config.js";
import { CashDenominationModel } from "./cash-denomination.model.js";

const connection = getSequelizeConfig();

// Interfaces para el modelo Cash
export interface CashAttributes {
  id: number;
  name: string;
  actual_amount: number;
  denominations?: CashDenominationModel[];
}

// Tipo para criterios de búsqueda simple
export type CashSearchData = {
  id?: number;
  name?: string;
};

// Opcionalidad para la creación (id es auto-generado, pettyCash_limit tiene un valor por defecto)
export interface CashCreationAttributes
  //extends Optional<CashAttributes, "id" | "pettyCash_limit"> {}
  extends Optional<CashAttributes, "id"> {}

// Definición del modelo con tipado
export class CashModel
  extends Model<CashAttributes, CashCreationAttributes>
  implements CashAttributes
{
  declare id: number;
  declare name: string;
  declare actual_amount: number;
  declare denominations?: CashDenominationModel[];
}

// Inicialización del modelo
CashModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    actual_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
      set(value) {
        // Forzamos que siempre se guarde como número
        this.setDataValue("actual_amount", parseFloat(String(value)));
      },
    },
  },
  {
    sequelize: connection,
    tableName: "cashes",
    timestamps: false,
    modelName: "Cash",
  },
);

export class CashActions {
  /**
   * Obtiene todas las cajas de la base de datos.
   * @returns promise con un array de objetos CashAttributes.
   */
  public static async getAll(): Promise<CashAttributes[]> {
    const cashs = await CashModel.findAll();
    return cashs.map((cash) => cash.get({ plain: true }));
  }

  /**
   * obtiene una caja que cumpla con los criterios de búsqueda proporcionados.
   * @param data criterios de búsqueda.
   * @returns promise con un objeto CashAttributes o null si no se encuentra ninguna caja.
   */
  /**
   * obtiene una caja que cumpla con los criterios de búsqueda proporcionados.
   * @param data criterios de búsqueda.
   * @param t (Opcional) Objeto de transacción de Sequelize.
   * @returns promise con un objeto CashAttributes o null si no se encuentra ninguna caja.
   */
  public static async getOne(
    data: CashSearchData,
    t?: Transaction,
  ): Promise<CashAttributes | null> {
    const cash = await CashModel.findOne({
      where: data,
      transaction: t ?? null,
      include: [
        {
          model: CashDenominationModel,
          as: "denominations",
        },
      ],
    });
    return cash ? cash.get({ plain: true }) : null;
  }

  /**
   * Crea una nueva caja en la base de datos.
   * @param data datos de la caja a crear.
   * @returns promise con el objeto CashAttributes creado.
   */
  public static async create(
    data: CashCreationAttributes,
  ): Promise<CashAttributes> {
    return connection.transaction(async (t) => {
      //crear caja
      const newCash = await CashModel.create(data, { transaction: t });

      //denominaciones por defecto (euros)
      const defaultDenominations = [
        500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01,
      ];

      //crear arqueo inicial
      await CashDenominationModel.bulkCreate(
        defaultDenominations.map((value) => ({
          cash_id: newCash.id,
          denomination_value: value,
          quantity: 0,
        })),
        { transaction: t },
      );

      const createdCash = await CashModel.findByPk(newCash.id, {
        include: [{ model: CashDenominationModel, as: "denominations" }],
        transaction: t,
      });

      return createdCash!.get({ plain: true });
    });
  }

  /**
   * Elimina una caja de la base de datos por su ID.
   * @param data criterios de búsqueda para la caja a eliminar.
   * @returns promise con un booleano que indica si la eliminación fue exitosa.
   */
  public static async delete(data: CashSearchData): Promise<boolean> {
    const deletedCount = await CashModel.destroy({ where: data });
    return deletedCount > 0;
  }

  /**
   * Actualiza una caja existente en la base de datos, con soporte para transacciones.
   * @param id ID de la caja a actualizar.
   * @param data datos a actualizar.
   * @param t (Opcional) Objeto de transacción de Sequelize.
   * @returns promise con el objeto CashAttributes actualizado o null.
   */
  public static async update(
    id: number,
    data: Partial<CashCreationAttributes>,
    t?: Transaction,
  ): Promise<CashAttributes | null> {
    const transaction = t ?? null;

    // Se añade el objeto de transacción a las opciones de la llamada:
    const [updatedCount] = await CashModel.update(data, {
      where: { id },
      transaction: transaction,
    });

    if (updatedCount === 0) {
      return null;
    }

    // Se incluye la transacción en findByPk también:
    const updatedCash = await CashModel.findByPk(id, {
      transaction: transaction,
    });
    return updatedCash ? updatedCash.get({ plain: true }) : null;
  }
}
