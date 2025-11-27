import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Interfaces para tipado
interface SequelizeConfig {
  host: string;
  port: number;
  dialect: "mysql";
  logging: boolean;
}

export function getSequelizeConfig(): Sequelize {
  const __dirname: string = dirname(fileURLToPath(import.meta.url));
  const envPath: string = join(__dirname, "../../.env");
  dotenv.config({ path: envPath });

  const MY_DB: string | undefined = process.env.DB_DB;
  const MY_USER: string | undefined = process.env.DB_USER;
  const MY_PASSWORD: string | undefined = process.env.DB_PASSWORD;
  const MY_HOST: string | undefined = process.env.DB_HOST;
  const MY_PORT: number = parseInt(process.env.DB_PORT || "3306", 10);

  // Validación de variables de entorno requeridas
  if (!MY_DB || !MY_USER || !MY_PASSWORD || !MY_HOST) {
    throw new Error(
      "Faltan variables de entorno requeridas para la base de datos"
    );
  }

  const config: SequelizeConfig = {
    host: MY_HOST,
    port: MY_PORT,
    dialect: "mysql",
    logging: false,
  };

  return new Sequelize(MY_DB, MY_USER, MY_PASSWORD, config);
}
