import { CashRepository } from '../repositories/cash.repository';
import { CashAttributes, CashCreationAttributes } from '../models/cash.model';

// Tipos auxiliares
export type CreateCashData = CashCreationAttributes;
export type UpdateCashData = Partial<CashCreationAttributes>;

/**
 * Función genérica para manejar errores en el servicio.
 */
const handleServiceError = (error: unknown, defaultMessage: string): Error => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`Error en el servicio: ${errorMessage}`);
    return new Error(`${defaultMessage}: ${errorMessage}`);
};

/**
 * Servicio de Cajas, maneja la lógica de negocio y validaciones.
 */
export class CashService {

    /**
     * Obtiene todas las cajas.
     */
    public static async getAll(): Promise<CashAttributes[]> {
        try {
            return await CashRepository.getAll();
        } catch (error) {
            throw handleServiceError(error, 'Error al obtener todas las cajas');
        }
    }

    /**
     * Obtiene una caja por ID o nombre.
     */
    public static async getOne(data: { id?: number; name?: string }): Promise<CashAttributes | null> {
        if (!data.id && !data.name) {
            throw new Error('Debe proporcionar un ID o un nombre para buscar la caja.');
        }
        try {
            return await CashRepository.getOne(data);
        } catch (error) {
            throw handleServiceError(error, 'Error al buscar la caja');
        }
    }

    /**
     * Crea una nueva caja.
     */
    public static async create(data: CreateCashData): Promise<CashAttributes> {
        // Validaciones de negocio
        if (!data.name || data.actual_amount === undefined) {
            throw new Error('Faltan datos obligatorios: "name" y "actual_amount" son requeridos.');
        }

        try {
            // Verificar si el nombre de la caja ya existe
            const existingCash = await CashRepository.getOne({ name: data.name });
            if (existingCash) {
                throw new Error('Ya existe una caja con el mismo nombre.');
            }

            return await CashRepository.create(data);
        } catch (error) {
            throw handleServiceError(error, 'Error al crear la caja');
        }
    }

    /**
     * Actualiza una caja por ID.
     */
    public static async update(id: number, data: UpdateCashData): Promise<CashAttributes | null> {
        // Validaciones de negocio
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('ID de caja inválido. Debe ser un número positivo.');
        }
        if (Object.keys(data).length === 0) {
            throw new Error('Se requiere al menos un campo para actualizar.');
        }
        
        try {
            // Verificación adicional si se cambia el nombre para evitar duplicados
            if (data.name) {
                const existingCash = await CashRepository.getOne({ name: data.name });
                if (existingCash && existingCash.id !== id) {
                    throw new Error('Ya existe una caja con el nombre proporcionado.');
                }
            }

            return await CashRepository.update(id, data);
        } catch (error) {
            throw handleServiceError(error, 'Error al actualizar la caja');
        }
    }
    
    /**
     * Elimina una caja por ID o nombre.
     */
    public static async delete(data: { id?: number; name?: string }): Promise<boolean> {
        if (!data.id && !data.name) {
            throw new Error('Debe proporcionar un ID o un nombre para eliminar la caja.');
        }
        try {
            return await CashRepository.delete(data);
        } catch (error) {
            throw handleServiceError(error, 'Error al eliminar la caja');
        }
    }
}