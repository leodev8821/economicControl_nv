import type { Request, Response } from "express";
import ControllerErrorHandler from "../utils/ControllerErrorHandler.js";
import {
  UserActions,
  type UserAttributes,
  type UserCreationAttributes,
} from "../models/user.model.js";
import {
  UserCreationSchema,
  type UserCreationRequest,
  UserUpdateSchema,
  type UserUpdateRequest,
} from "@economic-control/shared";
import type { UserSearchData } from "../models/user.model.js";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { UniqueConstraintError } from "sequelize";

// Tipos auxiliares
export type LoginResult = { token: string; message: string };

// Inicializar dotenv
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../../.env");
dotenv.config({ path: envPath });

const sudoRole = process.env.SUDO_ROLE || "SuperUser"; // Valor por defecto seguro

export const usersController = {
  // Obtiene todas las usuarios
  allUsers: async (_req: Request, res: Response) => {
    try {
      const users: UserAttributes[] = await UserActions.getAll();

      return res.status(200).json({
        ok: true,
        message:
          users.length === 0
            ? "No hay usuarios registrados."
            : "Usuarios obtenidos correctamente.",
        data: users,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener las usuarios.",
      );
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
      const validationResult = UserCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nueva usuario inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const userData: UserCreationRequest = validationResult.data;

      const existingUser = await UserActions.getOne({
        username: userData.username,
      });

      if (existingUser) {
        return res.status(409).json({
          ok: false,
          message: "El nombre de usuario ya está en uso.",
        });
      }

      if (userData.role_name === sudoRole) {
        return res.status(403).json({
          ok: false,
          message: `No está permitido crear usuarios con el rol '${sudoRole}'.`,
        });
      }

      const newUser = await UserActions.create(
        userData as UserCreationAttributes,
      );

      return res.status(201).json({
        ok: true,
        message: "Usuario creada correctamente.",
        data: newUser,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return res.status(409).json({
          ok: false,
          message: "El nombre de usuario ya está en uso.",
        });
      }
      return ControllerErrorHandler(res, error, "Error al crear la usuario.");
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      const userId = parseInt((req.params.id as string) || "0", 10);

      if (!userId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de usuario inválido" });
      }

      const validationResult = UserUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de usuario inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const updateData: UserUpdateRequest = validationResult.data;

      const existingUser = await UserActions.getOne({
        username: updateData.username,
      });

      if (existingUser) {
        return res.status(409).json({
          ok: false,
          message: "El nombre de usuario ya está en uso.",
        });
      }

      if (updateData.role_name === sudoRole) {
        return res.status(403).json({
          ok: false,
          message: `No está permitido crear usuarios con el rol '${sudoRole}'.`,
        });
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedUser = await UserActions.update(
        userId,
        updateData as Partial<UserCreationAttributes>,
      );

      if (!updatedUser) {
        return res.status(404).json({
          ok: false,
          message: "Usuario no encontrada para actualizar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Usuario actualizada correctamente.",
        data: updatedUser,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return res.status(409).json({
          ok: false,
          message: "El nombre de usuario ya está en la base de datos.",
        });
      }
      return ControllerErrorHandler(
        res,
        error,
        "Error al actualizar la usuario.",
      );
    }
  },

  deleteUser: async (req: Request, res: Response) => {
    try {
      const userId = parseInt((req.params.id as string) || "0", 10);

      if (!userId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de usuario inválido" });
      }

      const deleted = await UserActions.delete({ id: userId });

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          message: "No se encontró la usuario para eliminar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Usuario eliminada correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al eliminar la usuario.",
      );
    }
  },
};
