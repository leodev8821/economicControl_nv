import jwt from "jsonwebtoken";
import type { Secret } from "jsonwebtoken";
import { tokenUtils } from "../utils/token.utils.js";
import { type JwtPayload } from "./auth.types.js";
import { usersController } from "../controllers/auth/users.controller.js";

const REFRESH_SECRET: Secret = process.env.REFRESH_SECRET as string;

if (!REFRESH_SECRET) {
  throw new Error("REFRESH_SECRET no está definida.");
}

// =======================
// LOGIN
// =======================
export const login = async (payload: JwtPayload) => {
  const accessToken = await tokenUtils.signJwt(payload); // 15m
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return {
    accessToken: accessToken.token,
    refreshToken,
  };
};

// =======================
// REFRESH
// =======================
export const refreshSession = async (payload: JwtPayload) => {
  // 🔴 FIX: validar usuario SIEMPRE
  const user = await usersController.getOneVisible(payload.id);
  if (!user) throw new Error("Usuario inválido");

  const newPayload: JwtPayload = {
    id: user.id,
    username: user.username,
    role_name: user.role_name,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
  };

  const accessToken = await tokenUtils.signJwt(newPayload);
  const refreshToken = jwt.sign(newPayload, REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return {
    accessToken: accessToken.token,
    refreshToken,
  };
};
