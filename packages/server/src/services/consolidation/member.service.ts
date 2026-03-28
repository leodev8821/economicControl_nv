import {
  BulkMemberCreateDTO,
  MemberCreateDTO,
  MemberUpdateDTO,
} from "@economic-control/shared";
import {
  MemberAttributes,
  MemberModel,
} from "@models/consolidation-app/member.model.js";
import { UserModel } from "@models/auth/user.model.js";
import {
  ConsolidationCreationAttributes,
  ConsolidationModel,
} from "@models/consolidation-app/consolidation.model.js";
import { getSequelizeConfig } from "@config/sequelize.config.js";
import { consolidationService } from "./consolidation.service.js";
import { Transaction } from "sequelize";
import { JwtPayload } from "src/auth/auth.types.js";
import { ROLE_TYPES } from "@economic-control/shared";

const connection = getSequelizeConfig();

/**
 * Helper para obtener la configuración de includes
 * @returns array con la configuración de includes
 */
function getIncludeConfig() {
  return [
    {
      model: UserModel,
      as: "User",
      attributes: ["id", "first_name", "username"],
      required: true,
    },
  ];
}

/**
 * Obtiene todas las personas de la base de datos.
 * @returns promise con un array de objetos PersonAttributes.
 */

async function getAll(
  includeHidden: boolean = false,
): Promise<MemberAttributes[]> {
  try {
    const whereClause: any = includeHidden ? {} : { is_visible: true };
    const members = await MemberModel.findAll({
      where: whereClause,
      include: getIncludeConfig(),
    });

    return members.map((member) => member.get({ plain: true }));
  } catch (error) {
    console.error("Error al obtener todas las personas:", error);
    throw error;
  }
}

/**
 * obtiene un persona que cumpla con los criterios de búsqueda proporcionados.
 * @param data criterios de búsqueda.
 * @returns promise con un objeto PersonAttributes o null si no se encuentra ningun persona.
 */

async function getById(
  id: number,
  includeHidden: boolean = false,
): Promise<MemberAttributes | null> {
  const whereClause: any = includeHidden ? {} : { is_visible: true };
  const person = await MemberModel.findOne({
    where: { id, ...whereClause },
    include: getIncludeConfig(),
  });

  return person ? person.get({ plain: true }) : null;
}

/**
 * Crea un nuevo miembro en la base de datos.
 * @param data datos de la persona a crear.
 * @param currentUser id del usuario autenticado (desde JWT)
 */
async function create(
  data: MemberCreateDTO,
  currentUser: JwtPayload & { permissions: any[] },
): Promise<MemberAttributes> {
  const isAdmin =
    currentUser.role_name === ROLE_TYPES.ADMINISTRADOR ||
    currentUser.role_name === ROLE_TYPES.SUPER_USER;

  const finalUserId = isAdmin && data.user_id ? data.user_id : currentUser.id;

  return await connection.transaction(async (t) => {
    const newMember = await MemberModel.create(
      {
        ...data,
        user_id: finalUserId,
      },
      { transaction: t },
    );

    // 🔹 Crear consolidation automáticamente
    await consolidationService.create(
      {
        user_id: finalUserId,
        member_id: newMember.id,
        network_id: null,
        call_date: null,
        call_observations: null,
        other_observations: null,
        visit_date: null,
        visit_observations: null,
        is_visible: true,
      },
      t,
    );

    return newMember.get({ plain: true });
  });
}

/**
 * Crea multiples miembros y su consolidacion en una transacción
 * @param dataList Arreglo de datos de miembros a crear.
 * @param currentUserId Id del usuario actual
 * @returns Promise con el array de miembros creados.
 */
async function createMultipleMembers(
  dataList: BulkMemberCreateDTO[],
  currentUser: JwtPayload & { permissions: any[] },
): Promise<MemberAttributes[]> {
  const isAdmin =
    currentUser.role_name === ROLE_TYPES.ADMINISTRADOR ||
    currentUser.role_name === ROLE_TYPES.SUPER_USER;

  return await connection.transaction(async (t) => {
    const normalizedData = dataList.map((item) => {
      const finalUserId =
        isAdmin && item.user_id ? item.user_id : currentUser.id;

      if (item.user_id && !isAdmin) {
        throw new Error("No autorizado para asignar líder");
      }

      return {
        ...item,
        user_id: finalUserId,
      };
    });

    const newMembers = await MemberModel.bulkCreate(normalizedData, {
      transaction: t,
      validate: true,
      returning: true,
    });

    // Crear consolidations para cada miembro
    const consolidations: ConsolidationCreationAttributes[] = newMembers.map(
      (member, index) => ({
        user_id: normalizedData[index].user_id,
        member_id: member.id,
        network_id: null,
        call_date: null,
        call_observations: null,
        other_observations: null,
        visit_date: null,
        visit_observations: null,
        is_visible: true,
      }),
    );

    await ConsolidationModel.bulkCreate(consolidations, {
      transaction: t,
      validate: true,
    });

    return newMembers.map((member) => member.get({ plain: true }));
  });
}

/**
 * Actualiza un persona existente en la base de datos.
 * @param id ID de la persona a actualizar.
 * @param data datos a actualizar.
 * @returns promise con un booleano que indica si la actualización fue exitosa.
 */

async function update(
  id: number,
  data: MemberUpdateDTO,
  transaction?: Transaction,
): Promise<MemberAttributes | null> {
  const executeUpdate = async (t: Transaction) => {
    const [count] = await MemberModel.update(data, {
      where: { id },
      transaction: t,
    });

    if (!count) return null;

    const updatedPerson = await MemberModel.findByPk(id, {
      transaction: t,
    });

    return updatedPerson ? updatedPerson.get({ plain: true }) : null;
  };

  if (transaction) return executeUpdate(transaction);
  return await connection.transaction(executeUpdate);
}

/**
 * Elimina un persona de la base de datos por su ID.
 * @param data criterios de búsqueda para la persona a eliminar.
 * @returns promise con un booleano que indica si la eliminación fue exitosa.
 */

async function deleteMember(id: number): Promise<boolean> {
  const [count] = await MemberModel.update(
    { is_visible: false },
    { where: { id } },
  );

  return count > 0;
}

export const memberService = {
  getAll,
  getOne: getById,
  create,
  createMultipleMembers,
  delete: deleteMember,
  update,
};
