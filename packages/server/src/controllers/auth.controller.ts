import type { Request, Response } from "express";
import ControllerErrorHandler from "../utils/ControllerErrorHandler.js";
import { usersController } from "./users.controller.js";
import { REFRESH_COOKIE_OPTIONS } from "../config/cookies.config.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../services/token.service.js";

export const authController = {
  /**
   * Función para iniciar sesión del usuario.
   * @param req Request
   * @param res Response
   * @returns Access Token en el body y Refresh Token en la cookie HttpOnly.
   */
  loginUser: async (req: Request, res: Response) => {
    try {
      const { login_data, password } = req.body;

      const tokenResult = await usersController.loginUser(login_data, password);

      // tokenResult.token contiene el Access Token y el Refresh Token separados por '|'
      const [accessToken, refreshToken] = tokenResult.token.split("|");

      if (!accessToken || !refreshToken) {
        return res
          .status(500)
          .json({ ok: false, message: "Error al generar tokens." });
      }

      //Enviar el Refresh Token en una cookie HttpOnly
      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

      return res.status(200).json({
        ok: true,
        message: tokenResult.message,
        token: accessToken,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al iniciar sesión.");
    }
  },

  /**
   * Función para renovar el Access Token usando el Refresh Token.
   * @param req Request
   * @param res Response
   * @returns Nuevo Access Token en el body y nuevo Refresh Token en la cookie HttpOnly.
   */
  refreshToken: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;

      if (!refreshToken || refreshToken.trim() === "") {
        return ControllerErrorHandler(
          res,
          new Error("Falta refresh token"),
          "No se proporcionó el refresh token.",
        );
      }

      const payload = verifyRefreshToken(refreshToken!) as any;
      const userId = Number(payload.id);

      if (isNaN(userId) || !userId) {
        return ControllerErrorHandler(
          res,
          new Error("Payload inválido en refresh token: ID no válido"),
          "Payload inválido en refresh token.",
        );
      }

      // Verificar que el usuario aún existe y está activo
      const user = await usersController.getOneVisible(userId);

      if (!user) {
        return ControllerErrorHandler(
          res,
          new Error("Usuario no encontrado o inactivo"),
          "El usuario asociado al refresh token no existe o está inactivo.",
        );
      }

      const payloadForTokens = {
        id: user.id,
        role_name: user.role_name,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
      };

      // Generar nuevos tokens
      const { token: newAccessToken } =
        await createAccessToken(payloadForTokens);
      const newRefreshToken = createRefreshToken(payloadForTokens);

      // Enviar la nueva cookie (reemplaza la anterior)
      res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);

      return res.status(200).json({
        ok: true,
        message: "Tokens renovados correctamente",
        token: newAccessToken,
      });
    } catch (err) {
      // En caso de token inválido/expirado -> borrar cookie
      res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
      return res.status(401).json({
        ok: false,
        message: "Refresh token inválido o expirado. Inicie sesión nuevamente.",
      });
    }
  },

  logoutUser: async (_req: Request, res: Response) => {
    try {
      // Borrar la cookie del refresh token
      res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
      return res.status(200).json({
        ok: true,
        message: "Logout exitoso",
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al cerrar sesión.");
    }
  },
};
