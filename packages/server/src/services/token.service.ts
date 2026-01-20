import jwt from "jsonwebtoken";
import type { Secret } from "jsonwebtoken";
import { tokenUtils, type TokenSignResult } from "../utils/token.utils.js";
import { type LoginPayload } from "../models/user.model.js";

// Leer variables de entorno (token.utils ya llama a dotenv.config)
const REFRESH_SECRET: Secret = process.env.REFRESH_SECRET || "";
const REFRESH_TOKEN_EXPIRATION: string =
  process.env.REFRESH_TOKEN_EXPIRATION || "6d";

if (!REFRESH_SECRET) {
  throw new Error(
    "REFRESH_SECRET no está definida en las variables de entorno."
  );
}

/**
 * Extrae el token sin el prefijo "Bearer "
 */
export const extractBearer = (bearerToken?: string | null): string | null => {
  if (!bearerToken) return null;
  return bearerToken.startsWith("Bearer ") ? bearerToken.slice(7) : bearerToken;
};

/**
 * Crea un Access Token usando tokenUtils.signJwt.
 * Devuelve exactamente lo que signJwt retorna (message, token (con "Bearer " prefix)).
 */
export const createAccessToken = async (
  payload: LoginPayload
): Promise<TokenSignResult> => {
  return tokenUtils.signJwt(payload);
};

/**
 * Crea un Refresh Token firmado con REFRESH_SECRET.
 * Devuelve el token como string (sin prefijo 'Bearer ').
 */
export const createRefreshToken = (payload: LoginPayload): string => {
  try {
    const token = jwt.sign(
      payload as jwt.JwtPayload,
      REFRESH_SECRET as Secret,
      {
        expiresIn: REFRESH_TOKEN_EXPIRATION,
      } as jwt.SignOptions
    );
    return token;
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Error desconocido al crear refresh token";
    throw new Error(message);
  }
};

/**
 * Verifica y decodifica un Refresh Token (firmado con REFRESH_SECRET).
 * Si es válido devuelve el payload (any), si no lanza error.
 */
export const verifyRefreshToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    return decoded;
  } catch (err) {
    // Propaga el error para que el caller lo maneje (401, logout, etc.)
    throw err;
  }
};

/**
 * Verifica un Access Token (con SECRET_KEY) usando tokenUtils.decodeToken.
 * - input: token puede venir con o sin prefijo 'Bearer '
 * - devuelve payload o null si no es válido
 */
export const verifyAccessToken = (bearerToken?: string | null) => {
  const raw = extractBearer(bearerToken);
  if (!raw) return null;
  return tokenUtils.decodeToken(raw);
};
