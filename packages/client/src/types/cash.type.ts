import type { CashCreationRequest } from "@economic-control/shared";

export interface Cash extends CashCreationRequest {
  id: number;
}

export type CashAttributes = Cash;

/*export interface CashAttributes {
  id: number;
  name: string;
  actual_amount: number;
  pettyCash_limit: number | null;
}

export type Cash = CashAttributes;*/
