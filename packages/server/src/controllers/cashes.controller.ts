import { Request, Response } from "express";
import ControllerErrorHandler from "../utils/ControllerErrorHandler.ts";
import type { CashSearchData } from "../models/cash.model.ts";
import {
  CashActions,
  CashAttributes,
  CashCreationAttributes,
} from "../models/cash.model.ts";
import {
  CashCreationSchema,
  CashCreationRequest,
  CashUpdateSchema,
  CashUpdateRequest,
} from "@economic-control/shared";

export const cashesController = {
  // Obtiene todas las cajas
  allCash: async (_req: Request, res: Response) => {
    try {
      const cashes: CashAttributes[] = await CashActions.getAll();

      return res.status(200).json({
        ok: true,
        message:
          cashes.length === 0
            ? "No hay cajas registradas."
            : "Cajas obtenidas correctamente.",
        data: cashes,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener las cajas.");
    }
  },

  // Obtiene una caja por ID o nombre
  oneCash: async (req: Request, res: Response) => {
    try {
      const { id, name } = req.params;
      const searchCriteria: CashSearchData = {};

      if (id) {
        searchCriteria.id = parseInt(id, 10);
      }
      if (name) {
        searchCriteria.name = name;
      }

      const cash = await CashActions.getOne(searchCriteria);

      if (!cash) {
        return res.status(404).json({
          message: "No se encontró la caja con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Caja obtenida correctamente.",
        data: cash,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener la caja.");
    }
  },

  // Crea una nueva caja
  createCash: async (req: Request, res: Response) => {
    try {
      const validationResult = CashCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nueva caja inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const cashData: CashCreationRequest = validationResult.data;

      const newCash = await CashActions.create(
        cashData as CashCreationAttributes
      );

      return res.status(201).json({
        ok: true,
        message: "Caja creada correctamente.",
        data: newCash,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al crear la caja.");
    }
  },

  updateCash: async (req: Request, res: Response) => {
    try {
      const cashId = parseInt(req.params.id || "0", 10);

      if (!cashId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de caja inválido" });
      }

      const validationResult = CashUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de caja inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const updateData: CashUpdateRequest = validationResult.data;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedCash = await CashActions.update(
        cashId,
        updateData as Partial<CashCreationAttributes>
      );

      if (!updatedCash) {
        return res
          .status(404)
          .json({ ok: false, message: "Caja no encontrada para actualizar." });
      }

      return res.status(200).json({
        ok: true,
        message: "Caja actualizada correctamente.",
        data: updatedCash,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al actualizar la caja.");
    }
  },

  deleteCash: async (req: Request, res: Response) => {
    try {
      const cashId = parseInt(req.params.id || "0", 10);

      if (!cashId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de caja inválido" });
      }

      const deleted = await CashActions.delete({ id: cashId });

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          message: "No se encontró la caja para eliminar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Caja eliminada correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al eliminar la caja.");
    }
  },
};
