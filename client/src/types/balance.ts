/** Tipos para los atributos del modelo */
export interface BalanceBreakdown {
  incomes_by_source: Record<string, number>;
  outcomes_by_category: Record<string, number>;
}

export interface BalanceTotals {
  income: number;
  outcome: number;
}

export interface CashBalance {
  cash_id: number;
  cash_name: string;
  cash_actual_amount: number;   // Saldo real en la BD
  calculated_balance: number;   // Saldo matemático (ingresos - egresos)
  totals: BalanceTotals;
  breakdown: BalanceBreakdown;
}