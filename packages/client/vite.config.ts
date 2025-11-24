import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

const rootDir = path.resolve(__dirname, "..", "..");

const BACKEND_PORT = 3000;
const FRONTEND_PORT = 5173; // Puerto del servidor de desarrollo de Vite
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const API_PREFIX = "/ec/api/v1"; // Prefijo que usaremos en las llamadas de Axios

// https://vite.dev/config/
export default defineConfig({
  //root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      // Alias interno para src
      "@": path.resolve(__dirname, "./src"),

      // Alias para el monorepo (Debe coincidir con el nombre en package.json)
      "@economic-control/shared": path.resolve(
        rootDir,
        "packages/shared/src/index.ts"
      ),
    },
  },

  // Exclusión de paquetes de servidor para evitar errores en el navegador
  optimizeDeps: {
    include: ["@conform-to/react", "@conform-to/zod/v4", "react-query"],
    exclude: [
      // Eliminados: 'sequelize', 'pg', 'pg-hstore', 'mysql2', 'express'
    ],
  },

  // Configuración del proxy para evitar problemas de CORS en desarrollo
  server: {
    proxy: {
      [API_PREFIX]: {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    },
    port: FRONTEND_PORT,
    open: true, // Abre el navegador automáticamente
  },
});
