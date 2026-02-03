import { Request, Response } from "express";
import ControllerErrorHandler from "../../utils/ControllerErrorHandler.js";
import {
  NetworkActions,
  NetworkAttributes,
  NetworkCreationAttributes,
  NetworkSearchData,
} from "../../models/consolidation-app/network.model.js";
import {
  NetworkCreationSchema,
  NetworkUpdateSchema,
} from "@economic-control/shared";

export const redController = {
  // Obtiene todas las redes
  allNetworks: async (_req: Request, res: Response) => {
    try {
      const networks: NetworkAttributes[] = await NetworkActions.getAll();

      return res.status(200).json({
        ok: true,
        message:
          networks.length === 0
            ? "No hay redes registradas."
            : "Redes obtenidas correctamente.",
        data: networks,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener las redes.");
    }
  },

  // Obtiene una red por ID o nombre
  oneNetwork: async (req: Request, res: Response) => {
    try {
      const { id, network } = req.params;
      const searchCriteria: NetworkSearchData = {};

      if (id) {
        searchCriteria.id = parseInt(id as string, 10);
      }
      if (network) {
        searchCriteria.name = network as string;
      }

      const networkObtained = await NetworkActions.getOne(searchCriteria);

      if (!networkObtained) {
        return res.status(404).json({
          message: "No se encontró la red con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Red obtenida correctamente.",
        data: networkObtained,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener la red.");
    }
  },

  // Crea una nueva red
  createNetwork: async (req: Request, res: Response) => {
    try {
      const validationResult = NetworkCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nueva red inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const networkData: NetworkCreationAttributes = validationResult.data;

      const newNetwork = await NetworkActions.create(networkData);

      return res.status(201).json({
        ok: true,
        message: "Red creada correctamente.",
        data: newNetwork,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al crear la red.");
    }
  },

  updateNetwork: async (req: Request, res: Response) => {
    try {
      const networkId = parseInt((req.params.id as string) || "0", 10);

      if (!networkId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de red inválido" });
      }

      const validationResult = NetworkUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de red inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const updateData: Partial<NetworkCreationAttributes> =
        validationResult.data;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedNetwork = await NetworkActions.update(
        networkId,
        updateData as Partial<NetworkCreationAttributes>,
      );

      if (!updatedNetwork) {
        return res
          .status(404)
          .json({ ok: false, message: "Red no encontrada para actualizar." });
      }

      return res.status(200).json({
        ok: true,
        message: "Red actualizada correctamente.",
        data: updatedNetwork,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al actualizar la red.");
    }
  },

  deleteNetwork: async (req: Request, res: Response) => {
    try {
      const networkId: number = parseInt((req.params.id as string) || "0", 10);

      if (!networkId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de red inválido" });
      }

      const deleted = await NetworkActions.delete(networkId);

      if (!deleted) {
        return res
          .status(404)
          .json({ ok: false, message: "No se encontró la red para eliminar." });
      }

      return res.status(200).json({
        ok: true,
        message: "Red eliminada correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al eliminar la red.");
    }
  },
};
