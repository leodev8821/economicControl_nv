import type { OutcomeCreationRequest } from "@economic-control/shared";
import type { Week } from "./week.type";
import type { Cash } from "./cash.type";

export {
  OUTCOME_CATEGORIES as OUTCOME_CATEGORY,
  type OutcomeCategories as OutcomeCategory,
} from "@economic-control/shared";

export interface Outcome extends OutcomeCreationRequest {
  id: number; // Agregamos el ID que viene de la BD
  Cash: Cash; // Relación anidada (ORM)
  Week: Week; // Relación anidada (ORM)
}

export type OutcomeAttributes = Outcome;

export type BulkOutcomeResponse = Outcome[];

export type BulkOutcomeCreatePayload = OutcomeCreationRequest[];
