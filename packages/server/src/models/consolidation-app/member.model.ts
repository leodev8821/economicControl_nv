import {
  DataTypes,
  Model as SequelizeModel,
  Transaction,
  type Optional,
} from "sequelize";

import { getSequelizeConfig } from "@config/sequelize.config.js";

import { GENDER, STATUS, type StatusType } from "@economic-control/shared";
import { UserModel } from "@models/auth/user.model.js";

const connection = getSequelizeConfig();

/** Tipos del modelo */

export interface MemberAttributes {
  id: number;
  user_id: number | null;
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  birth_date: string;
  status: StatusType;
  visit_date: string;
  is_visible: boolean;
}

export type MemberSearchData = {
  id?: number;
  user_id?: number | null;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  birth_date?: string;
  status?: StatusType;
  visit_date?: string;
  is_visible?: boolean;
};

/** Campos opcionales al crear (id autoincremental, is_visible tiene un valor por defecto) */

export interface MemberCreationAttributes extends Optional<
  MemberAttributes,
  "id" | "is_visible" | "user_id"
> {}

/** Clase tipada de Sequelize */
export class MemberModel
  extends SequelizeModel<MemberAttributes, MemberCreationAttributes>
  implements MemberAttributes
{
  declare id: number;
  declare user_id: number | null;
  declare first_name: string;
  declare last_name: string;
  declare phone: string;
  declare gender: string;
  declare birth_date: string;
  declare status: StatusType;
  declare visit_date: string;
  declare is_visible: boolean;
}

/** Inicialización del modelo */

MemberModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },

    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING(15),
      unique: true,
      allowNull: false,
    },

    gender: {
      type: DataTypes.ENUM(...GENDER),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...STATUS),
      allowNull: false,
    },

    birth_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    visit_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },

  {
    sequelize: connection,
    tableName: "members",
    timestamps: false,
    modelName: "Member",
    scopes: {
      visible: {
        where: { is_visible: true },
      },
    },
  },
);

export class MemberActions {
  /**
   * Helper para formatear las fechas
   * @param date fecha a formatear
   * @returns fecha formateada
   */
  private static normalizeDate = (date: string): string => {
    if (typeof date !== "string") return date;

    const ddmmyyyy = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = date.match(ddmmyyyy);

    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }

    return date;
  };

  /**
   * Helper para obtener la configuración de includes
   * @returns array con la configuración de includes
   */
  private static getIncludeConfig() {
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

  public static async getAll(
    includeHidden: boolean = false,
  ): Promise<MemberAttributes[]> {
    try {
      const whereClause: any = includeHidden ? {} : { is_visible: true };
      const members = await MemberModel.findAll({
        where: whereClause,
        include: this.getIncludeConfig(),
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

  public static async getOne(
    data: MemberSearchData,
  ): Promise<MemberAttributes | null> {
    const person = await MemberModel.scope("visible").findOne({
      where: data,
      include: this.getIncludeConfig(),
    });

    return person ? person.get({ plain: true }) : null;
  }

  /**
   * Crea un nuevo miembro en la base de datos.
   * @param data datos de la persona a crear.
   * @param currentUserId id del usuario autenticado (desde JWT)
   */
  public static async create(
    data: Omit<MemberCreationAttributes, "user_id">,
    currentUserId: number,
  ): Promise<MemberAttributes> {
    return await connection.transaction(async (t) => {
      const newMember = await MemberModel.create(
        {
          ...data,
          user_id: currentUserId,
          birth_date: this.normalizeDate(data.birth_date),
          visit_date: this.normalizeDate(data.visit_date),
        },
        { transaction: t },
      );

      return newMember.get({ plain: true });
    });
  }

  /**
   * Crea múltiples miembros en una sola transacción.
   * @param dataList Arreglo de datos de miembros a crear.
   * @returns Promise con el array de miembros creados.
   */
  public static async createMultipleMembers(
    dataList: Omit<MemberCreationAttributes, "user_id">[],
    currentUserId: number,
  ): Promise<MemberAttributes[]> {
    return await connection.transaction(async (t) => {
      // Transformamos la data antes de insertar (ej. formatear la fecha)
      const normalizedData = dataList.map((item) => {
        return {
          ...item,
          user_id: currentUserId,
          birth_date: this.normalizeDate(item.birth_date),
          visit_date: this.normalizeDate(item.visit_date),
        };
      });

      const newMembers = await MemberModel.bulkCreate(normalizedData, {
        transaction: t,
        validate: true,
      });

      return newMembers.map((member) => member.get({ plain: true }));
    });
  }

  /**
   * Elimina un persona de la base de datos por su ID.
   * @param data criterios de búsqueda para la persona a eliminar.
   * @returns promise con un booleano que indica si la eliminación fue exitosa.
   */

  public static async delete(id: number): Promise<boolean> {
    const [count] = await MemberModel.update(
      { is_visible: false },
      { where: { id } },
    );

    return count > 0;
  }

  /**
   * Actualiza un persona existente en la base de datos.
   * @param id ID de la persona a actualizar.
   * @param data datos a actualizar.
   * @returns promise con un booleano que indica si la actualización fue exitosa.
   */

  public static async update(
    id: number,
    data: Partial<MemberCreationAttributes>,
    transaction?: Transaction,
  ): Promise<MemberAttributes | null> {
    return await connection.transaction(async (t) => {
      const [count] = await MemberModel.update(data, {
        where: { id },
        transaction: t,
      });

      if (!count) return null;

      const updatedPerson = await MemberModel.findByPk(id, {
        transaction,
      });

      return updatedPerson ? updatedPerson.get({ plain: true }) : null;
    });
  }
}
