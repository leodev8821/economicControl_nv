/** Tipos para los atributos del modelo */
export interface CashAttributes {
    id: number;
    name: string;
    actual_amount: number;
    pettyCash_limit: number | null;
}

export type Cash = CashAttributes;