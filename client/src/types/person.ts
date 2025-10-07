/** Tipos para los atributos del modelo */
export interface PersonAttributes {
  id: number;
  first_name: string;
  last_name: string;
  dni: string;
  isVisible: boolean;
}

export type Person = PersonAttributes;