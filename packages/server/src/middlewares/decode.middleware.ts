import type { Request, Response, NextFunction } from "express";
import { tokenUtils } from "../utils/token.utils.js";
import { verifyRefreshToken } from "../services/token.service.js";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "../../.env");
dotenv.config({ path: envPath });

// Obtenemos el tipo del rol súper permitido.
const ALLOWED_ROL = process.env.SUDO_ROLE as string;

/**
 * 🔑 Decodifica el Access Token de la cabecera 'Authorization: Bearer <token>'.
 * Usa SECRET_KEY (firma de Access Token).
 */
export const decodeAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. Obtener de la cabecera
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error("decodeAccessToken: Falta la cabecera de autorización.");
    return res
      .status(401)
      .json({ ok: false, message: "No autorizado. Falta el Access Token." });
  }

  // 2. Extraer el token
  const parts = authHeader.split(" ");
  const token = parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null;

  if (!token) {
    console.error("decodeAccessToken: Formato de cabecera inválido.");
    return res.status(401).json({
      ok: false,
      message: "No autorizado. Formato de token inválido.",
    });
  }

  try {
    // 3. Decodificar y verificar el token
    const decoded = tokenUtils.decodeToken(token);

    if (
      !decoded ||
      typeof decoded.id !== "number" ||
      !decoded.username ||
      !decoded.role_name
    ) {
      return res.status(401).json({
        ok: false,
        message: "No autorizado. Access Token inválido o payload incompleto.",
      });
    }

    // ✅ Asignación de propiedades personalizadas a la Request (tipadas)
    req.username = decoded.username;
    req.first_name = decoded.first_name;
    req.last_name = decoded.last_name;
    req.userRole = decoded.role_name;

    return next();
  } catch (error) {
    console.error(
      "Error al decodificar/verificar Access Token:",
      (error as Error).message,
    );
    return res.status(401).json({
      ok: false,
      message: "No autorizado. Access Token inválido o expirado.",
    });
  }
};

/**
 * 🔄 Decodifica el Refresh Token de la cookie 'refreshToken'.
 * Usa REFRESH_SECRET.
 */
export const decodeRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // LOGS CRÍTICOS PARA VER EN DOCKER
  console.error("--- DEBUG MIDDLEWARE REFRESH ---");
  // 1. Obtener de la cookie
  const token = req.cookies?.refreshToken;

  if (!token || typeof token !== "string" || token.trim() === "") {
    console.error(
      "❌ decodeRefreshToken: No se encontró el Refresh Token en la cookie.",
    );
    return res
      .status(401)
      .json({ ok: false, message: "No autorizado. Falta el Refresh Token." });
  }

  try {
    // 2. Decodificar y verificar el token
    const decoded = verifyRefreshToken(token) as any;

    if (
      !decoded ||
      !decoded.id ||
      typeof decoded.id !== "number" ||
      !decoded.username ||
      !decoded.role
    ) {
      return res.status(401).json({
        ok: false,
        message: "No autorizado. Payload incompleto.",
      });
    }

    req.userPayload = decoded;

    // ✅ Asignación de propiedades para la generación del nuevo Access Token
    req.username = decoded.username;
    req.first_name = decoded.first_name;
    req.last_name = decoded.last_name;
    req.userRole = decoded.role;

    return next();
  } catch (error) {
    console.error("❌ JWT Refresh Error:", (error as Error).message);
    return res.status(401).json({
      ok: false,
      message: "No autorizado. Refresh Token inválido o expirado.",
    });
  }
};

/**
 * Middleware para verificar si la información del usuario (token) fue cargada correctamente.
 * Se usa después de decodeUser.
 */
export const verifyLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Verificamos si decodeUser fue exitoso revisando una propiedad clave
  if (!req.username || !req.userRole) {
    return res.status(401).json({
      ok: false,
      message: "No autorizado. Usuario no autenticado o token incompleto.",
    });
  }
  return next();
};

/**
 * Middleware para verificar si el usuario tiene el rol de SuperUser.
 * Se usa después de decodeUser.
 */
export const verifySudoRole = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Verificamos si el rol decodificado coincide con el rol de superusuario permitido
  if (!req.userRole || req.userRole !== ALLOWED_ROL) {
    return res
      .status(403)
      .json({ ok: false, message: "No autorizado. Permisos insuficientes." });
  }
  return next();
};
