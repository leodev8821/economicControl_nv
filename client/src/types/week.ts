/** Tipos para los atributos del modelo */
export interface WeekAttributes {
  id: number;
  week_start: string; // DATEONLY -> string (YYYY-MM-DD)
  week_end: string;   // DATEONLY -> string (YYYY-MM-DD)
}

export type Week = WeekAttributes;