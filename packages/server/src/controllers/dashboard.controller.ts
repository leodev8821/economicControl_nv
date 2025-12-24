import { Request, Response } from "express";
import ControllerErrorHandler from "../utils/ControllerErrorHandler.ts";
import { IncomeActions } from "../models/income.model.ts";
import { OutcomeActions } from "../models/outcome.model.ts";
import { CashActions } from "../models/cash.model.ts";

export const dashboardController = {
  getBalance: async (_req: Request, res: Response) => {
    try {
      // 1. Obtener todas las entidades necesarias
      const cashes = await CashActions.getAll();
      const allIncomes = await IncomeActions.getAll();
      const allOutcomes = await OutcomeActions.getAll();

      if (!cashes || cashes.length === 0) {
        return res.status(200).json({
          ok: true,
          message:
            cashes.length === 0
              ? "No hay cajas registradas para calcular balances."
              : "Cajas obtenidas correctamente.",
          data: cashes, // ← array vacío si no hay registros
        });
      }

      // 2. Procesar el balance por cada caja
      const data = cashes.map((cash) => {
        // A. Filtrar movimientos que pertenecen a esta caja específica
        const cashIncomes = allIncomes.filter((i) => i.cash_id === cash.id);
        const cashOutcomes = allOutcomes.filter((o) => o.cash_id === cash.id);

        // B. Calcular Totales y Desglose de Ingresos (Por Source)
        const incomeBreakdown: Record<string, number> = {};

        const totalIncome = cashIncomes.reduce((sum, income) => {
          const amount = parseFloat(String(income.amount));
          const source = income.source; // Ej: 'Diezmo', 'Ofrenda'

          // Acumular por source
          incomeBreakdown[source] = (incomeBreakdown[source] || 0) + amount;

          return sum + amount;
        }, 0);

        // C. Calcular Totales y Desglose de Egresos (Por Category)
        const outcomeBreakdown: Record<string, number> = {};

        const totalOutcome = cashOutcomes.reduce((sum, outcome) => {
          const amount = parseFloat(String(outcome.amount));
          const category = outcome.category; // Ej: 'Fijos', 'Variables'

          // Acumular por category
          outcomeBreakdown[category] =
            (outcomeBreakdown[category] || 0) + amount;

          return sum + amount;
        }, 0);

        // E. Estructurar respuesta para esta caja
        return {
          cash_id: cash.id,
          cash_name: cash.name,
          cash_actual_amount: parseFloat(String(cash.actual_amount)), // Saldo real en BD
          totals: {
            income: totalIncome,
            outcome: totalOutcome,
          },
          breakdown: {
            incomes_by_source: incomeBreakdown,
            outcomes_by_category: outcomeBreakdown,
          },
        };
      });

      return res.status(200).json({
        ok: true,
        message: "Balance por cajas calculado correctamente.",
        data: data,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al calcular el balance."
      );
    }
  },
};
