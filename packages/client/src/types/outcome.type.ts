import type { OutcomeCreationRequest } from "@economic-control/shared";
import type { Week } from "./week.type";
import type { Cash } from "./cash.type";

export {
  OUTCOME_CATEGORY,
  type OutcomeCategory,
} from "@economic-control/shared";

export interface Outcome extends OutcomeCreationRequest {
  id: number; // Agregamos el ID que viene de la BD
  Cash: Cash; // Relación anidada (ORM)
  Week: Week; // Relación anidada (ORM)
}

export type OutcomeAttributes = Outcome;

/*export const OUTCOME_CATEGORY = ["Fijos", "Variables", "Otro"] as const;
export type OutcomeCategory = (typeof OUTCOME_CATEGORY)[number];

export interface OutcomeAttributes {
  id: number;
  cash_id: number;
  week_id: number;
  date: string;
  amount: number;
  description: string;
  category: OutcomeCategory;
}

export interface Outcome extends OutcomeAttributes {
  Cash: Cash;
  Week: Week;
}*/
