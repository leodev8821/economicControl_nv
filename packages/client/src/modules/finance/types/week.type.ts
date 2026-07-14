import type { WeekCreationDTO } from "@economic-control/shared";

export interface Week extends WeekCreationDTO {
  id: number;
}

export type WeekAttributes = Week;

export interface Week {
  id: number;
  week_start: string;
  week_end: string;
  is_closed: boolean;
}
