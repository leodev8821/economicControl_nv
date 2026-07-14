import type { IncomeCreationDTO, BulkIncomeDTO } from "@economic-control/shared";
import type { Person } from "./person.type";
import type { Week } from "./week.type";
import type { Cash } from "./cash.type";

export { INCOME_SOURCES, type IncomeSource } from "@economic-control/shared";

export interface Income extends IncomeCreationDTO {
  id: number;
  Person: Person | null;
  Week: Week;
  Cash: Cash;
  amount: number;
}

export type IncomeAttributes = Income;

// Este es el tipo que devuelve el backend: Promise<IncomeAttributes[]>
export type BulkIncomeResponse = Income[];

// El Request para el API debe ser el array plano que espera el backend
export type BulkIncomeCreatePayload = BulkIncomeDTO;
