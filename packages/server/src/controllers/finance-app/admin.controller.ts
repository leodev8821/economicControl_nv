import { syncAllBalances } from "../../utils/fix_cash_amount.js";
import ControllerErrorHandler from "../../utils/ControllerErrorHandler.js";
import { Request, Response } from "express";

export const adminController = {
  syncBalances: async (_req: Request, res: Response) => {
    try {
      await syncAllBalances();
      return res
        .status(200)
        .json({ ok: true, message: "Saldos recalculados correctamente." });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al sincronizar saldos.");
    }
  },
};
