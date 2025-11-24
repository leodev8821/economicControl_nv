import { DataTypes, Model as SequelizeModel, Optional, Op } from "sequelize";
import bcrypt from "bcryptjs";
import { getSequelizeConfig } from "../config/mysql.ts";
import { RoleType } from "./role.model.ts";

const connection = getSequelizeConfig();

/** Tipos del modelo */
export type UserRole = RoleType.ADMINISTRADOR | RoleType.SUPER_USER;

export interface UserAttributes {
  id: number;
  role: UserRole;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  isVisible: boolean;
}

export type UserSearchData = {
  id?: number;
  role?: UserRole;
  username?: string | undefined;
  first_name?: string;
  last_name?: string;
  isVisible?: boolean;
};

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "isVisible"> {}

export class UserModel
  extends SequelizeModel<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare role: UserRole;
  declare username: string;
  declare password: string;
  declare first_name: string;
  declare last_name: string;
  declare isVisible: boolean;

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
    role: {
      // Usamos los valores de RoleType definidos en role.model
      type: DataTypes.ENUM(...Object.values(RoleType)),
      allowNull: false,
      references: {
        model: "roles", // Asumiendo que esta es la tabla
        key: "role",
      },
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
    isVisible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize: connection,
    tableName: "users",
    timestamps: false,
    modelName: "User",
    hooks: {
      // Hook para hashear la contraseña antes de guardar/validar
      beforeValidate: async (user: UserModel) => {
        if (user.changed("password")) {
          const pass: string = user.password ?? "";
          // Evitar hashear si ya parece hasheada
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
  }
);

export class UserActions {
  /**
   * Obtiene todas las usuarios de la base de datos.
   * @returns promise con un array de objetos UserAttributes.
   */
  public static async getAll(): Promise<UserAttributes[]> {
    const users = await UserModel.findAll();
    return users.map((user) => user.get({ plain: true }));
  }

  /**
   * obtiene un usuario que cumpla con los criterios de búsqueda proporcionados.
   * @param data criterios de búsqueda.
   * @returns promise con un objeto UserAttributes o null si no se encuentra ningun usuario.
   */
  public static async getOne(
    data: UserSearchData
  ): Promise<UserAttributes | null> {
    const user = await UserModel.findOne({ where: data });
    return user ? user.get({ plain: true }) : null;
  }

  /**
   * Obtiene un usuario visible por su ID o username.
   * @param identifier ID o username del usuario.
   * @returns promise con un objeto UserAttributes o null.
   */
  public static async getOneByAnyIdentifier(
    identifier: string | number
  ): Promise<UserAttributes | null> {
    const searchValue =
      typeof identifier === "string" ? identifier.trim() : identifier;

    const conditions: any[] = [];

    if (typeof searchValue === "number") {
      conditions.push({ id: searchValue });
    }
    if (typeof searchValue === "string") {
      conditions.push({ username: searchValue });
    }

    if (conditions.length === 0) {
      return null;
    }

    const user = await UserModel.findOne({
      where: {
        isVisible: true,
        [Op.or]: conditions,
      },
    });

    return user ? user.get({ plain: true }) : null;
  }

  /**
   * Obtiene una instancia del modelo UserModel que cumpla con los criterios de búsqueda proporcionados.
   * @param data un objeto con los criterios de búsqueda.
   * @returns Instancia de UserModel o null si no se encuentra ninguna.
   */
  public static async getOneInstance(
    data: UserSearchData
  ): Promise<UserModel | null> {
    const user = await UserModel.findOne({ where: data, raw: false });
    return user ? user : null;
  }

  /**
   * Crea un nuevo usuario en la base de datos.
   * @param data datos de la usuario a crear.
   * @returns promise con el objeto UserAttributes creado.
   */
  public static async create(
    data: UserCreationAttributes
  ): Promise<UserAttributes> {
    const newUser = await UserModel.create(data);
    return newUser.get({ plain: true });
  }

  /**
   * Elimina un usuario de la base de datos por su ID.
   * @param data criterios de búsqueda para la usuario a eliminar.
   * @returns promise con un booleano que indica si la eliminación fue exitosa.
   */
  public static async delete(data: UserSearchData): Promise<boolean> {
    const deletedCount = await UserModel.destroy({ where: data });
    return deletedCount > 0;
  }

  /**
   * Actualiza un usuario existente en la base de datos.
   * @param id ID de la usuario a actualizar.
   * @param data datos a actualizar.
   * @returns promise con un booleano que indica si la actualización fue exitosa.
   */
  public static async update(
    id: number,
    data: Partial<UserCreationAttributes>
  ): Promise<UserAttributes | null> {
    const [updatedCount] = await UserModel.update(data, { where: { id } });
    if (updatedCount === 0) {
      return null;
    }
    const updatedUser = await UserModel.findByPk(id);
    return updatedUser ? updatedUser.get({ plain: true }) : null;
  }
}
