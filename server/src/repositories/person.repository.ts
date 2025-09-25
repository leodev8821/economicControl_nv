import { PersonModel, PersonAttributes, PersonCreationAttributes } from '../models/person.model';
import { Op } from "sequelize";

// Tipos auxiliares
type CreatePersonData = PersonCreationAttributes;
type UpdatePersonData = Partial<PersonAttributes>;

/**
 * Repositorio de Personas, maneja las interacciones con la base de datos.
 */
export class PersonRepository {

    /**
     * Obtiene todas las personas.
     */
    public static async getAll(): Promise<PersonAttributes[]> {
        const persons = await PersonModel.findAll();
        return persons.map(person => person.get({ plain: true }));
    }

    /**
     * Obtiene una persona por ID o DNI.
     */
    public static async getOneByIdentifier(identifier: { id?: number; dni?: string }): Promise<PersonAttributes | null> {
        const person = await PersonModel.findOne({ where: identifier });
        return person ? person.get({ plain: true }) : null;
    }

    /**
     * Crea una nueva persona.
     */
    public static async create(data: CreatePersonData): Promise<PersonAttributes> {
        const newPerson = await PersonModel.create(data);
        return newPerson.get({ plain: true });
    }

    /**
     * Actualiza una persona por ID o DNI.
     */
    public static async update(identifier: { id?: number; dni?: string }, data: UpdatePersonData): Promise<PersonAttributes | null> {
        const [affectedRows] = await PersonModel.update(data, { where: identifier });
        if (affectedRows === 0) {
            return null;
        }
        const updatedPerson = await PersonModel.findOne({ where: identifier });
        return updatedPerson ? updatedPerson.get({ plain: true }) : null;
    }

    /**
     * Elimina (soft delete si existe isVisible) una persona por ID o DNI.
     */
    public static async delete(identifier: { id?: number; dni?: string }): Promise<boolean> {
        const person = await PersonModel.findOne({ where: identifier });
        if (!person) {
            return false;
        }
        // Soft delete
        if ('isVisible' in person.get()) {
            person.set('isVisible', false);
            await person.save();
        } else { // Hard delete si no existe el campo
            await person.destroy();
        }
        return true;
    }
}