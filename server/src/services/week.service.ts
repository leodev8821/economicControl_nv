import { WeekRepository } from '../repositories/week.repository';
import { WeekAttributes, WeekCreationAttributes } from '../models/week.model';
import { IncomeService } from './income.service';
import { OutcomeService } from './outcome.service';
import { addWeeks, startOfWeek, addDays, getISOWeek, getWeek } from 'date-fns';

/**
 * Función genérica para manejar errores en el servicio.
 */
const handleServiceError = (error: unknown, defaultMessage: string): Error => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`Error en el servicio: ${errorMessage}`);
    return new Error(`${defaultMessage}: ${errorMessage}`);
};

/**
 * Servicio de Semanas, maneja la lógica de negocio y validaciones.
 */
export class WeekService {

    /**
     * Genera y guarda todas las semanas de un año.
     */
    public static async generateWeeksForYear(year: number): Promise<WeekAttributes[]> {
        if (typeof year !== 'number' || year < 1970 || year > 2100) {
            throw new Error('Año inválido. Debe ser un número entre 1970 y 2100.');
        }

        try {
            let currentMonday = startOfWeek(new Date(`${year}-01-01`), { weekStartsOn: 1 });
            if (currentMonday.getFullYear() < year) {
                currentMonday = addWeeks(currentMonday, 1);
            }
            const lastDay = new Date(`${year}-12-31`);
            const weeksToCreate: WeekCreationAttributes[] = [];

            while (currentMonday <= lastDay) {
                const currentSunday = addDays(currentMonday, 6);
                weeksToCreate.push({
                    week_start: currentMonday.toISOString().slice(0, 10),
                    week_end: currentSunday.toISOString().slice(0, 10),
                });
                currentMonday = addWeeks(currentMonday, 1);
            }
            
            return await WeekRepository.bulkCreate(weeksToCreate);
        } catch (error) {
            throw handleServiceError(error, `Error al generar las semanas para el año ${year}`);
        }
    }

    /**
     * Obtiene todas las semanas.
     */
    public static async getAll(): Promise<WeekAttributes[]> {
        try {
            return await WeekRepository.getAll();
        } catch (error) {
            throw handleServiceError(error, 'Error al obtener todas las semanas');
        }
    }

    /**
     * Obtiene las semanas de un año específico.
     */
    public static async getByYear(year: number): Promise<WeekAttributes[]> {
        if (typeof year !== 'number' || year < 1970 || year > 2100) {
            throw new Error('Año inválido. Debe ser un número entre 1970 y 2100.');
        }
        try {
            const weeks = await WeekRepository.getByYear(year);
            if (!weeks || weeks.length === 0) {
                throw new Error(`No se encontraron semanas para el año ${year}.`);
            }
            return weeks;
        } catch (error) {
            throw handleServiceError(error, `Error al obtener las semanas del año ${year}`);
        }
    }

    /**
     * Obtiene los ingresos y gastos de una semana.
     */
    public static async getWeekFinancialData(weekId: number) {
        if (typeof weekId !== 'number' || weekId <= 0) {
            throw new Error('ID de semana inválido.');
        }

        try {
            // Llama a las nuevas funciones del servicio
            const incomes = await IncomeService.getIncomesByWeek(weekId);
            const outcomes = await OutcomeService.getOutcomesByWeek(weekId);
            
            return { incomes, outcomes };
        } catch (error) {
            // El error handleServiceError ya manejará los errores de IncomeService/OutcomeService
            throw handleServiceError(error, `Error al obtener los datos financieros de la semana con ID ${weekId}`);
        }
    }
}