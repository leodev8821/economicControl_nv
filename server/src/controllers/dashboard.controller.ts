
import { Request, Response } from 'express';
import ControllerErrorHandler from '../utils/ControllerErrorHandler';
import { IncomeActions } from '../models/income.model';
import { OutcomeActions } from '../models/outcome.model';

export const dashboardController = {
    getBalance: async (_req: Request, res: Response) => {
        try {
            const incomesResult = (await IncomeActions.getAll()).map(i => ({...i, amount: parseFloat(String(i.amount))}));

            const outcomesResult = (await OutcomeActions.getAll()).map(o => ({...o, amount: parseFloat(String(o.amount))}));

            if (incomesResult.length === 0 || outcomesResult.length === 0) {
                return res.status(400).json({ 
                    ok: false, 
                    message: 'No se pueden calcular el balance sin ingresos o gastos registrados.' 
                });
            }

            const incomeTotal: number = incomesResult.reduce((sum, income) => sum + income.amount, 0);
            const outcomeTotal: number = outcomesResult.reduce((sum, outcome) => sum + outcome.amount, 0);
            const balance: number = incomeTotal - outcomeTotal;

            const data = [];
            data.push({ type: 'income', total: incomeTotal });
            data.push({ type: 'outcome', total: outcomeTotal });
            data.push({ type: 'balance', total: balance });

            return res.status(200).json({
                ok: true,
                message: "Balance obtenido correctamente.",
                data: data,
            });

        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al calcular el balance.' );
        }
    },
};