import { ReportRepository } from '../repositories/report.repository';
import { ReportAttributes, ReportCreationAttributes } from '../models/report.model';
// Opcionalmente, importar el WeekService si la lógica es compleja
// import { WeekService } from '../services/week.service';

// Tipos auxiliares
export type CreateReportData = ReportCreationAttributes;
export type UpdateReportData = Partial<ReportCreationAttributes>;

/**
 * Función genérica para manejar errores en el servicio.
 */
const handleServiceError = (error: unknown, defaultMessage: string): Error => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`Error en el servicio: ${errorMessage}`);
    return new Error(`${defaultMessage}: ${errorMessage}`);
};

/**
 * Servicio de Informes, maneja la lógica de negocio y validaciones.
 */
export class ReportService {

    /**
     * Obtiene todos los informes.
     */
    public static async getAll(): Promise<ReportAttributes[]> {
        try {
            return await ReportRepository.getAll();
        } catch (error) {
            throw handleServiceError(error, 'Error al obtener todos los informes');
        }
    }

    /**
     * Obtiene un informe por ID.
     */
    public static async getOneById(id: number): Promise<ReportAttributes | null> {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('ID de informe inválido. Debe ser un número positivo.');
        }
        try {
            return await ReportRepository.getOneById(id);
        } catch (error) {
            throw handleServiceError(error, `Error al buscar informe con ID ${id}`);
        }
    }

    /**
     * Obtiene un informe por el ID de la semana.
     */
    public static async getOneByWeekId(weekId: number): Promise<ReportAttributes | null> {
        if (typeof weekId !== 'number' || weekId <= 0) {
            throw new Error('ID de semana inválido. Debe ser un número positivo.');
        }
        try {
            return await ReportRepository.getOneByWeekId(weekId);
        } catch (error) {
            throw handleServiceError(error, `Error al buscar informe para la semana con ID ${weekId}`);
        }
    }

    /**
     * Crea un nuevo informe.
     */
    public static async create(data: CreateReportData): Promise<ReportAttributes> {
        // Validación de datos obligatorios
        if (!data.week_id || data.total_income === undefined || data.total_outcome === undefined || data.net_balance === undefined) {
            throw new Error('Faltan datos obligatorios para crear el informe.');
        }
        
        try {
            // Verificar si ya existe un informe para la semana
            const existingReport = await ReportRepository.getOneByWeekId(data.week_id);
            if (existingReport) {
                throw new Error('Ya existe un informe para esta semana.');
            }

            return await ReportRepository.create(data);
        } catch (error) {
            throw handleServiceError(error, 'Error al crear el informe');
        }
    }

    /**
     * Actualiza un informe por ID.
     */
    public static async update(id: number, data: UpdateReportData): Promise<ReportAttributes | null> {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('ID de informe inválido. Debe ser un número positivo.');
        }
        if (Object.keys(data).length === 0) {
            throw new Error('Se requiere al menos un campo para actualizar.');
        }
        
        try {
            // Lógica para validar que el week_id no sea un duplicado si se está actualizando
            if (data.week_id) {
                const existingReport = await ReportRepository.getOneByWeekId(data.week_id);
                if (existingReport && existingReport.id !== id) {
                    throw new Error('Ya existe un informe para la semana proporcionada.');
                }
            }

            return await ReportRepository.update(id, data);
        } catch (error) {
            throw handleServiceError(error, `Error al actualizar el informe con ID ${id}`);
        }
    }
    
    /**
     * Elimina un informe.
     */
    public static async delete(id: number): Promise<boolean> {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('ID de informe inválido. Debe ser un número positivo.');
        }
        
        try {
            return await ReportRepository.delete(id);
        } catch (error) {
            throw handleServiceError(error, `Error al eliminar el informe con ID ${id}`);
        }
    }
}