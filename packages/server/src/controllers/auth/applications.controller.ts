import { Request, Response } from "express";
import ControllerErrorHandler from "../../utils/ControllerErrorHandler.js";
import {
  ApplicationActions,
  type ApplicationAttributes,
  type ApplicationSearchData,
} from "../../models/auth/application.model.js";
import { UniqueConstraintError } from "sequelize";
import { ApplicationCreationSchema } from "@economic-control/shared";

export const applicationsController = {
  // Obtiene todas las aplicaciones
  allApplications: async (_req: Request, res: Response) => {
    try {
      const apps: ApplicationAttributes[] = await ApplicationActions.getAll();

      return res.status(200).json({
        ok: true,
        message:
          apps.length === 0
            ? "No hay aplicaciones registradas."
            : "Aplicaciones obtenidas correctamente.",
        data: apps,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener las aplicaciones.",
      );
    }
  },

  // Obtiene una aplicación por ID o Nombre
  oneApplication: async (req: Request, res: Response) => {
    try {
      const { id, app_name } = req.query;
      const searchCriteria: ApplicationSearchData = {};

      if (id) {
        searchCriteria.id = parseInt(id as string, 10);
      }
      if (app_name) {
        searchCriteria.app_name = app_name as string;
      }

      if (Object.keys(searchCriteria).length === 0) {
        return res.status(400).json({
          ok: false,
          message:
            "Debe proporcionar un ID o nombre de aplicación para buscar.",
        });
      }

      const app = await ApplicationActions.getOne(searchCriteria);

      if (!app) {
        return res.status(404).json({
          message:
            "No se encontró la aplicación con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Aplicación obtenida correctamente.",
        data: app,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener la aplicación.",
      );
    }
  },

  // Crea una nueva aplicación
  createApplication: async (req: Request, res: Response) => {
    try {
      const validationResult = ApplicationCreationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de aplicación inválidos.",
          errors: validationResult.error.issues,
        });
      }
      const appData = validationResult.data;

      const newApp = await ApplicationActions.create(appData);

      return res.status(201).json({
        ok: true,
        message: "Aplicación creada correctamente.",
        data: newApp,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return res.status(409).json({
          ok: false,
          message: "El nombre de la aplicación ya existe.",
        });
      }
      return ControllerErrorHandler(
        res,
        error,
        "Error al crear la aplicación.",
      );
    }
  },

  // Elimina una aplicación
  deleteApplication: async (req: Request, res: Response) => {
    try {
      const appId = parseInt((req.params.id as string) || "0", 10);

      if (!appId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de aplicación inválido" });
      }

      const deleted = await ApplicationActions.delete(appId);

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          message: "No se encontró la aplicación para eliminar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Aplicación eliminada correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al eliminar la aplicación.",
      );
    }
  },
};
