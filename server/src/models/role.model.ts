import { DataTypes, Op, Model as SequelizeModel, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";

const connection = getSequelizeConfig();

/**
 * Posibles valores para el campo role.
 */
export type RoleType = "Administrador" | "SuperUser";

/**
 * Atributos del modelo Role.
 */
export interface RoleAttributes {
  id: number;
  role: RoleType;
}

/**
 * Atributos para creación de Role (id es opcional porque es autoincremental).
 */
export interface RoleCreationAttributes extends Optional<RoleAttributes, "id"> {}

/**
 * Clase Role que extiende de Sequelize.Model
 */
class RoleModel
  extends SequelizeModel<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public id!: number;
  public role!: RoleType;
}

// Extender el tipo de instancia del modelo
interface IRoleModel extends RoleModel {
    get: (options: { plain: true }) => RoleAttributes;
}

// Exportar el modelo con los tipos correctos
export const Role = RoleModel as unknown as typeof RoleModel & {
    new (): IRoleModel;
    findOne: (options: any) => Promise<IRoleModel | null>;
    findAll: (options: any) => Promise<IRoleModel[]>;
    create: (data: RoleCreationAttributes) => Promise<IRoleModel>;
    update: (data: Partial<RoleAttributes>, options: any) => Promise<[number]>;
    destroy: (options: any) => Promise<number>;
};

(RoleModel as unknown as typeof SequelizeModel).init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role: {
      type: DataTypes.ENUM("Administrador", "SuperUser"),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize: connection,
    tableName: "roles",
    timestamps: false,
  }
);

/**
 * Obtiene todos los roles.
 *
 * @async
 * @function getAllRoles
 * @returns {Promise<RoleAttributes[]>} - Lista de roles disponibles.
 * @throws {Error} - Lanza un error si hay un problema al consultar los roles.
 */
export async function getAllRoles(): Promise<RoleAttributes[]> {
  try {
    return await Role.findAll({ raw: true });
  } catch (error: any) {
    console.error("Error al obtener roles:", error.message);
    throw new Error(`Error al obtener roles: ${error.message}`);
  }
}
