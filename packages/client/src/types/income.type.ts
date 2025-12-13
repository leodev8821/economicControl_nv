import type { IncomeCreationRequest } from "@economic-control/shared";
import type { Person } from "./person.type";
import type { Week } from "./week.type";

export { INCOME_SOURCES, type IncomeSource } from "@economic-control/shared";

/*export const INCOME_SOURCES = [
  "Diezmo",
  "Ofrenda",
  "Primicia",
  "Donación",
  "Evento",
  "Cafetería",
  "Otro",
] as const;
export type IncomeSource = (typeof INCOME_SOURCES)[number];*/

/*export interface IncomeAttributes {
  id: number;
  person_id: number | null;
  cash_id: number;
  week_id: number;
  date: string;
  amount: number;
  source: IncomeSource;
}*/

export interface Income extends IncomeCreationRequest {
  id: number;
  Person: Person | null;
  Week: Week;
}

export type IncomeAttributes = Income;

/*export interface Income extends IncomeAttributes {
  Person: Person | null;
  Week: Week;
}*/
