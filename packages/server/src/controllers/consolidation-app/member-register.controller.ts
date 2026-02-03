import { Request, Response } from "express";

import ControllerErrorHandler from "../../utils/ControllerErrorHandler.js";

import {
  MemberRegisterActions,
  MemberRegisterAttributes,
  MemberRegisterCreationAttributes,
  MemberRegisterSearchData,
} from "../../models/consolidation-app/member-register.model.js";

import {
  MemberRegisterCreationSchema,
  MemberRegisterUpdateSchema,
} from "@economic-control/shared";

export const memberRegisterController = {
  // Obtiene todos los registros de personas
  allMemberRegisters: async (_req: Request, res: Response) => {
    try {
      const memberRegisters: MemberRegisterAttributes[] =
        await MemberRegisterActions.getAll();

      return res.status(200).json({
        ok: true,
        message:
          memberRegisters.length === 0
            ? "No hay registros de personas registradas."
            : "Registros de personas obtenidos correctamente.",
        data: memberRegisters,
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

  oneMemberRegister: async (req: Request, res: Response) => {
    try {
      const { id, name } = req.params;
      const searchCriteria: MemberRegisterSearchData = {};

      if (id) {
        searchCriteria.id = parseInt(id as string, 10);
      }

      if (name) {
        searchCriteria.first_name = name as string;
      }

      const memberRegisterObtained =
        await MemberRegisterActions.getOne(searchCriteria);

      if (!memberRegisterObtained) {
        return res.status(404).json({
          ok: false,
          message:
            "No se encontró el registro de persona con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Registro de persona obtenido correctamente.",
        data: memberRegisterObtained,
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
  createMemberRegister: async (req: Request, res: Response) => {
    try {
      const validationResult = MemberRegisterCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nuevo registro de persona inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const memberRegisterData: MemberRegisterCreationAttributes =
        validationResult.data;

      const newMemberRegister =
        await MemberRegisterActions.create(memberRegisterData);

      return res.status(201).json({
        ok: true,
        message: "Registro de persona creado correctamente.",
        data: newMemberRegister,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al crear el registro de persona.",
      );
    }
  },

  updateMemberRegister: async (req: Request, res: Response) => {
    try {
      const memberRegisterId = parseInt((req.params.id as string) || "0", 10);

      if (!memberRegisterId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de registro de persona inválido" });
      }

      const validationResult = MemberRegisterUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de registro de persona inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const updateData: Partial<MemberRegisterCreationAttributes> =
        validationResult.data;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedMemberRegister = await MemberRegisterActions.update(
        memberRegisterId,

        updateData as Partial<MemberRegisterCreationAttributes>,
      );

      if (!updatedMemberRegister) {
        return res.status(404).json({
          ok: false,
          message: "Registro de persona no encontrado para actualizar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Registro de persona actualizado correctamente.",
        data: updatedMemberRegister,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al actualizar el registro de persona.",
      );
    }
  },

  deleteMemberRegister: async (req: Request, res: Response) => {
    try {
      const memberRegisterId: number = parseInt(
        (req.params.id as string) || "0",
        10,
      );

      if (!memberRegisterId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de registro de persona inválido" });
      }

      const deleted = await MemberRegisterActions.delete(memberRegisterId);

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
