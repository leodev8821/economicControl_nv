import type { CashDenominationCreationDTO } from "@economic-control/shared";

export interface CashDenomination extends CashDenominationCreationDTO {
  id: number;
}

export type CashDenominationAttributes = CashDenomination;
