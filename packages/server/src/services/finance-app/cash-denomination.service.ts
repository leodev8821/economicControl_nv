import {
  CashDenominationCreationDTO,
  CashDenominationUpdateDTO,
} from "@economic-control/shared";
import {
  CashDenominationAttributes,
  CashDenominationModel,
  CashDenominationSearchData,
} from "../../models/finance-app/cash-denomination.model.js";
import { CashModel } from "../../models/finance-app/cash.model.js";
import { getSequelizeConfig } from "../../config/sequelize.config.js";
import { Transaction } from "sequelize";

const connection = getSequelizeConfig();

/**
 * Crea una nueva denominación en la base de datos.
 * @param dto Datos de la denominación a crear.
 * @returns Promise con el objeto CashDenominationAttributes creado.
 */
async function create(
  dto: CashDenominationCreationDTO,
): Promise<CashDenominationAttributes> {
  return connection.transaction(async (t) => {
    // validar que caja existe
    const cash = await CashModel.findByPk(dto.cash_id, { transaction: t });

    if (!cash) {
      throw new Error("La caja no existe");
    }

    // evitar duplicados misma denominación por caja
    const existing = await CashDenominationModel.findOne({
      where: {
        cash_id: dto.cash_id,
        denomination_value: dto.denomination_value,
      },
      transaction: t,
    });

    if (existing) {
      throw new Error("Esta denominación ya existe para la caja");
    }

    return CashDenominationModel.create(dto, { transaction: t });
  });
}

/**
 * Obtiene todas las denominaciones de la base de datos.
 * @param filters Criterios de búsqueda.
 * @returns Promise con un array de objetos CashDenominationAttributes.
 */
async function getAll(
  filters?: CashDenominationSearchData,
): Promise<CashDenominationAttributes[]> {
  const cash_denominations = await CashDenominationModel.findAll({
    where: filters ?? {},
  });

  return cash_denominations.map((m) => m.get({ plain: true }));
}

/**
 * Obtiene una denominación por su ID.
 * @param id ID de la denominación.
 * @param t (Opcional) Objeto de transacción de Sequelize.
 * @returns Promise con el objeto CashDenominationAttributes o null si no se encuentra.
 */
async function getById(
  id: number,
  t?: Transaction,
): Promise<CashDenominationAttributes | null> {
  const model = await CashDenominationModel.findByPk(id, {
    transaction: t,
  });

  return model?.get({ plain: true }) ?? null;
}

/**
 * Obtiene todas las denominaciones de una caja específica.
 * @param cashId ID de la caja.
 * @returns Promise con un array de objetos CashDenominationAttributes.
 */
async function getByCash(
  cashId: number,
): Promise<CashDenominationAttributes[]> {
  return getAll({ cash_id: cashId });
}

/**
 * Actualiza una moneda existente en la base de datos, con soporte para transacciones.
 * @param id ID de la moneda a actualizar.
 * @param data datos a actualizar.
 * @param t (Opcional) Objeto de transacción de Sequelize.
 * @returns promise con el objeto CashDenominationAttributes actualizado o null.
 */
async function update(
  id: number,
  data: CashDenominationUpdateDTO,
  t?: Transaction,
): Promise<CashDenominationAttributes> {
  const denomination = await CashDenominationModel.findByPk(id, {
    transaction: t,
  });

  if (!denomination) {
    throw new Error("Denominación no encontrada");
  }

  await denomination.update(data, { transaction: t });

  return denomination.get({ plain: true });
}

/**
 * DELETE
 * Elimina una moneda existente en la base de datos.
 * @param id ID de la moneda a eliminar.
 * @returns promise con true si la moneda fue eliminada, false en caso contrario.
 */
async function remove(id: number): Promise<boolean> {
  const deleted = await CashDenominationModel.destroy({ where: { id } });

  if (!deleted) {
    throw new Error("Denominación no encontrada");
  }

  return deleted > 0;
}

export const cashDenominationService = {
  create,
  getAll,
  getById,
  getByCash,
  update,
  remove,
};
