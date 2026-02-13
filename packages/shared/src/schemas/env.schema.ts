import { z } from "zod";

export const envSchema = z.object({
  /* ===========================
   * Server
   * =========================== */
  SERVER_HOST: z.string().min(1, "SERVER_HOST es obligatorio"),

  SERVER_PORT: z.coerce.number().int().positive().default(3000),

  /* ===========================
   * Database
   * =========================== */
  DB_DIALECT: z.enum(["postgres", "mysql"]).default("postgres"),

  DB_HOST: z.string().min(1, "DB_HOST es obligatorio"),

  DB_PORT: z.coerce.number().int().positive().optional(),

  DB_DB: z.string().min(1, "DB_DB es obligatorio"),

  DB_USER: z.string().min(1, "DB_USER es obligatorio"),

  DB_PASSWORD: z.string().min(1, "DB_PASSWORD es obligatorio"),

  DB_SSL: z.coerce.boolean().default(false),

  /* ===========================
   * Superuser
   * =========================== */
  SUDO_ROLE: z.string().min(1),
  SUDO_USERNAME: z.string().min(1),
  SUDO_PASSWORD: z.string().min(1),
  SUDO_FIRSTNAME: z.string().min(1),
  SUDO_LASTNAME: z.string().min(1),
  SUDO_EMAIL: z.email(),
  SUDO_PHONE: z.string().min(1),

  SUDO_IS_VISIBLE: z.coerce.boolean().default(true),

  /* ===========================
   * Security / Auth
   * =========================== */
  SECRET_KEY: z.string().min(10, "SECRET_KEY demasiado corto"),

  REFRESH_SECRET: z.string().min(10, "REFRESH_SECRET demasiado corto"),

  ACCESS_TOKEN_EXPIRATION: z
    .string()
    .regex(/^\d+[smhd]$/, "Formato inválido (ej: 15m, 1h, 7d)"),

  REFRESH_TOKEN_EXPIRATION: z
    .string()
    .regex(/^\d+[smhd]$/, "Formato inválido (ej: 6d, 30d)"),

  /* ===========================
   * Node
   * =========================== */
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  /* ===========================
   * CORS
   * =========================== */
  CORS_ORIGIN: z.url(),
});
