import {
  ConsolidationCreationDTO,
  ConsolidationUpdateDTO,
} from "@economic-control/shared";
import {
  ConsolidationAttributes,
  ConsolidationModel,
  ConsolidationSearchData,
} from "@models/consolidation-app/consolidation.model.js";
import { UserModel } from "@models/auth/user.model.js";
import { MemberModel } from "@models/consolidation-app/member.model.js";
import { NetworkModel } from "@models/consolidation-app/network.model.js";
import { getSequelizeConfig } from "@config/sequelize.config.js";
import { Transaction } from "sequelize";

const connection = getSequelizeConfig();

/**
 * Crea una nueva consolidación en la base de datos.
 * @param dto Datos de la consolidación a crear.
 * @returns Promise con el objeto ConsolidationAttributes creado.
 */
async function create(
  dto: ConsolidationCreationDTO,
): Promise<ConsolidationAttributes> {
  return connection.transaction(async (t) => {
    const user = await UserModel.findByPk(dto.user_id, { transaction: t });
    const member = await MemberModel.findByPk(dto.member_id, {
      transaction: t,
    });
    const network = await NetworkModel.findByPk(dto.network_id, {
      transaction: t,
    });

    const isValid = !user || !member || !network;

    if (isValid) {
      throw new Error("Usuario, miembro o red no encontrado");
    }

    return ConsolidationModel.create(dto, { transaction: t });
  });
}

/**
 * Obtiene todas las consolidaciones de la base de datos.
 * @param filters Criterios de búsqueda.
 * @returns Promise con un array de objetos ConsolidationAttributes.
 */
async function getAll(
  filters?: ConsolidationSearchData,
): Promise<ConsolidationAttributes[]> {
  const consolidations = await ConsolidationModel.findAll({
    where: filters ?? {},
  });

  return consolidations.map((m) => m.get({ plain: true }));
}

/**
 * Obtiene una consolidación por su ID.
 * @param id ID de la consolidación.
 * @param t (Opcional) Objeto de transacción de Sequelize.
 * @returns Promise con el objeto ConsolidationAttributes o null si no se encuentra.
 */
async function getById(
  id: number,
  t?: Transaction,
): Promise<ConsolidationAttributes | null> {
  const model = await ConsolidationModel.findByPk(id, {
    transaction: t,
  });

  return model?.get({ plain: true }) ?? null;
}

/**
 * Actualiza una consolidación existente en la base de datos, con soporte para transacciones.
 * @param id ID de la consolidación a actualizar.
 * @param data datos a actualizar.
 * @param t (Opcional) Objeto de transacción de Sequelize.
 * @returns promise con el objeto ConsolidationAttributes actualizado o null.
 */
async function update(
  id: number,
  data: ConsolidationUpdateDTO,
  t?: Transaction,
): Promise<ConsolidationAttributes> {
  const consolidation = await ConsolidationModel.findByPk(id, {
    transaction: t,
  });

  if (!consolidation) {
    throw new Error("Consolidación no encontrada");
  }

  await consolidation.update(data, { transaction: t });

  return consolidation.get({ plain: true });
}

/**
 * DELETE
 * Elimina una consolidación existente en la base de datos.
 * @param id ID de la consolidación a eliminar.
 * @returns promise con true si la consolidación fue eliminada, false en caso contrario.
 */
async function remove(id: number): Promise<boolean> {
  const deleted = await ConsolidationModel.destroy({ where: { id } });

  if (!deleted) {
    throw new Error("Consolidación no encontrada");
  }

  return deleted > 0;
}

export const consolidationService = {
  create,
  getAll,
  getById,
  update,
  remove,
};
