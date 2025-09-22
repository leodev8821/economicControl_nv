// models/user.ts
import { DataTypes, Op, Model as SequelizeModel, Optional } from "sequelize";
import bcrypt from "bcryptjs";
import { getSequelizeConfig } from "../config/mysql";
import { RoleType } from "./role.model";

const connection = getSequelizeConfig();

/** Tipos del modelo */
export type UserRole = RoleType | "Administrador" | "SuperUser";

export interface UserAttributes {
  id: number;
  role: UserRole;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  isVisible: boolean;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "isVisible"> {}

class UserModel
  extends SequelizeModel<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public role!: UserRole;
  public username!: string;
  public password!: string;
  public first_name!: string;
  public last_name!: string;
  public isVisible!: boolean;
}

// Extender el tipo de instancia del modelo
interface IUserModel extends UserModel {
    get: (options: { plain: true }) => UserAttributes;
    save: () => Promise<IUserModel>;
}

// Exportar el modelo con los tipos correctos
export const User = UserModel as unknown as typeof UserModel & {
    new (): IUserModel;
    findOne: (options: any) => Promise<IUserModel | null>;
    findAll: (options: any) => Promise<IUserModel[]>;
    create: (data: UserCreationAttributes) => Promise<IUserModel>;
    update: (data: Partial<UserAttributes>, options: any) => Promise<[number]>;
    destroy: (options: any) => Promise<number>;
};

(UserModel as unknown as typeof SequelizeModel).init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role: {
      type: DataTypes.ENUM("Administrador", "SuperUser"),
      allowNull: false,
      references: {
        model: "roles",
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
    hooks: {
      beforeValidate: async (user: any) => {
        if (typeof user.changed === "function" && user.changed("password")) {
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
  }
);

/**
 * Crea un nuevo usuario si no existe (por username).
 */
export async function createNewUser(
  data: UserCreationAttributes
): Promise<UserAttributes | null> {
  try {
    const existing = await User.findOne({
      where: { username: data.username },
      raw: true,
    });
    if (existing) return null;

    const newUser = await User.create(data);
    return newUser.get({ plain: true }) as UserAttributes;
  } catch (error: any) {
    console.error("Error al crear Usuario:", error.message);
    throw new Error(`Error al crear Usuario: ${error.message}`);
  }
}

/**
 * Obtiene todos los usuarios.
 */
export async function getAllUsers(): Promise<UserAttributes[]> {
  try {
    return (await User.findAll({ raw: true })) as UserAttributes[];
  } catch (error: any) {
    console.error("Error al consultar la base de datos: ", error.message);
    throw new Error(`Error al consultar la base de datos: ${error.message}`);
  }
}

/**
 * Obtiene un usuario por ID o username (solo visibles).
 */
export async function getOneUser(
  identifier: string | number
): Promise<UserAttributes | null> {
  try {
    const fields = ["id", "username"];
    const searchValue =
      typeof identifier === "string" ? identifier.trim() : identifier;
    const user = await User.findOne({
      where: {
        [Op.and]: [{ isVisible: true }],
        [Op.or]: fields.map((f) => ({ [f]: searchValue })),
      },
      raw: true,
    });
    return (user as UserAttributes) ?? null;
  } catch (error: any) {
    console.error(
      `Error al buscar usuario con Id/username "${identifier}":`,
      error.message
    );
    throw new Error(
      `Error al buscar usuario con Id/username "${identifier}": ${error.message}`
    );
  }
}

/**
 * Actualiza un usuario y devuelve objeto plano actualizado.
 */
export async function updateOneUser(
  searchFields: string[],
  newData: Partial<UserAttributes>
): Promise<UserAttributes | null> {
  try {
    const whereClauses = searchFields
      .map((field) => {
        const val = (newData as any)[field];
        return typeof val !== "undefined" ? { [field]: val } : null;
      })
      .filter(Boolean) as any[];

    if (whereClauses.length === 0) return null;

    const existing = await User.findOne({
      where: { [Op.or]: whereClauses },
      raw: true,
    });
    if (!existing) return null;

    await User.update(newData, { where: { [Op.or]: whereClauses } });
    return { ...(existing as UserAttributes), ...newData };
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error.message);
    throw new Error(`Error al actualizar usuario: ${error.message}`);
  }
}

/**
 * Elimina (soft delete) un usuario por ID o username.
 */
export async function deleteUser(
  identifier: string | number
): Promise<UserAttributes | null> {
  try {
    const searchValue =
      typeof identifier === "string" ? identifier.trim() : identifier;

    const user = await User.findOne({
      where: {
        [Op.or]: [
          typeof searchValue === "number" ? { id: searchValue } : {},
          typeof searchValue === "string" ? { username: searchValue } : {},
        ],
      }
    });

    if (!user) return null;

    // Actualizamos usando el método update para mantener consistencia
    await User.update(
      { isVisible: false },
      {
        where: {
          [Op.or]: [
            typeof searchValue === "number" ? { id: searchValue } : {},
            typeof searchValue === "string" ? { username: searchValue } : {},
          ],
        }
      }
    );

    // Retornamos el objeto actualizado
    return { ...user.get({ plain: true }), isVisible: false };
  } catch (error: any) {
    console.error(
      `Error al eliminar el usuario ${JSON.stringify(identifier)}`,
      error.message
    );
    throw new Error(`Error al eliminar el Usuario: ${error.message}`);
  }
}
