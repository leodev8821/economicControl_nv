export type IncomeSource = 'Diezmo' | 'Ofrenda' | 'Cafetería' | 'Otro';

export interface IncomeAttributes {
    id: number;
    person_id: number | null; 
    week_id: number;
    date: string; // La fecha vendrá como string (ISO 8601)
    amount: number;
    source: IncomeSource;
}

/** * El tipo final que usaremos en el frontend.
 * Nótese que excluimos campos sensibles como 'password' o campos de ORM que no se usan.
 */
export type Income = IncomeAttributes;