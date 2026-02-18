/** Tipos para los atributos del modelo */
export interface BalanceBreakdown {
  incomes_by_source: Record<string, number>;
  outcomes_by_category: Record<string, number>;
}

export interface BalanceTotals {
  income: number;
  outcome: number;
  net: number;
}

// Definimos una interfaz para los filtros que acepta el hook
export interface BalanceFilters {
  week_id?: number;
  start_date?: string;
  end_date?: string;
}

/**
 * Estructura principal del balance por caja
 */
export interface CashBalance {
  cash_id: number;
  cash_name: string;
  cash_actual_amount: number; // Saldo actual guardado en la tabla 'cashes'
  calculated_balance: number; // Saldo matemático histórico (total_ingresos - total_egresos)
  drift: number; // Añadido: Diferencia entre el saldo real y el calculado (auditoría)
  totals: BalanceTotals;
  breakdown: BalanceBreakdown;
}
