import { DataTypes, Model as SequelizeModel, type Optional } from "sequelize";

import { getSequelizeConfig } from "../../config/sequelize.config.js";

import { STATUS, type StatusType } from "@economic-control/shared";

const connection = getSequelizeConfig();

/** Tipos del modelo */

export interface MemberRegisterAttributes {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  birth_date: string;
  status: StatusType;
  is_visible: boolean;
}

export type MemberRegisterSearchData = {
  id?: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  birth_date?: string;
  status?: StatusType;
  is_visible?: boolean;
};

/** Campos opcionales al crear (id autoincremental, is_visible tiene un valor por defecto) */

export interface MemberRegisterCreationAttributes extends Optional<
  MemberRegisterAttributes,
  "id" | "is_visible"
> {}

/** Clase tipada de Sequelize */
export class MemberRegisterModel
  extends SequelizeModel<
    MemberRegisterAttributes,
    MemberRegisterCreationAttributes
  >
  implements MemberRegisterAttributes
{
  declare id: number;
  declare first_name: string;
  declare last_name: string;
  declare phone: string;
  declare gender: string;
  declare birth_date: string;
  declare status: StatusType;
  declare is_visible: boolean;
}

/** Inicialización del modelo */

MemberRegisterModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
      type: DataTypes.STRING(1),
      allowNull: false,
    },

    birth_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...STATUS),
      allowNull: false,
    },

    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },

  {
    sequelize: connection,
    tableName: "member_registers",
    timestamps: false,
    modelName: "MemberRegister",

    scopes: {
      visible: {
        where: { is_visible: true },
      },
    },
  },
);

export class MemberRegisterActions {
  /**
   * Obtiene todas las personas de la base de datos.
   * @returns promise con un array de objetos PersonAttributes.
   */

  public static async getAll(): Promise<MemberRegisterAttributes[]> {
    const persons = await MemberRegisterModel.findAll();

    return persons.map((person) => person.get({ plain: true }));
  }

  /**
   * obtiene un persona que cumpla con los criterios de búsqueda proporcionados.
   * @param data criterios de búsqueda.
   * @returns promise con un objeto PersonAttributes o null si no se encuentra ningun persona.
   */

  public static async getOne(
    data: MemberRegisterSearchData,
  ): Promise<MemberRegisterAttributes | null> {
    const person = await MemberRegisterModel.scope("visible").findOne({
      where: data,
    });

    return person ? person.get({ plain: true }) : null;
  }

  /**
   * Crea un nuevo persona en la base de datos.
   * @param data datos de la persona a crear.
   * @returns promise con el objeto PersonAttributes creado.
   */

  public static async create(
    data: MemberRegisterCreationAttributes,
  ): Promise<MemberRegisterAttributes> {
    return await connection.transaction(async (t) => {
      const newPerson = await MemberRegisterModel.create(data, {
        transaction: t,
      });

      return newPerson.get({ plain: true });
    });
  }

  /**
   * Elimina un persona de la base de datos por su ID.
   * @param data criterios de búsqueda para la persona a eliminar.
   * @returns promise con un booleano que indica si la eliminación fue exitosa.
   */

  public static async delete(id: number): Promise<boolean> {
    const [count] = await MemberRegisterModel.update(
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
    data: Partial<MemberRegisterCreationAttributes>,
  ): Promise<MemberRegisterAttributes | null> {
    return await connection.transaction(async (t) => {
      const [count] = await MemberRegisterModel.update(data, {
        where: { id },
        transaction: t,
      });

      if (!count) return null;

      const updatedPerson = await MemberRegisterModel.findByPk(id, {
        transaction: t,
      });

      return updatedPerson ? updatedPerson.get({ plain: true }) : null;
    });
  }
}
