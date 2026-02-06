import type { WeekCreationRequest } from "@economic-control/shared";

export interface Week extends WeekCreationRequest {
  id: number;
}

export type WeekAttributes = Week;

/*export interface WeekAttributes {
  id: number;
  week_start: string;
  week_end: string;
}

export type Week = WeekAttributes;*/
