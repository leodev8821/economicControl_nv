import {
  ConsolidationCreationDTO,
  ConsolidationUpdateDTO,
} from "@economic-control/shared";
import {
  ConsolidationAttributes,
  ConsolidationCreationAttributes,
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
  transaction?: Transaction,
): Promise<ConsolidationAttributes> {
  const execute = async (t: Transaction) => {
    const [user, member] = await Promise.all([
      UserModel.findByPk(dto.user_id, { transaction: t }),
      MemberModel.findByPk(dto.member_id, { transaction: t }),
    ]);

    if (!user) throw new Error("El usuario especificado no existe");
    if (!member) throw new Error("El miembro especificado no existe");

    if (dto.network_id !== null && dto.network_id !== undefined) {
      const network = await NetworkModel.findByPk(dto.network_id, {
        transaction: t,
      });
      if (!network) throw new Error("La red especificada no existe");
    }

    const consolidation = await ConsolidationModel.create(dto, {
      transaction: t,
    });

    const result = await ConsolidationModel.scope(["populated"]).findByPk(
      consolidation.id,
      {
        transaction: t,
      },
    );

    return result!.get({ plain: true });
  };

  return transaction ? execute(transaction) : connection.transaction(execute);
}

async function createMultipleConsolidations(): Promise<
  ConsolidationAttributes[]
> {
  return await connection.transaction(async (t) => {
    // Obtener todos los members
    const members = await MemberModel.findAll({
      attributes: ["id", "user_id"],
      transaction: t,
    });

    if (!members.length) throw new Error("No hay miembros registrados");

    // ⚠️ DEBUG: Identificar miembros sin user_id
    const membersWithoutUser = members.filter((m) => m.user_id == null);

    if (membersWithoutUser.length) {
      console.warn(
        "Miembros sin user_id:",
        membersWithoutUser.map((m) => m.id),
      );
    }

    const validMembers = members.filter((m) => m.user_id != null);

    // Obtener los member_id que ya tienen consolidación
    const existing = await ConsolidationModel.findAll({
      attributes: ["member_id"],
      transaction: t,
    });

    const existingMemberIds = new Set(existing.map((c) => c.member_id));

    // Filtrar los miembros que no tienen consolidación y tienen user_id
    const missingMembers = validMembers.filter(
      (m) => !existingMemberIds.has(m.id),
    );

    if (!missingMembers.length) return [];

    // Construir las consolidaciones
    const consolidations: ConsolidationCreationAttributes[] =
      missingMembers.map((member) => ({
        user_id: member.user_id as number,
        member_id: member.id,
        network_id: null,
        how_know_us: null,
        invited_by: null,
        call_date: null,
        call_observations: null,
        other_observations: null,
        visit_date: null,
        visit_observations: null,
        is_visible: true,
      }));

    // Insertar en bloque
    try {
      const createdConsolidations = await ConsolidationModel.bulkCreate(
        consolidations,
        {
          transaction: t,
          validate: true,
        },
      );

      return createdConsolidations.map((c) => c.get({ plain: true }));
    } catch (err) {
      console.error("ERROR EN BULK CREATE:", err);
      throw err;
    }
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
  const consolidations = await ConsolidationModel.scope(["populated"]).findAll({
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
  const model = await ConsolidationModel.scope(["populated"]).findByPk(id, {
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

  const updatedRecord = await ConsolidationModel.scope(["populated"]).findByPk(
    id,
    {
      transaction: t,
    },
  );

  return updatedRecord!.get({ plain: true });
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
  createMultipleConsolidations,
  getAll,
  getById,
  update,
  remove,
};
