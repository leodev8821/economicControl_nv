import type { Request, Response } from "express";
import ControllerErrorHandler from "../../utils/ControllerErrorHandler.js";
import {
  UserActions,
  type UserAttributes,
  type UserCreationAttributes,
} from "../../models/auth/user.model.js";
import {
  ROLE_TYPES,
  UserCreationSchema,
  UserUpdateSchema,
} from "@economic-control/shared";
import type { UserSearchData } from "../../models/auth/user.model.js";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { UniqueConstraintError } from "sequelize";
import { APP_IDS } from "../../shared/app.constants.js";

// Tipos auxiliares
export type LoginResult = { token: string; message: string };

// Inicializar dotenv
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../../.env");
dotenv.config({ path: envPath });

const sudoRole = process.env.SUDO_ROLE || "SuperUser"; // Valor por defecto seguro

export const usersController = {
  // Obtiene todos los usuarios
  allUsers: async (req: Request, res: Response) => {
    try {
      const requester = (req as any).user;
      const { applicationId } = req.query;

      if (!requester) {
        return res.status(401).json({
          ok: false,
          message: "Usuario no autenticado correctamente.",
        });
      }

      // 2. Lógica de permisos basada en los datos del token
      const isSuperUser = requester.role_name === sudoRole;
      const permissions = requester.permissions || [];

      const hasGlobalAccess: boolean = permissions.some(
        (p: any) => p.application_id === APP_IDS.ALL,
      );

      let appIdToFilter: number | undefined;

      if (isSuperUser || hasGlobalAccess) {
        appIdToFilter = applicationId
          ? parseInt(applicationId as string, 10)
          : undefined;
      } else {
        // Si es admin de app, forzamos su ID asignado
        appIdToFilter = permissions[0]?.application_id;
      }

      const users = await UserActions.getAll(
        appIdToFilter,
        hasGlobalAccess || isSuperUser,
      );

      return res.status(200).json({
        ok: true,
        data: users,
      });
    } catch (error) {
      console.error("Error en allUsers:", error);
      return ControllerErrorHandler(res, error, "Error al obtener usuarios.");
    }
  },

  // Obtiene una usuario por ID o nombre
  oneUser: async (req: Request, res: Response) => {
    try {
      const { id, username, first_name, last_name } = req.params;
      const searchCriteria: UserSearchData = {};

      if (id) {
        searchCriteria.id = parseInt(id as string, 10);
      }
      if (username) {
        searchCriteria.username = username as string;
      }
      if (first_name) {
        searchCriteria.first_name = first_name as string;
      }
      if (last_name) {
        searchCriteria.last_name = last_name as string;
      }

      const user = await UserActions.getOne(searchCriteria);

      if (!user) {
        return res.status(404).json({
          message:
            "No se encontró la usuario con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Usuario obtenida correctamente.",
        data: user,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener la usuario.");
    }
  },

  getOneVisible: async (
    identifier: string | number,
  ): Promise<UserAttributes | null> => {
    return UserActions.getOneByAnyIdentifier(identifier);
  },

  // Crea una nueva usuario
  createUser: async (req: Request, res: Response) => {
    try {
      // 1. Validar con Zod
      const validationResult = UserCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de usuario o permisos inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const { permissions, ...userData } = validationResult.data;
      const requester = (req as any).user;

      const isSuperUser = requester.role_name === sudoRole;
      const hasGlobalAccess = requester.permissions.some(
        (p: any) => p.application_id === APP_IDS.ALL,
      );

      if (!isSuperUser && !hasGlobalAccess) {
        const myAppId = requester.permissions[0]?.application_id;
        const isTargetingOtherApp = permissions.some(
          (p) => p.application_id !== myAppId,
        );

        if (isTargetingOtherApp) {
          return res.status(403).json({
            ok: false,
            message:
              "No tienes permiso para asignar usuarios a otras aplicaciones.",
          });
        }
      }

      if (userData.role_name === sudoRole) {
        return res.status(403).json({
          ok: false,
          message: `No está permitido crear usuarios con el rol '${sudoRole}'.`,
        });
      }

      const existingUser = await UserActions.getOne({
        username: userData.username,
      });

      if (existingUser) {
        return res.status(409).json({
          ok: false,
          message: "El nombre de usuario ya está en uso.",
        });
      }

      const newUser = await UserActions.createWithPermissions(
        userData as UserCreationAttributes,
        permissions,
      );

      return res.status(201).json({
        ok: true,
        message: "Usuario y permisos creados correctamente.",
        data: newUser,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return res.status(409).json({
          ok: false,
          message:
            "Conflicto de duplicidad: El usuario o un permiso ya existe.",
        });
      }
      return ControllerErrorHandler(
        res,
        error,
        "Error crítico al crear usuario con permisos.",
      );
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      const currentUserId = req.id;

      if (!userId) {
        return res.status(400).json({
          ok: false,
          message: "ID de usuario inválido",
        });
      }

      // evitar cambiar tu propio rol (recomendado)
      if (userId === currentUserId && req.body.role_name) {
        return res.status(403).json({
          ok: false,
          message: "No puedes cambiar tu propio rol",
        });
      }

      // ✅ VALIDACIÓN CON ZOD
      const parsed = UserUpdateSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos inválidos",
          errors: parsed.error.issues,
        });
      }

      const updateData = parsed.data;

      // evitar update vacío
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar",
        });
      }

      // validar username duplicado
      if (updateData.username) {
        const existingUser = await UserActions.getOne({
          username: updateData.username,
        });

        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({
            ok: false,
            message: "El nombre de usuario ya está en uso",
          });
        }
      }

      const updatedUser = await UserActions.update(
        userId,
        updateData as Partial<UserCreationAttributes>,
      );

      if (
        updateData.role_name === ROLE_TYPES.SUPER_USER &&
        req.userRole !== ROLE_TYPES.SUPER_USER
      ) {
        return res.status(403).json({
          ok: false,
          message: "No puedes asignar ese rol",
        });
      }

      if (!updatedUser) {
        return res.status(404).json({
          ok: false,
          message: "Usuario no encontrado",
        });
      }

      return res.json({
        ok: true,
        data: updatedUser,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al actualizar usuario");
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    const userIdToDelete = Number(req.params.id);

    if (req.id === userIdToDelete) {
      return res.status(403).json({
        ok: false,
        message: "No puedes eliminar tu propio usuario",
      });
    }

    const deleted = await UserActions.update(userIdToDelete, {
      is_visible: false,
    });

    return res.json({
      ok: true,
      deleted,
    });
  },
};
