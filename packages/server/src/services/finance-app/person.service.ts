import { PersonCreationDTO, PersonUpdateDTO } from "@economic-control/shared";
import { PersonModel, PersonAttributes, PersonSearchData } from "@models/finance-app/person.model.js";
import { getSequelizeConfig } from "@config/sequelize.config.js";
import { Transaction } from "sequelize";

const connection = getSequelizeConfig();

/**
 * Crea una nueva persona en la base de datos.
 * @param dto datos de la persona a crear.
 * @returns promise con el objeto PersonAttributes creado.
 */
async function create(
    dto: PersonCreationDTO
): Promise<PersonAttributes> {
    return connection.transaction(async (t) => {
        const newPerson = await PersonModel.create(dto, { transaction: t });

        if (!newPerson) {
            throw new Error("Error al crear la persona");
        }

        return newPerson.get({ plain: true });
    });
}

/**
 * Obtiene todas las personas de la base de datos.
 * @returns promise con un array de objetos PersonAttributes.
 */
async function getAll(): Promise<PersonAttributes[]> {
    const persons = await PersonModel.findAll();

    if (!persons || persons.length === 0) {
        throw new Error("No se encontraron personas");
    }

    return persons.map((person) => person.get({ plain: true }));
}

/**
 * Obtiene una persona que cumpla con los criterios de búsqueda proporcionados.
 * @param filters criterios de búsqueda.
 * @param t (Opcional) Objeto de transacción de Sequelize.
 * @returns promise con un objeto PersonAttributes.
 */
async function getOne(
    filters: PersonSearchData, 
    t?: Transaction
): Promise<PersonAttributes> {
    const person = await PersonModel.findOne({ 
        where: { ...filters },
        transaction: t 
    });

    if (!person) {
        throw new Error("No se encontró la persona");
    }

    return person.get({ plain: true }) as PersonAttributes;
}

/**
 * Actualiza una persona existente en la base de datos, con soporte para transacciones.
 * @param id ID de la persona a actualizar.
 * @param dto datos a actualizar.
 * @param t (Opcional) Objeto de transacción de Sequelize.
 * @returns promise con el objeto PersonAttributes actualizado.
 */
async function update(
    id: number,
    dto: PersonUpdateDTO,
    t?: Transaction
): Promise<PersonAttributes> {
    const transaction = t ?? null;

    const [updatedCount] = await PersonModel.update(dto, {
        where: { id },
        transaction: transaction,
    });

    if (updatedCount === 0) {
        throw new Error("Persona no encontrada");
    }

    const updatedPerson = await PersonModel.findByPk(id, { 
        transaction: transaction 
    });

    if (!updatedPerson) {
        throw new Error("Error al actualizar la persona");
    }

    return updatedPerson.get({ plain: true });
}

/**
 * Elimina una persona de la base de datos por su ID.
 * @param id ID de la persona a eliminar.
 * @returns promise con un booleano que indica si la eliminación fue exitosa.
 */
async function remove(id: number): Promise<boolean> {
    const deleted = await PersonModel.destroy({ 
        where: { id } 
    });

    if (!deleted) {
        throw new Error("Persona no encontrada");
    }

    return deleted > 0;
}

export const personService = {
    create,
    getAll,
    getOne,
    update,
    remove
};