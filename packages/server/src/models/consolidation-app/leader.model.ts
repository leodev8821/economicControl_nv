import {
  DataTypes,
  Model as SequelizeModel,
  type Optional,
  Op,
} from "sequelize";
import bcrypt from "bcryptjs";
import { getSequelizeConfig } from "../../config/sequelize.config.js";
import { ROLE_TYPES } from "../finance-app/role.model.js";

const connection = getSequelizeConfig();

/** Tipos del modelo */
export type UserRole =
  | typeof ROLE_TYPES.ADMINISTRADOR
  | typeof ROLE_TYPES.SUPER_USER;

export interface LiderAttributes {
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

export interface LiderCreationAttributes extends Optional<
  LiderAttributes,
  "id" | "is_visible"
> {}

export class LiderModel
  extends SequelizeModel<LiderAttributes, LiderCreationAttributes>
  implements LiderAttributes
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

LiderModel.init(
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
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_visible",
    },
  },
  {
    sequelize: connection,
    tableName: "leaders",
    timestamps: false,
    modelName: "Lider",

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
      beforeSave: async (user: LiderModel) => {
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

export class LiderActions {
  /**
   * Inicia sesión en el sistema.
   * @param login_data username del usuario.
   * @param password contraseña del usuario.
   * @returns promise con un objeto UserAttributes o null si no se encuentra ningun usuario.
   */
  public static async login(
    login_data: string,
    password: string,
  ): Promise<LiderAttributes | null> {
    const user = await LiderModel.scope(["withPassword", "visible"]).findOne({
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

    return userWithoutPassword as LiderAttributes;
  }

  /**
   * Obtiene todas las usuarios de la base de datos.
   * @returns promise con un array de objetos UserAttributes.
   */
  public static async getAll(): Promise<LiderAttributes[]> {
    const users = await LiderModel.scope("visible").findAll();
    return users.map((u) => u.get({ plain: true }));
  }

  /**
   * obtiene un usuario que cumpla con los criterios de búsqueda proporcionados.
   * @param data criterios de búsqueda.
   * @returns promise con un objeto UserAttributes o null si no se encuentra ningun usuario.
   */
  public static async getOne(
    data: UserSearchData,
  ): Promise<LiderAttributes | null> {
    const user = await LiderModel.scope("visible").findOne({
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
  ): Promise<LiderAttributes | null> {
    const conditions =
      typeof identifier === "number"
        ? [{ id: identifier }]
        : [{ username: identifier.trim() }];

    const user = await LiderModel.scope("visible").findOne({
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
  ): Promise<LiderModel | null> {
    return LiderModel.findOne({ where: data });
  }

  /**
   * Crea un nuevo usuario en la base de datos.
   * @param data datos de la usuario a crear.
   * @returns promise con el objeto UserAttributes creado.
   */
  public static async create(
    data: LiderCreationAttributes,
  ): Promise<LiderAttributes> {
    const user = await LiderModel.create(data);
    return user.get({ plain: true });
  }

  /**
   * Elimina un usuario de la base de datos por su ID.
   * @param data criterios de búsqueda para la usuario a eliminar.
   * @returns promise con un booleano que indica si la eliminación fue exitosa.
   */
  public static async delete(id: number): Promise<boolean> {
    const [count] = await LiderModel.update(
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
    data: Partial<LiderCreationAttributes>,
  ): Promise<LiderAttributes | null> {
    const [count] = await LiderModel.update(data, { where: { id } });
    if (!count) return null;

    const updated = await LiderModel.findByPk(id);
    return updated ? updated.get({ plain: true }) : null;
  }
}
