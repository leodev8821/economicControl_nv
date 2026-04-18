import { Request, Response } from "express";
import ControllerErrorHandler from "@utils/ControllerErrorHandler.js";
import type { CashSearchData, CashAttributes } from "@models/finance-app/cash.model.js";
import {
  CashCreationDTO,
  CashUpdateDTO,
} from "@economic-control/shared";
import { cashService } from "@services/finance-app/cash.service.js";

export const cashesController = {
  // Obtiene todas las cajas
  allCashes: async (_req: Request, res: Response) => {
    try {
      const cashes: CashAttributes[] = await cashService.getAll();

      return res.status(200).json({
        ok: true,
        message:
          cashes.length > 0
            ? "Cajas obtenidas correctamente."
            : "No hay cajas registradas.",
        data: cashes,
      });

    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener las cajas.");
    }
  },

  // Obtiene una caja por ID o nombre
  oneCash: async (req: Request, res: Response) => {
    try {
      const { term } = req.params;
      const searchCriteria: CashSearchData = {};

      if (!isNaN(Number(term))) {
        searchCriteria.id = parseInt(term as string, 10);
      } else {
        searchCriteria.name = term as string;
      }

      const cash = await cashService.getOne(searchCriteria);

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
      const cashData: CashCreationDTO = req.body;

      const newCash = await cashService.create(cashData);

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
      const cashId = parseInt((req.params.id as string) || "0", 10);

      if (!cashId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de caja inválido" });
      }

      const updateData: CashUpdateDTO = req.body;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedCash = await cashService.update(cashId, updateData);

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
      const cashId = parseInt((req.params.id as string) || "0", 10);

      if (!cashId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de caja inválido" });
      }

      const deleted = await cashService.remove(cashId);

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
