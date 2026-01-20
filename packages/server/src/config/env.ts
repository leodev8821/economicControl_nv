import "dotenv/config";
import { envSchema } from "@economic-control/shared";
import z from "zod";

// Log para debug (quitar en prod final)
if (process.env.NODE_ENV !== "production") {
  console.log("🔍 Cargando variables de entorno...");
}

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variables de entorno inválidas");
  console.error(z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
