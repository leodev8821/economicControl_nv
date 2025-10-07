/** Tipos para los atributos del modelo */
export type OutcomeCategory = 'Fijos' | 'Variables' | 'Otro';

export interface OutcomeAttributes {
  id: number;
  cash_id: number;
  week_id: number;
  date: string;
  amount: number;
  description: string;
  category: OutcomeCategory;
}

export type Outcome = OutcomeAttributes;