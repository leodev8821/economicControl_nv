// packages/server/src/config/sequelize.config.ts
import { Sequelize, type Options } from "sequelize";
import { env } from "./env.js";

let sequelizeInstance: Sequelize | null = null;

const dbConfig: Options = {
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DB,
  host: env.DB_HOST,
  port: env.DB_PORT ?? (env.DB_DIALECT === "mysql" ? 3306 : 5432),
  dialect: env.DB_DIALECT,
  logging: false,
  quoteIdentifiers: true,
  define: {
    underscored: true,
    freezeTableName: true,
  },
  ...(env.DB_DIALECT === "postgres" && env.DB_SSL
    ? {
        dialectOptions: {
          ssl: { require: true, rejectUnauthorized: false },
        },
      }
    : {}),
};

// EXPORTACIÓN ÚNICA (ESM)
export default {
  development: dbConfig,
  test: dbConfig,
  production: dbConfig,
};

export function getSequelizeConfig(): Sequelize {
  if (!sequelizeInstance) {
    sequelizeInstance = new Sequelize(
      env.DB_DB,
      env.DB_USER,
      env.DB_PASSWORD,
      dbConfig
    );
  }
  return sequelizeInstance;
}
