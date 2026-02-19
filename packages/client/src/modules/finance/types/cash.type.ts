import type { CashCreationRequest } from "@economic-control/shared";

export interface Cash extends CashCreationRequest {
  id: number;
  name: string;
}

export type CashAttributes = Cash;
