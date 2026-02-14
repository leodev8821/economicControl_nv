import {
  DataTypes,
  Model as SequelizeModel,
  type Optional,
  Op,
} from "sequelize";
import bcrypt from "bcryptjs";
import { getSequelizeConfig } from "../../config/sequelize.config.js";
import { ROLE_TYPES } from "../auth/role.model.js";
import { UserPermissionModel } from "./user-permission.model.js";
import { APP_IDS } from "src/shared/app.constants.js";

const connection = getSequelizeConfig();

/** Tipos del modelo */
export type UserRole =
  | typeof ROLE_TYPES.ADMINISTRADOR
  | typeof ROLE_TYPES.SUPER_USER;

export interface UserAttributes {
  id: number;
  role_name: UserRole;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  is_visible: boolean;
}

export type LoginPayload = {
  id: number;
  role_name: UserRole;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  permissions: {
    application_id: number;
    role_id: number;
  }[];
};

export type UserSearchData = {
  id?: number;
  role_name?: UserRole;
  username?: string | undefined;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  is_visible?: boolean;
};

export interface UserCreationAttributes extends Optional<
  UserAttributes,
  "id" | "is_visible" | "email" | "phone"
> {}

export class UserModel
  extends SequelizeModel<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare role_name: UserRole;
  declare username: string;
  declare password: string;
  declare first_name: string;
  declare last_name: string;
  declare email: string;
  declare phone: string;
  declare is_visible: boolean;

  // Método auxiliar para verificar la contraseña
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_visible",
    },
  },
  {
    sequelize: connection,
    tableName: "users",
    timestamps: false,
    modelName: "User",

    defaultScope: {
      attributes: { exclude: ["password"] },
    },

    scopes: {
      withPassword: {
        attributes: { include: ["password"] },
      },

      visible: {
        where: { is_visible: true },
      },
    },

    hooks: {
      beforeSave: async (user: UserModel) => {
        if (user.changed("password")) {
          const pass: string = user.password ?? "";
          if (
            pass &&
            !pass.startsWith("$2a$") &&
            !pass.startsWith("$2b$") &&
            !pass.startsWith("$2y$")
          ) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(pass, salt);
          }
        }
      },
    },
  },
);

export class UserActions {
  /**
   * Inicia sesión en el sistema.
   * @param login_data username del usuario.
   * @param password contraseña del usuario.
   * @returns promise con un objeto UserAttributes o null si no se encuentra ningun usuario.
   */
  public static async login(
    login_data: string,
    password: string,
  ): Promise<UserAttributes | null> {
    const user = await UserModel.scope(["withPassword", "visible"]).findOne({
      where: {
        username: login_data,
      },
    });

    if (!user) return null;

    const valid = await user.comparePassword(password);

    if (!valid) return null;

    const { password: _, ...userWithoutPassword } = user.get({
      plain: true,
    });

    return userWithoutPassword as UserAttributes;
  }

  /**
   * Obtiene todas las usuarios de la base de datos.
   * @returns promise con un array de objetos UserAttributes.
   */
  public static async getAll(appId?: number): Promise<UserAttributes[]> {
    try {
      const permissionsInclude: any = {
        model: UserPermissionModel,
        as: "Permissions",
        required: false,
      };

      if (appId && appId > APP_IDS.ALL) {
        permissionsInclude.where = { application_id: appId };
        permissionsInclude.required = true;
      }

      /* const users = await UserModel.scope("visible").findAll({
        include: [permissionsInclude],
      }); */

      const users = await UserModel.findAll({
        where: { is_visible: true },
        include: [permissionsInclude],
        attributes: { exclude: ["password"] },
      });

      return users.map((u) => u.get({ plain: true }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * obtiene un usuario que cumpla con los criterios de búsqueda proporcionados.
   * @param data criterios de búsqueda.
   * @returns promise con un objeto UserAttributes o null si no se encuentra ningun usuario.
   */
  public static async getOne(
    data: UserSearchData,
  ): Promise<UserAttributes | null> {
    const user = await UserModel.scope("visible").findOne({
      where: data,
    });

    return user ? user.get({ plain: true }) : null;
  }

  /**
   * Obtiene un usuario visible por su ID o username.
   * @param identifier ID o username del usuario.
   * @returns promise con un objeto UserAttributes o null.
   */
  public static async getOneByAnyIdentifier(
    identifier: string | number,
  ): Promise<UserAttributes | null> {
    const conditions =
      typeof identifier === "number"
        ? [{ id: identifier }]
        : [{ username: identifier.trim() }];

    const user = await UserModel.scope("visible").findOne({
      where: { [Op.or]: conditions },
    });

    return user ? user.get({ plain: true }) : null;
  }

  /**
   * Obtiene una instancia del modelo UserModel que cumpla con los criterios de búsqueda proporcionados.
   * @param data un objeto con los criterios de búsqueda.
   * @returns Instancia de UserModel o null si no se encuentra ninguna.
   */
  public static async getOneInstance(
    data: UserSearchData,
  ): Promise<UserModel | null> {
    return UserModel.findOne({ where: data });
  }

  /**
   * Crea un nuevo usuario en la base de datos.
   * @param data datos de la usuario a crear.
   * @returns promise con el objeto UserAttributes creado.
   */
  public static async createWithPermissions(
    data: UserCreationAttributes,
    permissions: { application_id: number; role_id: number }[],
  ): Promise<UserAttributes> {
    const sequelize = getSequelizeConfig();
    const transaction = await sequelize.transaction();

    try {
      const user = await UserModel.create(data, { transaction });

      if (permissions && permissions.length > 0) {
        const permissionsToCreate = permissions.map((p) => ({
          user_id: user.id,
          application_id: p.application_id,
          role_id: p.role_id,
        }));

        await UserPermissionModel.bulkCreate(permissionsToCreate, {
          transaction,
        });
      }

      await transaction.commit();
      return user.get({ plain: true });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Elimina un usuario de la base de datos por su ID.
   * @param data criterios de búsqueda para la usuario a eliminar.
   * @returns promise con un booleano que indica si la eliminación fue exitosa.
   */
  public static async delete(id: number): Promise<boolean> {
    const [count] = await UserModel.update(
      { is_visible: false },
      { where: { id } },
    );

    return count > 0;
  }

  /**
   * Actualiza un usuario existente en la base de datos.
   * @param id ID de la usuario a actualizar.
   * @param data datos a actualizar.
   * @returns promise con un booleano que indica si la actualización fue exitosa.
   */
  public static async update(
    id: number,
    data: Partial<UserCreationAttributes>,
  ): Promise<UserAttributes | null> {
    const [count] = await UserModel.update(data, { where: { id } });
    if (!count) return null;

    const updated = await UserModel.findByPk(id);
    return updated ? updated.get({ plain: true }) : null;
  }
}
