import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { type JwtPayload } from "./auth.types.js";
import { tokenUtils } from "../utils/token.utils.js";
import { UserRole } from "../models/auth/user.model.js";
import { UserPermissionActions } from "../models/auth/user-permission.model.js";
import { ROLE_TYPES } from "@economic-control/shared";

const REFRESH_SECRET = process.env.REFRESH_SECRET as string;

/**
 * Middleware de Decodificación de Access Token
 * Verifica y decodifica el access token para obtener el payload
 */
export const decodeAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ ok: false, message: "Access token requerido" });
  }

  const token = auth.slice(7);
  const decoded = tokenUtils.decodeToken(token) as JwtPayload | null;

  if (!decoded) {
    return res
      .status(401)
      .json({ ok: false, message: "Access token inválido" });
  }

  req.userPayload = decoded;
  req.id = decoded.id;
  req.username = decoded.username;
  req.userRole = decoded.role_name;
  req.first_name = decoded.first_name;
  req.last_name = decoded.last_name;

  next();
};

/**
 * Middleware de Decodificación de Refresh Token
 * Verifica y decodifica el refresh token para obtener el payload
 */
export const decodeRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res
      .status(401)
      .json({ ok: false, message: "Refresh token requerido" });
  }

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as JwtPayload;
    req.userPayload = decoded;
    next();
  } catch {
    return res
      .status(401)
      .json({ ok: false, message: "Refresh token inválido" });
  }
};

/**
 * Middleware de Autorización por Aplicación
 * Verifica si el usuario tiene permiso para la app específica (finance, consolidation, etc.)
 */
export const checkAppAccess =
  (application_id: number) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.userRole === ROLE_TYPES.SUPER_USER) {
      return next();
    }

    // Verifica en la tabla de permisos usando el ID del usuario
    if (!req.id) {
      return res
        .status(401)
        .json({ ok: false, message: "Usuario no identificado" });
    }

    const hasAccess = await UserPermissionActions.checkAccess(
      req.id,
      application_id,
    );

    if (!hasAccess) {
      return res.status(403).json({
        ok: false,
        message: `No tienes permisos para acceder a la aplicación: ${application_id}`,
      });
    }

    next();
  };

/**
 * Middleware de Autorización por Rol
 * Verifica si el usuario tiene permiso para el rol específico dentro de una aplicación
 */
export const requireRole =
  (...allowedRoles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        ok: false,
        message: "Permisos insuficientes",
      });
    }
    next();
  };
