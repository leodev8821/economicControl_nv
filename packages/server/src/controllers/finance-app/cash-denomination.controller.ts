import { Request, Response } from "express";
import ControllerErrorHandler from "../../utils/ControllerErrorHandler.js";
import type { CashDenominationAttributes } from "../../models/finance-app/cash-denomination.model.js";
import {
  CashDenominationCreationDTO,
  CashDenominationUpdateDTO,
} from "@economic-control/shared";
import { cashDenominationService } from "../../services/finance-app/cash-denomination.service.js";

export const cashDenominationController = {
  // Obtiene todas las monedas
  allCashDenominations: async (_req: Request, res: Response) => {
    try {
      const cashDenominations: CashDenominationAttributes[] =
        await cashDenominationService.getAll();

      return res.status(200).json({
        ok: true,
        message:
          cashDenominations.length === 0
            ? "No hay monedas registradas."
            : "Monedas obtenidas correctamente.",
        data: cashDenominations,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener las monedas.",
      );
    }
  },

  // Obtiene una moneda por ID o nombre
  oneCashDenominationById: async (req: Request, res: Response) => {
    try {
      const denomination_id = parseInt(
        (req.params.denomination_id as string) || "0",
        10,
      );

      if (!denomination_id) {
        return res.status(400).json({
          ok: false,
          message: "ID de moneda inválido",
        });
      }

      const cashDenomination =
        await cashDenominationService.getById(denomination_id);

      if (!cashDenomination) {
        return res.status(404).json({
          message:
            "No se encontró la moneda con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Moneda obtenida correctamente.",
        data: cashDenomination,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener la moneda.");
    }
  },

  /**
   * Obtiene una moneda por ID de caja
   * @param req Request con el ID de la caja en los parámetros
   * @param res Response con la moneda
   * @returns Response con la moneda
   */
  oneCashDenominationByCash: async (req: Request, res: Response) => {
    try {
      const cash_id = parseInt((req.params.cash_id as string) || "0", 10);

      if (!cash_id) {
        return res.status(400).json({
          ok: false,
          message: "ID de caja inválido",
        });
      }

      const cashDenomination = await cashDenominationService.getByCash(cash_id);

      if (!cashDenomination) {
        return res.status(404).json({
          message:
            "No se encontró la moneda con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Moneda obtenida correctamente.",
        data: cashDenomination,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener la moneda.");
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const cash_id = parseInt((req.params.cash_id as string) || "0", 10);

      if (!cash_id) {
        return res.status(400).json({
          ok: false,
          message: "ID de caja inválido",
        });
      }

      const data: CashDenominationCreationDTO = {
        ...req.body,
        cash_id: cash_id,
      };

      const result = await cashDenominationService.create(data);

      return res.status(201).json({
        ok: true,
        message: "Denominación creada correctamente",
        data: result,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al crear la denominación",
      );
    }
  },

  updateCashDenomination: async (req: Request, res: Response) => {
    try {
      const denomination_id = parseInt(
        (req.params.denomination_id as string) || "0",
        10,
      );

      if (!denomination_id) {
        return res.status(400).json({
          ok: false,
          message: "ID de moneda inválido",
        });
      }

      const updateData: CashDenominationUpdateDTO = req.body;

      const updated = await cashDenominationService.update(
        denomination_id,
        updateData,
      );

      if (!updated) {
        return res.status(404).json({
          ok: false,
          message: "No encontrado",
        });
      }

      return res.json({
        ok: true,
        data: updated,
        message: "Denominación actualizada correctamente",
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al actualizar");
    }
  },

  deleteCashDenomination: async (req: Request, res: Response) => {
    try {
      const denomination_id = parseInt(
        (req.params.denomination_id as string) || "0",
        10,
      );

      if (!denomination_id) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de moneda inválido" });
      }

      const deleted = await cashDenominationService.remove(denomination_id);

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          message: "No encontrado",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Moneda eliminada correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al eliminar la moneda.");
    }
  },
};
