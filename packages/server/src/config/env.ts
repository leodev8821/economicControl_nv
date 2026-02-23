import { envSchema } from "@economic-control/shared";
import z from "zod";

// Si usas Turbo en desarrollo, las variables ya estarán en process.env
// Solo mantenemos la carga manual si quieres ejecutar el script de forma aislada
/* if (process.env.NODE_ENV !== "production" && !process.env.SERVER_PORT) {
  const dotenv = await import("dotenv");
  dotenv.config(); // Buscará el .env más cercano (si existe)
} */

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Error de validación en variables de entorno:");
  console.error(JSON.stringify(z.treeifyError(parsed.error), null, 2));
  process.exit(1);
}

export const env = parsed.data;
