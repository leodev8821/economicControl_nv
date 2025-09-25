import { OutcomeRepository } from '../repositories/outcome.repository';
import { OutcomeAttributes, OutcomeCreationAttributes, OutcomeCategory } from '../models/outcome.model';

// Tipos auxiliares
export type CreateOutcomeData = OutcomeCreationAttributes;
export type UpdateOutcomeData = Partial<OutcomeCreationAttributes>;

/**
 * Función genérica para manejar errores en el servicio.
 */
const handleServiceError = (error: unknown, defaultMessage: string): Error => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`Error en el servicio: ${errorMessage}`);
    return new Error(`${defaultMessage}: ${errorMessage}`);
};

/**
 * Servicio de Egresos, maneja la lógica de negocio y validaciones.
 */
export class OutcomeService {

    /**
     * Obtiene todos los egresos.
     */
    public static async getAll(): Promise<OutcomeAttributes[]> {
        try {
            return await OutcomeRepository.getAllOutcomes();
        } catch (error) {
            throw handleServiceError(error, 'Error al obtener todos los egresos');
        }
    }

    /**
     * Obtiene un egreso por ID, con validación de ID.
     */
    public static async getOneById(id: number): Promise<OutcomeAttributes | null> {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('ID de egreso inválido. Debe ser un número positivo.');
        }
        try {
            return await OutcomeRepository.getOneOutcome(id);
        } catch (error) {
            throw handleServiceError(error, `Error al buscar egreso con ID ${id}`);
        }
    }

    /**
     * Obtiene todos los egresos para una caja (cashId).
     */
    public static async getByCashId(cashId: number): Promise<OutcomeAttributes[]> {
        if (typeof cashId !== 'number' || cashId <= 0) {
            throw new Error('ID de caja inválido. Debe ser un número positivo.');
        }
        try {
            return await OutcomeRepository.getOutcomesByCashId(cashId);
        } catch (error) {
            throw handleServiceError(error, `Error al obtener egresos para la caja con ID ${cashId}`);
        }
    }

    /**
     * Crea un nuevo egreso, con validaciones de datos de entrada.
     */
    public static async create(data: CreateOutcomeData): Promise<OutcomeAttributes> {
        // Validación de datos obligatorios
        if (!data.cash_id || !data.week_id || !data.date || !data.amount || !data.description || !data.category) {
            throw new Error('Faltan datos obligatorios para crear el egreso.');
        }

        // Validación de categoría
        if (!Object.values(OutcomeCategory).includes(data.category)) {
            throw new Error(`Categoría inválida. Valores permitidos: ${Object.values(OutcomeCategory).join(', ')}`);
        }
        
        try {
            return await OutcomeRepository.createNewOutcome(data);
        } catch (error) {
            throw handleServiceError(error, 'Error al crear el egreso');
        }
    }

    /**
     * Actualiza un egreso, con validaciones de datos de entrada.
     */
    public static async update(id: number, data: UpdateOutcomeData): Promise<OutcomeAttributes | null> {
        // Validaciones de negocio
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('ID de egreso inválido. Debe ser un número positivo.');
        }
        if (Object.keys(data).length === 0) {
            throw new Error('Se requiere al menos un campo para actualizar.');
        }

        // Validación de categoría si se proporciona
        if (data.category && !Object.values(OutcomeCategory).includes(data.category)) {
            throw new Error(`Categoría inválida. Valores permitidos: ${Object.values(OutcomeCategory).join(', ')}`);
        }
        
        try {
            return await OutcomeRepository.updateOneOutcome(id, data);
        } catch (error) {
            throw handleServiceError(error, `Error al actualizar el egreso con ID ${id}`);
        }
    }
    
    /**
     * Elimina un egreso, validando el ID.
     */
    public static async delete(id: number): Promise<boolean> {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('ID de egreso inválido. Debe ser un número positivo.');
        }
        
        try {
            return await OutcomeRepository.deleteOutcome(id);
        } catch (error) {
            throw handleServiceError(error, `Error al eliminar el egreso con ID ${id}`);
        }
    }

    /**
     * Obtiene los ingresos para una fecha específica.
     */
    public static async getOutcomesByDate(date: string): Promise<OutcomeAttributes[]> {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            throw new Error('Formato de fecha inválido. Debe ser YYYY-MM-DD.');
        }
        try {
            return await OutcomeRepository.getOutcomesByDate(date);
        } catch (error) {
            throw handleServiceError(error, `Error al obtener egresos para la fecha ${date}`);
        }
    }

    /**
     * Obtiene los egresos para un ID de semana específico. ⬅️ NUEVA FUNCIÓN
     */
    public static async getOutcomesByWeek(weekId: number): Promise<OutcomeAttributes[]> {
        if (typeof weekId !== 'number' || weekId <= 0) {
            throw new Error('ID de semana inválido. Debe ser un número positivo.');
        }
        try {
            return await OutcomeRepository.getOutcomesByWeekId(weekId);
        } catch (error) {
            throw handleServiceError(error, `Error al obtener egresos para la semana con ID ${weekId}`);
        }
    }
}