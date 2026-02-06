import type { IncomeCreationRequest } from "@economic-control/shared";
import type { Person } from "./person.type";
import type { Week } from "./week.type";

export { INCOME_SOURCES, type IncomeSource } from "@economic-control/shared";

export interface Income extends IncomeCreationRequest {
  id: number;
  Person: Person | null;
  Week: Week;
  amount: number;
}

export type IncomeAttributes = Income;

// Este es el tipo que devuelve tu backend: Promise<IncomeAttributes[]>
export type BulkIncomeResponse = Income[];

// El Request para el API debe ser el array plano que espera el backend
export type BulkIncomeCreatePayload = IncomeCreationRequest[];
