import { DataTypes, Op, Model as SequelizeModel, Optional } from "sequelize";
import bcrypt from "bcryptjs";
import { getSequelizeConfig } from "../config/mysql";
import { RoleType } from "./role.model";

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
    modelName: 'User',
    hooks: {
      // Hook para hashear la contraseña antes de guardar/validar
      beforeValidate: async (user: UserModel) => {
        if (user.changed('password')) {
            const pass: string = user.password ?? "";
            // Evitar hashear si ya parece hasheada
            if (pass && !pass.startsWith("$2a$") && !pass.startsWith("$2b$") && !pass.startsWith("$2y$")) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(pass, salt);
            }
        }
      },
    },
  }
);