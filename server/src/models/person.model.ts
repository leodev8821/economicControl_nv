import { DataTypes, Op, Model as SequelizeModel, Optional } from "sequelize";
import { getSequelizeConfig } from "../config/mysql";

const connection = getSequelizeConfig();

/** Tipos del modelo */
export interface PersonAttributes {
  id: number;
  first_name: string;
  last_name: string;
  dni: string;
  isVisible: boolean;
}

/** Campos opcionales al crear (id autoincremental) */
export interface PersonCreationAttributes
  extends Optional<PersonAttributes, "id" | "isVisible"> {}

/** Clase tipada de Sequelize */
class PersonModel extends SequelizeModel<PersonAttributes, PersonCreationAttributes> implements PersonAttributes {
  public id!: number;
  public first_name!: string;
  public last_name!: string;
  public dni!: string;
  public isVisible!: boolean;
}

/** Inicialización del modelo */
(PersonModel as unknown as typeof SequelizeModel).init(
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
    isVisible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize: connection,
    tableName: "persons",
    timestamps: false,
  }
);

// Extender el tipo de instancia del modelo
interface IPersonModel extends PersonModel {
    get: (options: { plain: true }) => PersonAttributes;
}

// Tipos para las funciones
type CreatePersonData = PersonCreationAttributes;
type UpdatePersonData = Partial<PersonAttributes>;

export const Person = PersonModel as unknown as typeof PersonModel & {
    new (): IPersonModel;
    findOne: (options: any) => Promise<IPersonModel | null>;
    findAll: (options: any) => Promise<IPersonModel[]>;
    create: (data: CreatePersonData) => Promise<IPersonModel>;
    update: (data: UpdatePersonData, options: any) => Promise<[number]>;
    destroy: (options: any) => Promise<number>;
};

/**
 * Crea una nueva persona si no existe por los campos únicos (dni).
 * @param data PersonCreationAttributes
 * @returns Promise<PersonAttributes | null>
 */
export async function createNewPerson(
  data: PersonCreationAttributes
): Promise<PersonAttributes | null> {
  try {
    const uniqueFields = ["dni"];
    const person = await Person.findOne({
      where: {
        [Op.or]: uniqueFields.map((field) => ({ [field]: (data as any)[field] })),
      },
    });
    if (person) {
      return null;
    }
    const newPerson = await Person.create(data);
    return newPerson.get({ plain: true }) as PersonAttributes;
  } catch (error: any) {
    console.error("Error al crear Persona:", error.message);
    throw new Error(`Error al crear Persona: ${error.message}`);
  }
}

/**
 * Obtiene todas las personas.
 * @returns Promise<PersonAttributes[]>
 */
export async function getAllPersons(): Promise<PersonAttributes[]> {
  try {
    return await Person.findAll({ raw: true });
  } catch (error: any) {
    console.error("Error al consultar la base de datos: ", error.message);
    throw new Error(`Error al consultar la base de datos: ${error.message}`);
  }
}

/**
 * Obtiene una persona por ID o DNI.
 * @param data string|number
 * @returns Promise<PersonAttributes | null>
 */
export async function getOnePerson(
  data: string | number
): Promise<PersonAttributes | null> {
  try {
    const fields = ["id", "dni"];
    const searchValue = typeof data === "string" ? data.trim() : data;
    const person = await Person.findOne({
      where: {
        [Op.or]: fields.map((field) => ({ [field]: searchValue })),
      },
      raw: true,
    });
    if (!person) return null;
    return person as PersonAttributes;
  } catch (error: any) {
    console.error(
      `Error al buscar persona con Id o DNI "${data}":`,
      error.message
    );
    throw new Error(
      `Error al buscar persona con Id o DNI "${data}": ${error.message}`
    );
  }
}

/**
 * Actualiza una persona buscando por los campos indicados en `searchFields`.
 * Ejemplo: updateOnePerson(['id','dni'], { id: 1, first_name: 'X' })
 *
 * @param searchFields string[] - campos con los que buscar (p.ej. ['id','dni'])
 * @param newData Partial<PersonAttributes> - nuevos datos (debe incluir el/los campo(s) a buscar)
 * @returns Promise<PersonAttributes | null>
 */
export async function updateOnePerson(
  searchFields: string[],
  newData: Partial<PersonAttributes>
): Promise<PersonAttributes | null> {
  try {
    // filtrar solo los campos que tengan valor en newData
    const whereClauses = searchFields
      .map((field) => {
        const val = (newData as any)[field];
        return typeof val !== "undefined" ? { [field]: val } : null;
      })
      .filter(Boolean) as any[];

    if (whereClauses.length === 0) {
      // nada con lo que buscar
      return null;
    }

    const person = await Person.findOne({
      where: { [Op.or]: whereClauses },
      raw: true,
    });

    if (!person) return null;

    await Person.update(newData, { where: { [Op.or]: whereClauses } });

    // devolver combinación de datos antiguos + nuevos como en tu JS original
    return { ...(person as PersonAttributes), ...(newData as object) } as PersonAttributes;
  } catch (error: any) {
    console.error("Error al actualizar persona:", error.message);
    throw new Error(`Error al actualizar persona: ${error.message}`);
  }
}

/**
 * Elimina (soft delete si existe isVisible) una persona.
 *
 * Acepta:
 *  - un identificador simple (string|number) que buscará en id y dni
 *  - o un objeto con campos y valores { id?: number, dni?: string }
 *
 * @param identifier string|number|Partial<Pick<PersonAttributes,'id'|'dni'>>
 * @returns Promise<Person | null> - instancia Sequelize si se realizó la operación
 */
export async function deletePerson(
  identifier:
    | string
    | number
    | Partial<Pick<PersonAttributes, "id" | "dni">>
): Promise<PersonModel | null> {
  try {
    let personInstance: PersonModel | null = null;

    if (typeof identifier === "string" || typeof identifier === "number") {
      const searchValue = typeof identifier === "string" ? identifier.trim() : identifier;
      personInstance = await Person.findOne({
        where: {
          [Op.or]: [
            { id: typeof searchValue === "number" ? searchValue : undefined },
            { dni: typeof searchValue === "string" ? searchValue : undefined },
          ].filter(Boolean),
        },
        raw: false,
      }) as PersonModel | null;
    } else {
      // objeto con campos { id?, dni? }
      const clauses = Object.entries(identifier)
        .map(([k, v]) => ({ [k]: v }));
      if (clauses.length === 0) return null;
      personInstance = await Person.findOne({
        where: { [Op.or]: clauses },
        raw: false,
      }) as PersonModel | null;
    }

    if (!personInstance) return null;

    // soft delete si existe isVisible
    if ("isVisible" in personInstance) {
      // @ts-ignore - isVisible es parte del tipo, pero la instancia a veces puede no propagarlo bien
      personInstance.isVisible = false;
      await personInstance.save();
    } else {
      await personInstance.destroy(); // hard delete
    }

    return personInstance;
  } catch (error: any) {
    console.error(`Error al eliminar la persona ${JSON.stringify(identifier)}`, error.message);
    throw new Error(`Error al eliminar la Persona: ${error.message}`);
  }
}
