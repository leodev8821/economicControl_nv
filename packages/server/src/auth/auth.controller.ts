import type { Request, Response } from "express";
import { REFRESH_COOKIE_OPTIONS } from "./auth.cookies.js";
import * as authService from "./auth.service.js";

export const authController = {
  /**
   * Función para iniciar sesión del usuario.
   * @param req payload con login_data y password.
   * @param res response con Access Token y Refresh Token.
   */
  loginUser: async (req: Request, res: Response) => {
    const { login_data, password } = req.body;

    const user = await req.app.locals.users.login(login_data, password);

    const { accessToken, refreshToken } = await authService.login({
      id: user.id,
      username: user.username,
      role_name: user.role_name,
      first_name: user.first_name,
      last_name: user.last_name,
    });

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      ok: true,
      token: accessToken,
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
