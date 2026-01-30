import type { PersonCreationRequest } from "@economic-control/shared";

export interface Person extends PersonCreationRequest {
  id: number;
}

export type PersonAttributes = Person;
