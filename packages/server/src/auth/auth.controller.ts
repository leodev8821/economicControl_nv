import type { Request, Response } from "express";
import { REFRESH_COOKIE_OPTIONS } from "./auth.cookies.js";
import { UserActions } from "../models/auth/user.model.js";
import { UserPermissionActions } from "../models/auth/user-permission.model.js";
import * as authService from "./auth.service.js";

export const authController = {
  /**
   * Función para iniciar sesión del usuario.
   * @param req payload con login_data y password.
   * @param res response con Access Token y Refresh Token.
   */
  loginUser: async (req: Request, res: Response) => {
    const { login_data, password } = req.body;
    const user = await UserActions.login(login_data, password);

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales inválidas",
      });
    }

    const permissions = await UserPermissionActions.getPermissionsByUser(
      user.id,
    );

    const { accessToken, refreshToken } = await authService.login({
      id: user.id,
      username: user.username,
      role_name: user.role_name,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      permissions: permissions.map((p) => ({
        application_id: p.application_id,
        role_id: p.role_id,
      })),
    });

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      ok: true,
      token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        role_name: user.role_name,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        permissions: permissions.map((p) => ({
          id: p.id,
          user_id: p.user_id,
          application_id: p.application_id,
          role_id: p.role_id,
        })),
      },
    });
  },

  /**
   * Función para renovar el Access Token usando el Refresh Token.
   * @param req Request
   * @param res Response
   * @returns Nuevo Access Token en el body y nuevo Refresh Token en la cookie HttpOnly.
   */
  refreshToken: async (req: Request, res: Response) => {
    const payload = req.userPayload;

    const { accessToken, refreshToken } =
      await authService.refreshSession(payload);

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      ok: true,
      token: accessToken,
    });
  },

  logoutUser: async (_req: Request, res: Response) => {
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ ok: true });
  },
};
