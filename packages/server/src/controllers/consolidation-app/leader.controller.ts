import { Request, Response } from "express";

import ControllerErrorHandler from "../../utils/ControllerErrorHandler.js";

import {
  LiderActions,
  LeaderAttributes,
  LeaderCreationAttributes,
  LeaderSearchData,
} from "../../models/consolidation-app/leader.model.js";

import {
  LeaderCreationSchema,
  LeaderUpdateSchema,
} from "@economic-control/shared";

export const leaderController = {
  // Obtiene todos los líderes
  allLeaders: async (_req: Request, res: Response) => {
    try {
      const leaders: LeaderAttributes[] = await LiderActions.getAll();

      return res.status(200).json({
        ok: true,
        message:
          leaders.length === 0
            ? "No hay líderes registrados."
            : "Líderes obtenidos correctamente.",
        data: leaders,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener los líderes.",
      );
    }
  },

  // Obtiene un líder por ID o username
  oneLeader: async (req: Request, res: Response) => {
    try {
      const { id, username } = req.params;

      const searchCriteria: LeaderSearchData = {};

      if (id) {
        searchCriteria.id = parseInt(id as string, 10);
      }

      if (username) {
        searchCriteria.username = username as string;
      }

      const leaderObtained = await LiderActions.getOne(searchCriteria);

      if (!leaderObtained) {
        return res.status(404).json({
          message: "No se encontró el líder con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Líder obtenido correctamente.",
        data: leaderObtained,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener el líder.");
    }
  },

  // Crea un nuevo líder
  createLeader: async (req: Request, res: Response) => {
    try {
      const validationResult = LeaderCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nuevo líder inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const leaderData = validationResult.data as LeaderCreationAttributes;

      const newLeader = await LiderActions.create(leaderData);

      return res.status(201).json({
        ok: true,
        message: "Líder creado correctamente.",
        data: newLeader,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al crear el líder.");
    }
  },

  updateLeader: async (req: Request, res: Response) => {
    try {
      const leaderId = parseInt((req.params.id as string) || "0", 10);

      if (!leaderId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de líder inválido" });
      }

      const validationResult = LeaderUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de líder inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const updateData = validationResult.data as Partial<LeaderAttributes>;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedLeader = await LiderActions.update(
        leaderId,

        updateData as Partial<LeaderCreationAttributes>,
      );

      if (!updatedLeader) {
        return res
          .status(404)
          .json({ ok: false, message: "Líder no encontrado para actualizar." });
      }

      return res.status(200).json({
        ok: true,
        message: "Líder actualizado correctamente.",
        data: updatedLeader,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al actualizar el líder.",
      );
    }
  },

  deleteLeader: async (req: Request, res: Response) => {
    try {
      const leaderId: number = parseInt((req.params.id as string) || "0", 10);

      if (!leaderId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de líder inválido" });
      }

      const deleted = await LiderActions.delete(leaderId);

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          message: "No se encontró el líder para eliminar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Líder eliminado correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al eliminar el líder.");
    }
  },

  // Inicia sesión de líder
  login: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          ok: false,
          message: "Nombre de usuario y contraseña son requeridos.",
        });
      }

      const leader = await LiderActions.login(username, password);

      if (!leader) {
        return res
          .status(401)
          .json({ ok: false, message: "Credenciales inválidas." });
      }

      return res
        .status(200)
        .json({ ok: true, message: "Inicio de sesión exitoso.", data: leader });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al iniciar sesión.");
    }
  },
};
