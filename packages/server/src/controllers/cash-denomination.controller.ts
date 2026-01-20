import { Request, Response } from "express";
import ControllerErrorHandler from "../utils/ControllerErrorHandler.js";
import type { CashDenominationSearchData } from "../models/cash-denomination.model.js";
import {
  CashDenominationActions,
  CashDenominationAttributes,
  CashDenominationCreationAttributes,
} from "../models/cash-denomination.model.js";
import {
  CashDenominationCreationSchema,
  CashDenominationCreationRequest,
  CashDenominationUpdateSchema,
  CashDenominationUpdateRequest,
} from "@economic-control/shared";

export const cashDenominationController = {
  // Obtiene todas las monedas
  allCashDenominations: async (_req: Request, res: Response) => {
    try {
      const cashDenominations: CashDenominationAttributes[] =
        await CashDenominationActions.getAll();

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
        "Error al obtener las monedas."
      );
    }
  },

  // Obtiene una moneda por ID o nombre
  oneCashDenomination: async (req: Request, res: Response) => {
    try {
      const { id, value } = req.params;
      const searchCriteria: CashDenominationSearchData = {};

      if (id) {
        searchCriteria.id = parseInt(id, 10);
      }
      if (value) {
        searchCriteria.denomination_value = value;
      }

      const cashDenomination = await CashDenominationActions.getOne(
        searchCriteria
      );

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

  // Crea una nueva moneda
  createCashDenomination: async (req: Request, res: Response) => {
    try {
      const validationResult = CashDenominationCreationSchema.safeParse(
        req.body
      );

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nueva moneda inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const cashDenominationData: CashDenominationCreationRequest =
        validationResult.data;

      const newCashDenomination = await CashDenominationActions.create(
        cashDenominationData as CashDenominationCreationAttributes
      );

      return res.status(201).json({
        ok: true,
        message: "Moneda creada correctamente.",
        data: newCashDenomination,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al crear la moneda.");
    }
  },

  updateCashDenomination: async (req: Request, res: Response) => {
    try {
      const cashDenominationId = parseInt(req.params.id || "0", 10);

      if (!cashDenominationId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de moneda inválido" });
      }

      const validationResult = CashDenominationUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de moneda inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const updateData: CashDenominationUpdateRequest = validationResult.data;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedCashDenomination = await CashDenominationActions.update(
        cashDenominationId,
        updateData as Partial<CashDenominationCreationAttributes>
      );

      if (!updatedCashDenomination) {
        return res.status(404).json({
          ok: false,
          message: "Moneda no encontrada para actualizar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Moneda actualizada correctamente.",
        data: updatedCashDenomination,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al actualizar la moneda."
      );
    }
  },

  deleteCashDenomination: async (req: Request, res: Response) => {
    try {
      const cashDenominationId = parseInt(req.params.id || "0", 10);

      if (!cashDenominationId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de moneda inválido" });
      }

      const deleted = await CashDenominationActions.delete({
        id: cashDenominationId,
      });

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          message: "No se encontró la moneda para eliminar.",
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
