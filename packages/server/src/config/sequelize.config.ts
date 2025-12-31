import { Sequelize, Options } from "sequelize";
import { env } from "./env.ts";

let sequelizeInstance: Sequelize | null = null;

// Función que devuelve la instancia de Sequelize con las variables de entorno validadas
export function getSequelizeConfig(): Sequelize {
  if (!sequelizeInstance) {
    const port = env.DB_PORT ?? (env.DB_DIALECT === "mysql" ? 3306 : 5432);

    if (
      env.DB_PORT &&
      ((env.DB_DIALECT === "postgres" && env.DB_PORT !== 5432) ||
        (env.DB_DIALECT === "mysql" && env.DB_PORT !== 3306))
    ) {
      console.warn("⚠️ Puerto DB no coincide con el dialect");
    }

    const config: Options = {
      host: env.DB_HOST,
      port,
      dialect: env.DB_DIALECT,
      logging: false,
      ...(env.DB_DIALECT === "postgres" && env.DB_SSL
        ? {
            dialectOptions: {
              ssl: {
                require: true,
                rejectUnauthorized: false,
              },
            },
          }
        : {}),
    };

    sequelizeInstance = new Sequelize(
      env.DB_DB,
      env.DB_USER,
      env.DB_PASSWORD,
      config
    );
  }

  return sequelizeInstance;
}
