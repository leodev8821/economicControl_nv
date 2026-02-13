import { DataTypes, Model, type Optional } from "sequelize";
import { getSequelizeConfig } from "../../config/sequelize.config.js";
import { ROLE_VALUES } from "@economic-control/shared";
import { APPLICATION_VALUES } from "@economic-control/shared";

const connection = getSequelizeConfig();

export type UserPermissionRoleType = (typeof ROLE_VALUES)[number];
export type UserPermissionApplicationType = (typeof APPLICATION_VALUES)[number];

export interface UserPermissionAttributes {
  id: number;
  user_id: number;
  application_id: number;
  role_id: number;
}

export interface UserPermissionCreationAttributes extends Optional<
  UserPermissionAttributes,
  "id"
> {}

export class UserPermissionModel
  extends Model<UserPermissionAttributes, UserPermissionCreationAttributes>
  implements UserPermissionAttributes
{
  declare id: number;
  declare user_id: number;
  declare application_id: number;
  declare role_id: number;
}

UserPermissionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "applications",
        key: "id",
      },
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
        key: "id",
      },
    },
  },
  {
    sequelize: connection,
    tableName: "user_permissions",
    timestamps: false,
    modelName: "UserPermission",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "application_id"],
      },
    ],
  },
);

export class UserPermissionActions {
  /**
   * Obtiene todos los permisos de un usuario específico
   */
  public static async getPermissionsByUser(
    userId: number,
  ): Promise<UserPermissionAttributes[]> {
    const permissions = await UserPermissionModel.findAll({
      where: { user_id: userId },
    });
    return permissions.map((p) => p.get({ plain: true }));
  }

  /**
   * Asigna un rol a un usuario en una aplicación específica.
   */
  public static async assignRole(
    data: UserPermissionCreationAttributes,
  ): Promise<UserPermissionAttributes> {
    const [permission] = await UserPermissionModel.upsert(data);
    return permission.get({ plain: true });
  }

  /**
   * Revoca el acceso de un usuario a una aplicación.
   */
  public static async revokeAccess(
    userId: number,
    appId: number,
  ): Promise<boolean> {
    const count = await UserPermissionModel.destroy({
      where: { user_id: userId, application_id: appId },
    });
    return count > 0;
  }

  /**
   * Verifica si un usuario tiene un rol específico en una aplicación.
   */
  public static async checkAccess(
    userId: number,
    application_id: number,
    requiredRole?: number,
  ): Promise<boolean> {
    const permission = await UserPermissionModel.findOne({
      where: { user_id: userId },
      include: [
        {
          association: "Application",
          where: { id: application_id },
        },
      ],
    });

    if (!permission) return false;
    if (requiredRole && permission.role_id !== requiredRole) return false;

    return true;
  }
}
