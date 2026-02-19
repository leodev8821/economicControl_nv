import { Request, Response } from "express";
import ControllerErrorHandler from "../../utils/ControllerErrorHandler.js";
import { IncomeActions } from "../../models/finance-app/income.model.js";
import { OutcomeActions } from "../../models/finance-app/outcome.model.js";
import { CashActions } from "../../models/finance-app/cash.model.js";
import { DashboardFilter } from "../../shared/dashboard.types.js";

export const dashboardController = {
  getBalance: async (req: Request, res: Response) => {
    try {
      const { week_id, start_date, end_date } = req.query;

      const filters: DashboardFilter = {};
      if (week_id) filters.week_id = parseInt(week_id as string);
      if (start_date && end_date) {
        filters.startDate = new Date(start_date as string);
        filters.endDate = new Date(end_date as string);
      }

      // 1. Obtener cajas
      const [cashes, incomeSummaries, outcomeSummaries] = await Promise.all([
        CashActions.getAll(),
        IncomeActions.getSummaryByCash(filters), // Usando el método optimizado con SUM/GROUP BY
        OutcomeActions.getSummaryByCash(filters), // Usando el método optimizado con SUM/GROUP BY
      ]);

      if (!cashes || cashes.length === 0) {
        return res.status(200).json({
          ok: true,
          message: "No hay cajas registradas para calcular balances.",
          data: [],
        });
      }

      // 2. Procesar el balance por cada caja combinando los resúmenes
      const data = cashes.map((cash) => {
        // Filtrar resúmenes de esta caja
        const cashIncomes = incomeSummaries.filter(
          (s: any) => s.cash_id === cash.id,
        );
        const cashOutcomes = outcomeSummaries.filter(
          (s: any) => s.cash_id === cash.id,
        );

        const incomeBreakdown: Record<string, number> = {};
        let totalIncome = 0;
        cashIncomes.forEach((s: any) => {
          const amt = parseFloat(String(s.total_amount));
          incomeBreakdown[s.source] = amt;
          totalIncome += amt;
        });

        const outcomeBreakdown: Record<string, number> = {};
        let totalOutcome = 0;
        cashOutcomes.forEach((s: any) => {
          const amt = parseFloat(String(s.total_amount));
          outcomeBreakdown[s.category] = amt;
          totalOutcome += amt;
        });

        const dbActualAmount = parseFloat(String(cash.actual_amount));
        const calculatedBalance = totalIncome - totalOutcome;

        return {
          cash_id: cash.id,
          cash_name: cash.name,
          cash_actual_amount: dbActualAmount,
          calculated_balance: calculatedBalance,
          drift: dbActualAmount - calculatedBalance, // Diferencia entre saldo real e histórico
          totals: {
            income: totalIncome,
            outcome: totalOutcome,
            net: calculatedBalance,
          },
          breakdown: {
            incomes_by_source: incomeBreakdown,
            outcomes_by_category: outcomeBreakdown,
          },
        };
      });

      return res.status(200).json({
        ok: true,
        message: "Balance optimizado calculado correctamente.",
        data: data,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al calcular el balance.",
      );
    }
  },
};
