import type { PersonCreationRequest } from "@economic-control/shared";

export interface Person extends PersonCreationRequest {
  id: number;
}

export type PersonAttributes = Person;

/*export interface PersonAttributes {
  id: number;
  first_name: string;
  last_name: string;
  dni: string;
  isVisible: boolean;
}

export type Person = PersonAttributes;*/
