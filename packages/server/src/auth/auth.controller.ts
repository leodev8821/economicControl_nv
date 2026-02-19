import type { Request, Response } from "express";
import { REFRESH_COOKIE_OPTIONS } from "./auth.cookies.js";
import { UserActions, UserModel } from "../models/auth/user.model.js";
import { UserPermissionActions } from "../models/auth/user-permission.model.js";
import * as authService from "./auth.service.js";
import ControllerErrorHandler from "../utils/ControllerErrorHandler.js";
import { sendMail } from "../utils/mailer.js";
import { Op } from "sequelize";
import crypto from "crypto";

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

  /**
   * Función para cerrar sesión del usuario.
   * @param _req Request
   * @param res Response
   * @returns 200 OK
   */
  logoutUser: async (_req: Request, res: Response) => {
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ ok: true });
  },

  /**
   * Función para solicitar la recuperación de la contraseña.
   * @param req Request
   * @param res Response
   * @returns 200 OK
   */
  forgotPassword: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await UserModel.findOne({ where: { email } });

      if (!user) {
        // Por seguridad, siempre devolvemos OK aunque el correo no exista
        // para evitar que atacantes descubran qué correos están registrados.
        return res.json({
          ok: true,
          message: "Si el correo existe, recibirás un enlace.",
        });
      }

      // Generar token seguro de 32 bytes
      const resetToken = crypto.randomBytes(32).toString("hex");
      const tokenExpires = new Date(Date.now() + 3600000); // Expira en 1 hora

      await user.update({
        reset_token: resetToken,
        reset_token_expires: tokenExpires,
      });

      // 3. Crear enlace
      const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

      // 4. Diseñar el correo HTML
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Recuperación de contraseña</h2>
          <p>Hola, ${user.first_name}:</p>
          <p>Hemos recibido una solicitud para restablecer tu contraseña en NV Control.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña. Este enlace caducará en 1 hora.</p>
          <a href="${resetLink}" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
            Restablecer contraseña
          </a>
          <p>Si no solicitaste este cambio, puedes ignorar este correo con seguridad.</p>
        </div>
      `;

      // 5. ENVIAR EL CORREO REAL
      await sendMail(
        user.email,
        "Recupera tu contraseña de NV Control",
        emailHtml,
      );
      return res.json({
        ok: true,
        message: "Si el correo existe, recibirás un enlace.",
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al solicitar recuperación",
      );
    }
  },

  /**
   * Función para aplicar la nueva contraseña.
   * @param req Request
   * @param res Response
   * @returns 200 OK
   */
  resetPassword: async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      // Buscar usuario con ese token y que no haya expirado
      const user = await UserModel.findOne({
        where: {
          reset_token: token,
          reset_token_expires: { [Op.gt]: new Date() }, // Expire > Ahora
        },
      });

      if (!user) {
        return res
          .status(400)
          .json({ ok: false, message: "El token es inválido o ha expirado." });
      }

      // Actualizar contraseña (el hook beforeSave la encriptará) y limpiar token
      user.password = newPassword;
      user.reset_token = null;
      user.reset_token_expires = null;

      await user.save(); // ¡Muy importante usar .save() para que se dispare bcrypt!

      return res.json({
        ok: true,
        message: "Contraseña actualizada exitosamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al resetear contraseña");
    }
  },
};
