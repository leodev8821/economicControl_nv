import type { PersonCreationDTO } from "@economic-control/shared";

export interface Person extends PersonCreationDTO {
  id: number;
  name: string;
  dni: string;
}

export type PersonAttributes = Person;
