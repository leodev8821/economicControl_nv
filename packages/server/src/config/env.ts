import { envSchema } from "@economic-control/shared";
import z from "zod";
import path from "node:path";

if (process.env.NODE_ENV !== "production") {
  console.log("🔍 Cargando variables de entorno...");
  //import("dotenv").then((dotenv) => dotenv.config());
  // 1. Importamos dinámicamente (Node no buscará el módulo en Producción)
  const dotenv = await import("dotenv");

  // 2. Configuramos (esperando a que termine antes de seguir)
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variables de entorno inválidas");
  console.error(z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
