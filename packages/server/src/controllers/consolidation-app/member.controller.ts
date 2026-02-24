import { Request, Response } from "express";

import ControllerErrorHandler from "@utils/ControllerErrorHandler.js";

import {
  MemberActions,
  MemberAttributes,
  MemberCreationAttributes,
  MemberSearchData,
} from "@models/consolidation-app/member.model.js";

import {
  MemberCreationSchema,
  BulkMemberSchema,
  MemberUpdateSchema,
} from "@economic-control/shared";

interface AuthRequest extends Request {
  user: {
    id: number;
    username: string;
    role_name: string;
    permissions: any[];
  };
}

export const memberController = {
  // Obtiene todos los registros de personas
  allMembers: async (_req: Request, res: Response) => {
    try {
      const members: MemberAttributes[] = await MemberActions.getAll(true);

      return res.status(200).json({
        ok: true,
        message:
          members.length === 0
            ? "No hay registros de personas registradas."
            : "Registros de personas obtenidos correctamente.",
        data: members,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener los registros de personas.",
      );
    }
  },

  // Obtiene un registro de persona por ID o nombre

  oneMember: async (req: Request, res: Response) => {
    try {
      const { id, name } = req.params;
      const searchCriteria: MemberSearchData = {};

      if (id) {
        searchCriteria.id = parseInt(id as string, 10);
      }

      if (name) {
        searchCriteria.first_name = name as string;
      }

      const memberObtained = await MemberActions.getOne(searchCriteria);

      if (!memberObtained) {
        return res.status(404).json({
          ok: false,
          message:
            "No se encontró el registro de persona con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Registro de persona obtenido correctamente.",
        data: memberObtained,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener el registro de persona.",
      );
    }
  },

  // Crea un nuevo registro de persona
  createMember: async (req: Request, res: Response) => {
    try {
      const validationResult = MemberCreationSchema.safeParse(req.body);
      const currentUserId = (req as AuthRequest).user.id;

      if (!currentUserId) {
        return res.status(401).json({
          ok: false,
          message: "Usuario no autenticado.",
        });
      }

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nuevo registro de persona inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const memberData: MemberCreationAttributes = validationResult.data;

      const newMember = await MemberActions.create(memberData, currentUserId);

      return res.status(201).json({
        ok: true,
        message: "Registro de persona creado correctamente.",
        data: newMember,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al crear el registro de persona.",
      );
    }
  },

  // Crea múltiples miembros
  createBulkMembers: async (req: Request, res: Response) => {
    try {
      const validationResult = BulkMemberSchema.safeParse(req.body);

      const currentUserId = (req as AuthRequest).user.id;

      if (!currentUserId) {
        return res.status(401).json({
          ok: false,
          message: "Usuario no autenticado.",
        });
      }

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de miembros inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const { members } = validationResult.data;

      const newMembers = await MemberActions.createMultipleMembers(
        members,
        currentUserId,
      );

      return res.status(201).json({
        ok: true,
        message: `${newMembers.length} miembros creados correctamente.`,
        data: newMembers,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al crear miembros masivos.",
      );
    }
  },

  updateMember: async (req: Request, res: Response) => {
    try {
      const memberId = parseInt((req.params.id as string) || "0", 10);

      if (!memberId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de registro de persona inválido" });
      }

      const validationResult = MemberUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de registro de persona inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const updateData: Partial<MemberCreationAttributes> =
        validationResult.data;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedMember = await MemberActions.update(
        memberId,

        updateData as Partial<MemberCreationAttributes>,
      );

      if (!updatedMember) {
        return res.status(404).json({
          ok: false,
          message: "Registro de persona no encontrado para actualizar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Registro de persona actualizado correctamente.",
        data: updatedMember,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al actualizar el registro de persona.",
      );
    }
  },

  deleteMember: async (req: Request, res: Response) => {
    try {
      const memberId: number = parseInt((req.params.id as string) || "0", 10);

      if (!memberId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de registro de persona inválido" });
      }

      const deleted = await MemberActions.delete(memberId);

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          message: "No se encontró el registro de persona para eliminar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Registro de persona eliminado correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al eliminar el registro de persona.",
      );
    }
  },
};
