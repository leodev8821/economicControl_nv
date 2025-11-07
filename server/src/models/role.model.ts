// models/role.ts
import { DataTypes, Model as SequelizeModel, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";

const connection = getSequelizeConfig();

/**
 * Posibles valores para el campo role.
 */
export enum RoleType {
  ADMINISTRADOR = "Administrador",
  SUPER_USER = "SuperUser",
}

/**
 * Atributos del modelo Role.
 */
export interface RoleAttributes {
  id: number;
  role: RoleType;
}

export type RoleSearchData = {
  id?: number;
  role?: string | RoleType;
};

/**
 * Atributos para creación de Role (id es opcional porque es autoincremental).
 */
export interface RoleCreationAttributes extends Optional<RoleAttributes, "id"> {}

/**
 * Clase Role que extiende de Sequelize.Model
 */
export class RoleModel extends SequelizeModel<RoleAttributes, RoleCreationAttributes> implements RoleAttributes
{
  declare id: number;
  declare role: RoleType;
}

/** Inicialización del modelo */
RoleModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(RoleType)),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize: connection,
    tableName: "roles",
    timestamps: false,
    modelName: 'Role'
  }
);

export class RoleActions{

  
      /**
       * Obtiene todas las rols de la base de datos.
       * @returns promise con un array de objetos RoleAttributes.
       */
      public static async getAll(): Promise<RoleAttributes[]> {
          const roles = await RoleModel.findAll();
          return roles.map(role => role.get({ plain: true }));
      }
  
      /**
       * obtiene un rol que cumpla con los criterios de búsqueda proporcionados.
       * @param data criterios de búsqueda.
       * @returns promise con un objeto RoleAttributes o null si no se encuentra ningun rol.
       */
      public static async getOne(data: RoleSearchData): Promise<RoleAttributes | null> {
          const role = await RoleModel.findOne({ where: data});
          return role ? role.get({ plain: true }) : null;
      }
  
      /**
       * Crea un nuevo rol en la base de datos.
       * @param data datos de la rol a crear.
       * @returns promise con el objeto RoleAttributes creado.
       */
      public static async create(data: RoleCreationAttributes): Promise<RoleAttributes> {
          const newRole = await RoleModel.create(data);
          return newRole.get({ plain: true });
      }
  
      /**
       * Elimina un rol de la base de datos por su ID.
       * @param data criterios de búsqueda para la rol a eliminar.
       * @returns promise con un booleano que indica si la eliminación fue exitosa.
       */
      public static async delete(data: RoleSearchData): Promise<boolean> {
          const deletedCount = await RoleModel.destroy({ where: data });
          return deletedCount > 0;
      }
  
      /**
       * Actualiza un rol existente en la base de datos.
       * @param id ID de la rol a actualizar.
       * @param data datos a actualizar.
       * @returns promise con un booleano que indica si la actualización fue exitosa.
       */
      public static async update(id: number, data: Partial<RoleCreationAttributes>): Promise<RoleAttributes | null> {
          const [updatedCount] = await RoleModel.update(data, { where: { id } });
          if(updatedCount === 0) {
              return null;
          }
          const updatedRole = await RoleModel.findByPk(id);
          return updatedRole ? updatedRole.get({ plain: true }) : null;
      }
}