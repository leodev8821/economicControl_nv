import type { CashDenominationCreationRequest } from "@economic-control/shared";

export interface CashDenomination extends CashDenominationCreationRequest {
  id: number;
}

export type CashDenominationAttributes = CashDenomination;
