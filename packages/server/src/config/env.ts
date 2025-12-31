import "dotenv/config";
import { envSchema } from "@economic-control/shared";
import z from "zod";

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variables de entorno inválidas");
  console.error(z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
