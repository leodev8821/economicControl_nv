import { Request, Response } from "express";
import ControllerErrorHandler from "../../utils/ControllerErrorHandler.js";
import {
  UserPermissionActions,
  type UserPermissionAttributes,
  type UserPermissionCreationAttributes,
} from "../../models/auth/user-permission.model.js";
import {
  UserPermissionCreationSchema,
  type UserPermissionCreationRequest,
} from "@economic-control/shared";

export const userPermissionsController = {
  // Obtiene los permisos de un usuario específico
  getPermissionsByUser: async (req: Request, res: Response) => {
    try {
      const userId = parseInt((req.params.userId as string) || "0", 10);

      if (!userId) {
        return res.status(400).json({
          ok: false,
          message: "ID de usuario inválido.",
        });
      }

      const permissions: UserPermissionAttributes[] =
        await UserPermissionActions.getPermissionsByUser(userId);

      return res.status(200).json({
        ok: true,
        message:
          permissions.length === 0
            ? "El usuario no tiene permisos asignados."
            : "Permisos obtenidos correctamente.",
        data: permissions,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener los permisos del usuario.",
      );
    }
  },

  // Asigna (o actualiza) un rol a un usuario en una aplicación
  assignRole: async (req: Request, res: Response) => {
    try {
      // 1. Validación con Zod
      const validationResult = UserPermissionCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de asignación de rol inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const permissionData: UserPermissionCreationRequest =
        validationResult.data;

      // 2. Ejecutar la acción (Upsert)
      const assignedPermission = await UserPermissionActions.assignRole(
        permissionData as UserPermissionCreationAttributes,
      );

      return res.status(201).json({
        ok: true,
        message: "Rol asignado correctamente.",
        data: assignedPermission,
      });
    } catch (error) {
      if ((error as any).name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({
          ok: false,
          message: "El usuario o la aplicación especificados no existen.",
        });
      }
      return ControllerErrorHandler(res, error, "Error al asignar el rol.");
    }
  },

  // Revoca el acceso
  revokeAccess: async (req: Request, res: Response) => {
    try {
      const userId = parseInt((req.params.userId as string) || "0", 10);
      const appId = parseInt((req.params.appId as string) || "0", 10);

      if (!userId || !appId) {
        return res.status(400).json({
          ok: false,
          message: "Se requieren ID de usuario y ID de aplicación válidos.",
        });
      }

      const revoked = await UserPermissionActions.revokeAccess(userId, appId);

      if (!revoked) {
        return res.status(404).json({
          ok: false,
          message: "No se encontró el permiso para revocar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Acceso revocado correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al revocar el acceso.");
    }
  },

  // Verifica acceso específico
  verifyAccess: async (req: Request, res: Response) => {
    try {
      const { userId, application_id, role_id } = req.body;

      if (!userId || !application_id) {
        return res
          .status(400)
          .json({ ok: false, message: "Faltan datos para verificar." });
      }

      const hasAccess = await UserPermissionActions.checkAccess(
        Number(userId),
        Number(application_id),
        role_id ? Number(role_id) : undefined,
      );

      return res.status(200).json({
        ok: true,
        message: hasAccess ? "Acceso permitido" : "Acceso denegado",
        data: { hasAccess },
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al verificar acceso.");
    }
  },
};
