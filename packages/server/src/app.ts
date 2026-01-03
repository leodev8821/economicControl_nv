import express, { Express, json, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "http";
import router from "./routes/routes.ts";
import database from "./seeders/initDatabases.ts";
import { env } from "./config/env.ts";

const app: Express = express();
let server: Server;

/* ===========================
 * Middlewares
 * =========================== */
app.use(json());
app.use(urlencoded({ extended: false }));

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
);

app.use(cookieParser());

/* ===========================
 * Healthcheck
 * =========================== */
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

/* ===========================
 * Routes
 * =========================== */
app.use("/ec/api/v1", router);

/* ===========================
 * Server bootstrap
 * =========================== */
const startServer = async (): Promise<void> => {
  try {
    await database.connection();
    console.log("✅ Base de datos conectada");

    server = app.listen(env.SERVER_PORT, env.SERVER_HOST, () => {
      console.log(
        `🚀 Servidor en http://${env.SERVER_HOST}:${env.SERVER_PORT}`
      );
    });

    await new Promise<void>((resolve, reject) => {
      server.on("listening", resolve);
      server.on("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
          console.error(`❌ El puerto ${env.SERVER_PORT} ya está en uso`);
        }
        reject(err);
      });
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";

    console.error("❌ Error crítico al iniciar la aplicación:", message);
    process.exit(1);
  }
};

/* ===========================
 * Graceful shutdown
 * =========================== */
const shutdown = async (signal: string) => {
  console.log(`\n🛑 Recibida señal ${signal}. Cerrando aplicación...`);

  try {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          console.log("🧹 Servidor HTTP cerrado");
          resolve();
        });
      });
    }

    await database.close?.(); // si implementas close()
    console.log("🧹 Conexiones cerradas");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante el shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

/* ===========================
 * Start app
 * =========================== */
startServer();

export default app;
