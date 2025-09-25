import { IncomeAttributes, IncomeCreationAttributes, IncomeSource } from '../models/income.model';
import { IncomeRepository } from '../repositories/income.repository';

// Tipos para las operaciones
export type CreateIncomeData = IncomeCreationAttributes;
export type UpdateIncomeData = Partial<IncomeCreationAttributes>;

// Función de utilidad para manejar errores de forma consistente
const handleServiceError = (error: unknown, defaultMessage: string): Error => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`Error en el servicio: ${errorMessage}`);
    return new Error(`${defaultMessage}: ${errorMessage}`);
};

/**
 * Servicio de Ingresos, maneja la lógica de negocio y validaciones.
 */
export class IncomeService {

    /**
     * Obtiene todos los ingresos.
     */
    public static async getAll(): Promise<IncomeAttributes[]> {
        try {
            return await IncomeRepository.getAllIncomes();
        } catch (error) {
            throw handleServiceError(error, 'Error al obtener todos los ingresos');
        }
    }

    /**
     * Obtiene un ingreso por ID, validando el ID.
     */
    public static async getOneById(id: number): Promise<IncomeAttributes | null> {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('ID de ingreso inválido. Debe ser un número positivo.');
        }
        try {
            return await IncomeRepository.getOneIncome(id);
        } catch (error) {
            throw handleServiceError(error, `Error al buscar ingreso con ID ${id}`);
        }
    }

    /**
     * Crea un nuevo ingreso, con validaciones de datos de entrada.
     */
    public static async create(data: CreateIncomeData): Promise<IncomeAttributes> {
        
        // 1. Validación de datos obligatorios
        if (!data.week_id || !data.date || !data.amount || !data.source) {
            throw new Error('Faltan datos obligatorios: week_id, date, amount, source.');
        }

        // 2. Saneamiento del campo opcional person_id
        // Aplicamos un Type Guard para permitir la comparación con la cadena vacía ("").
        const isPersonIdEmpty = (
            data.person_id === undefined || 
            data.person_id === null || 
            (typeof data.person_id === 'string' && data.person_id.trim() === "")
        );

        const sanitizedPersonId = isPersonIdEmpty 
            ? null 
            // Si el valor no es vacío, lo mantenemos. Si es una cadena con un número ("123"), Sequelize lo convertirá.
            : data.person_id; 
        
        // 3. VALIDACIÓN DE NEGOCIO: Diezmo requiere un 'person_id'
        if (data.source === IncomeSource.DIEZMO && sanitizedPersonId === null) {
            throw new Error('Un ingreso con fuente "Diezmo" requiere obligatoriamente un identificador de persona (person_id).');
        }

        // 4. Construir objeto de datos saneado para el repositorio
        const sanitizedData: CreateIncomeData = {
            ...data,
            // Si el valor original era un string con el ID, lo convertimos a number aquí.
            // Si el valor original era number, se mantiene. Si es null, se mantiene.
            person_id: (typeof sanitizedPersonId === 'string' && sanitizedPersonId !== null)
                ? parseInt(sanitizedPersonId, 10) // Convertir la cadena a número si es necesario
                : sanitizedPersonId // Si ya es null o number, lo dejamos
        } as CreateIncomeData;
        
        // CORRECCIÓN ADICIONAL: Asegurarse de que el monto es un número
        sanitizedData.amount = Number(sanitizedData.amount);
        
        try {
            return await IncomeRepository.createNewIncome(sanitizedData);
        } catch (error) {
            throw handleServiceError(error, 'Error al crear el ingreso');
        }
    }

    /**
     * Actualiza un ingreso, con validaciones de datos de entrada.
     */
    public static async update(id: number, data: UpdateIncomeData): Promise<IncomeAttributes | null> {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('ID de ingreso inválido.');
        }
        if (Object.keys(data).length === 0) {
            throw new Error('Se requiere al menos un campo para actualizar.');
        }
        
        try {
            return await IncomeRepository.updateOneIncome(id, data);
        } catch (error) {
            throw handleServiceError(error, `Error al actualizar el ingreso con ID ${id}`);
        }
    }
    
    /**
     * Elimina un ingreso, validando el ID.
     */
    public static async delete(id: number): Promise<boolean> {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('ID de ingreso inválido.');
        }
        
        try {
            const wasDeleted = await IncomeRepository.deleteIncome(id);
            if (!wasDeleted) {
                console.warn(`Intento de eliminar ingreso con ID ${id} que no existe.`);
            }
            return wasDeleted;
        } catch (error) {
            throw handleServiceError(error, `Error al eliminar el ingreso con ID ${id}`);
        }
    }

    /**
     * Obtiene los diezmos de una persona por su DNI.
     */
    public static async getTitheIncomesByDni(dni: string): Promise<IncomeAttributes[]> {
        if (!dni || dni.trim() === '') {
            throw new Error('DNI no puede estar vacío.');
        }
        try {
            return await IncomeRepository.getTitheIncomesByDni(dni);
        } catch (error) {
            throw handleServiceError(error, `Error al obtener diezmos para DNI ${dni}`);
        }
    }
    
    /**
     * Obtiene los ingresos para una fecha específica.
     */
    public static async getIncomesByDate(date: string): Promise<IncomeAttributes[]> {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            throw new Error('Formato de fecha inválido. Debe ser YYYY-MM-DD.');
        }
        try {
            return await IncomeRepository.getIncomesByDate(date);
        } catch (error) {
            throw handleServiceError(error, `Error al obtener ingresos para la fecha ${date}`);
        }
    }

    /**
     * Obtiene los ingresos para un ID de semana específico. ⬅️ NUEVA FUNCIÓN
     */
    public static async getIncomesByWeek(weekId: number): Promise<IncomeAttributes[]> {
        if (typeof weekId !== 'number' || weekId <= 0) {
            throw new Error('ID de semana inválido. Debe ser un número positivo.');
        }
        try {
            return await IncomeRepository.getIncomesByWeekId(weekId);
        } catch (error) {
            throw handleServiceError(error, `Error al obtener ingresos para la semana con ID ${weekId}`);
        }
    }
}