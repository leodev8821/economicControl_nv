import type { CashCreationDTO } from "@economic-control/shared";

export interface Cash extends CashCreationDTO {
  id: number;
  name: string;
  actual_amount: number;
}

export type CashAttributes = Cash;
