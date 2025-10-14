import { PersonRepository } from '../repositories/person.repository';
import { PersonAttributes, PersonCreationAttributes } from '../models/person.model';

// Tipos auxiliares
export type CreatePersonData = PersonCreationAttributes;
export type UpdatePersonData = Partial<PersonAttributes>;

/**
 * Función genérica para manejar errores en el servicio.
 */
const handleServiceError = (error: unknown, defaultMessage: string): Error => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`Error en el servicio: ${errorMessage}`);
    return new Error(`${defaultMessage}: ${errorMessage}`);
};

/**
 * Servicio de Personas, maneja la lógica de negocio y validaciones.
 */
export class PersonService {

    /**
     * Obtiene todas las personas.
     */
    public static async getAll(): Promise<PersonAttributes[]> {
        try {
            return await PersonRepository.getAll();
        } catch (error) {
            throw handleServiceError(error, 'Error al obtener todas las personas');
        }
    }

    /**
     * Obtiene una persona por ID o DNI.
     */
    public static async getOneByIdentifier(identifier: { id?: number; dni?: string }): Promise<PersonAttributes | null> {
        if (!identifier.id && !identifier.dni) {
            throw new Error('Debe proporcionar un ID o DNI para buscar la persona.');
        }
        try {
            return await PersonRepository.getOneByIdentifier(identifier);
        } catch (error) {
            throw handleServiceError(error, 'Error al buscar la persona');
        }
    }

    /**
     * Crea una nueva persona, con validaciones de datos de entrada.
     */
    public static async create(data: CreatePersonData): Promise<PersonAttributes> {
        // Validaciones de negocio
        if (!data.first_name || !data.last_name || !data.dni) {
            throw new Error('Faltan datos obligatorios: "first_name", "last_name" y "dni" son requeridos.');
        }

        try {
            // Verificar si el DNI ya existe
            const existingPerson = await PersonRepository.getOneByIdentifier({ dni: data.dni });
            if (existingPerson) {
                throw new Error('Ya existe una persona con el DNI proporcionado.');
            }

            return await PersonRepository.create(data);
        } catch (error) {
            throw handleServiceError(error, 'Error al crear la persona');
        }
    }

    /**
     * Actualiza una persona por ID o DNI.
     */
    public static async update(identifier: { id?: number; dni?: string }, data: UpdatePersonData): Promise<PersonAttributes | null> {
        // Validaciones de negocio
        if (!identifier.id && !identifier.dni) {
            throw new Error('Debe proporcionar un ID o DNI para actualizar la persona.');
        }
        if (Object.keys(data).length === 0) {
            throw new Error('Se requiere al menos un campo para actualizar.');
        }
        
        try {
            // Verificación si se cambia el DNI para evitar duplicados
            if (data.dni) {
                const existingPerson = await PersonRepository.getOneByIdentifier({ dni: data.dni });
                if (existingPerson && existingPerson.id !== identifier.id) {
                    throw new Error('Ya existe una persona con el DNI proporcionado.');
                }
            }

            return await PersonRepository.update(identifier, data);
        } catch (error) {
            throw handleServiceError(error, 'Error al actualizar la persona');
        }
    }
    
    /**
     * Elimina una persona (soft delete) por ID o DNI.
     */
    public static async delete(identifier: { id?: number; dni?: string }): Promise<boolean> {
        if (!identifier.id && !identifier.dni) {
            throw new Error('Debe proporcionar un ID o DNI para eliminar la persona.');
        }
        
        try {
            return await PersonRepository.delete(identifier);
        } catch (error) {
            throw handleServiceError(error, 'Error al eliminar la persona');
        }
    }
}