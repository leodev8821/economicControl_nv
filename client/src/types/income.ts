import type { Person } from './person';
import type { Week } from './week';

export type IncomeSource = 'Diezmo' | 'Ofrenda' | 'Cafetería' | 'Otro';

export interface IncomeAttributes {
    id: number;
    person_id: number | null; 
    week_id: number;
    date: string; // La fecha vendrá como string (ISO 8601)
    amount: number;
    source: IncomeSource;
}

/**
 * El tipo final que usaremos en el frontend.
 * Ahora incluimos la información de la persona.
 */
export interface Income extends IncomeAttributes {
    // Si la persona existe, la incluimos como un objeto.
    // El backend la envia anidada.
    Person: Person | null; 
    Week: Week; // Cada ingreso debe tener una semana asociada
}