import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { type JwtPayload } from "./auth.types.js";
import { tokenUtils } from "../utils/token.utils.js";
import { UserRole } from "../models/user.model.js";

const REFRESH_SECRET = process.env.REFRESH_SECRET as string;

// =======================
// ACCESS TOKEN
// =======================
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

// =======================
// REFRESH TOKEN
// =======================
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

// =======================
// SUDO ROLE
// =======================
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
