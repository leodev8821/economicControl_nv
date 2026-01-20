import { DataTypes, Model as SequelizeModel, type Optional } from "sequelize";
import { getSequelizeConfig } from "../config/sequelize.config.js";

const connection = getSequelizeConfig();

/** Tipos del modelo */
export interface PersonAttributes {
  id: number;
  first_name: string;
  last_name: string;
  dni: string;
  is_visible: boolean;
}

export type PersonSearchData = {
  id?: number;
  first_name?: string;
  last_name?: string;
  dni?: string | undefined;
  is_visible?: boolean;
};

/** Campos opcionales al crear (id autoincremental, is_visible tiene un valor por defecto) */
export interface PersonCreationAttributes
  extends Optional<PersonAttributes, "id" | "is_visible"> {}

/** Clase tipada de Sequelize */
export class PersonModel
  extends SequelizeModel<PersonAttributes, PersonCreationAttributes>
  implements PersonAttributes
{
  declare id: number;
  declare first_name: string;
  declare last_name: string;
  declare dni: string;
  declare is_visible: boolean;
}

/** Inicialización del modelo */
PersonModel.init(
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
    dni: {
      type: DataTypes.STRING(9),
      unique: true,
      allowNull: false,
    },
    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize: connection,
    tableName: "persons",
    timestamps: false,
    modelName: "Person",
  }
);

export class PersonActions {
  /**
   * Obtiene todas las personas de la base de datos.
   * @returns promise con un array de objetos PersonAttributes.
   */
  public static async getAll(): Promise<PersonAttributes[]> {
    const persons = await PersonModel.findAll();
    return persons.map((person) => person.get({ plain: true }));
  }

  /**
   * obtiene un persona que cumpla con los criterios de búsqueda proporcionados.
   * @param data criterios de búsqueda.
   * @returns promise con un objeto PersonAttributes o null si no se encuentra ningun persona.
   */
  public static async getOne(
    data: PersonSearchData
  ): Promise<PersonAttributes | null> {
    const person = await PersonModel.findOne({ where: data });
    return person ? person.get({ plain: true }) : null;
  }

  /**
   * Crea un nuevo persona en la base de datos.
   * @param data datos de la persona a crear.
   * @returns promise con el objeto PersonAttributes creado.
   */
  public static async create(
    data: PersonCreationAttributes
  ): Promise<PersonAttributes> {
    return await connection.transaction(async (t) => {
      const newPerson = await PersonModel.create(data, { transaction: t });
      return newPerson.get({ plain: true });
    });
  }

  /**
   * Elimina un persona de la base de datos por su ID.
   * @param data criterios de búsqueda para la persona a eliminar.
   * @returns promise con un booleano que indica si la eliminación fue exitosa.
   */
  public static async delete(data: PersonSearchData): Promise<boolean> {
    return await connection.transaction(async (t) => {
      const deletedCount = await PersonModel.destroy({
        where: data,
        transaction: t,
      });
      return deletedCount > 0;
    });
  }

  /**
   * Actualiza un persona existente en la base de datos.
   * @param id ID de la persona a actualizar.
   * @param data datos a actualizar.
   * @returns promise con un booleano que indica si la actualización fue exitosa.
   */
  public static async update(
    id: number,
    data: Partial<PersonCreationAttributes>
  ): Promise<PersonAttributes | null> {
    return await connection.transaction(async (t) => {
      const [updatedCount] = await PersonModel.update(data, {
        where: { id },
        transaction: t,
      });
      if (updatedCount === 0) {
        return null;
      }
      const updatedPerson = await PersonModel.findByPk(id, { transaction: t });
      return updatedPerson ? updatedPerson.get({ plain: true }) : null;
    });
  }
}
