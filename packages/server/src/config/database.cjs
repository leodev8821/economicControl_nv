// packages/server/src/config/database.cjs
require('dotenv').config();

const dbConfig = {
  username: process.env.POSTGRES_USER || process.env.DB_USER || 'leodev',
  password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'leodev-root',
  database: process.env.POSTGRES_DB || process.env.DB_DB || 'developmentDB_postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  dialect: process.env.DB_DIALECT || 'postgres',
  logging: false,
  quoteIdentifiers: true,
  define: {
    underscored: true,
    freezeTableName: true,
  },
};

module.exports = {
  development: dbConfig,
  test: dbConfig,
  production: dbConfig,
};