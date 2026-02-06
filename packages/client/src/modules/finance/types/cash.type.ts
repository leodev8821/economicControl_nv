import type { CashCreationRequest } from "@economic-control/shared";

export interface Cash extends CashCreationRequest {
  id: number;
}

export type CashAttributes = Cash;
