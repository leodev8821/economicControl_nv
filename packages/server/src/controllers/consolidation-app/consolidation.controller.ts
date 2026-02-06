import { Request, Response } from "express";
import ControllerErrorHandler from "../../utils/ControllerErrorHandler.js";
import {
  ConsolidationActions,
  ConsolidationAttributes,
  ConsolidationCreationAttributes,
  ConsolidationSearchData,
} from "../../models/consolidation-app/consolidation.model.js";
import {
  ConsolidationCreationSchema,
  ConsolidationUpdateSchema,
} from "@economic-control/shared";

export const consolidationController = {
  // Obtiene todas las consolidaciones
  allConsolidations: async (_req: Request, res: Response) => {
    try {
      const consolidations: ConsolidationAttributes[] =
        await ConsolidationActions.getAll();

      return res.status(200).json({
        ok: true,
        message:
          consolidations.length === 0
            ? "No hay consolidaciones registradas."
            : "Consolidaciones obtenidas correctamente.",
        data: consolidations,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener las consolidaciones.",
      );
    }
  },

  // Obtiene una consolidación por ID
  oneConsolidation: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const searchCriteria: ConsolidationSearchData = {};

      if (id) {
        searchCriteria.id = parseInt(id as string, 10);
      }

      const consolidationObtained =
        await ConsolidationActions.getOne(searchCriteria);

      if (!consolidationObtained) {
        return res.status(404).json({
          ok: false,
          message:
            "No se encontró la consolidación con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Consolidación obtenida correctamente.",
        data: consolidationObtained,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener la consolidación.",
      );
    }
  },

  // Crea una nueva consolidación
  createConsolidation: async (req: Request, res: Response) => {
    try {
      const validationResult = ConsolidationCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nueva consolidación inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const {
        church_visit_date,
        call_date,
        visit_date,
        observations,
        invited_by,
        register_id,
        lider_id,
        red_id,
        ...rest
      } = validationResult.data;

      const consolidationData: ConsolidationCreationAttributes = {
        ...rest,
        member_register_id: register_id,
        leader_id: lider_id,
        network_id: red_id,
        church_visit_date: new Date(church_visit_date),
        call_date: new Date(call_date),
        visit_date: new Date(visit_date),
        observations: observations ?? null,
        invited_by: invited_by ?? null,
      };

      const newConsolidation =
        await ConsolidationActions.create(consolidationData);

      return res.status(201).json({
        ok: true,
        message: "Consolidación creada correctamente.",
        data: newConsolidation,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al crear la consolidación.",
      );
    }
  },

  updateConsolidation: async (req: Request, res: Response) => {
    try {
      const consolidationId = parseInt((req.params.id as string) || "0", 10);

      if (!consolidationId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de consolidación inválido" });
      }

      const validationResult = ConsolidationUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de consolidación inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const {
        church_visit_date,
        call_date,
        visit_date,
        register_id,
        lider_id,
        red_id,
        ...restUpdate
      } = validationResult.data;

      const updateData: Partial<ConsolidationCreationAttributes> = {
        ...restUpdate,
        ...(register_id && { member_register_id: register_id }),
        ...(lider_id && { leader_id: lider_id }),
        ...(red_id && { network_id: red_id }),
        ...(church_visit_date && {
          church_visit_date: new Date(church_visit_date),
        }),
        ...(call_date && { call_date: new Date(call_date) }),
        ...(visit_date && { visit_date: new Date(visit_date) }),
      };

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedConsolidation = await ConsolidationActions.update(
        consolidationId,
        updateData,
      );

      if (!updatedConsolidation) {
        return res.status(404).json({
          ok: false,
          message: "Consolidación no encontrada para actualizar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Consolidación actualizada correctamente.",
        data: updatedConsolidation,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al actualizar la consolidación.",
      );
    }
  },

  deleteConsolidation: async (req: Request, res: Response) => {
    try {
      const consolidationId: number = parseInt(
        (req.params.id as string) || "0",
        10,
      );

      if (!consolidationId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de consolidación inválido" });
      }

      const deleted = await ConsolidationActions.delete(consolidationId);

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          message: "No se encontró la consolidación para eliminar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Consolidación eliminada correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al eliminar la consolidación.",
      );
    }
  },
};
