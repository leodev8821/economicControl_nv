import type { Week } from './week';
import type { Cash } from './cash';

/** Tipos para los atributos del modelo */
export const OUTCOME_CATEGORY = ['Fijos', 'Variables', 'Otro'] as const;
export type OutcomeCategory = typeof OUTCOME_CATEGORY[number];

export interface OutcomeAttributes {
  id: number;
  cash_id: number;
  week_id: number;
  date: string;
  amount: number;
  description: string;
  category: OutcomeCategory;
}

/**
 * El tipo final que usaremos en el frontend.
 * Incluye la información de la caja y la semana.
 */
export interface Outcome extends OutcomeAttributes {
  Cash: Cash; // Cada egreso debe tener una caja asociada
  Week: Week; // Cada egreso debe tener una semana asociada
}