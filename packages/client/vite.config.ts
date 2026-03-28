import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

const rootDir = path.resolve(__dirname, "..", "..");

const BACKEND_PORT = 3000;
const FRONTEND_PORT = 5173;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const API_PREFIX = "/ec/api/v1";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Alias interno para src
      "@": path.resolve(__dirname, "./src"),

      // Alias para /client/src
      "@core": path.resolve(__dirname, "./src/core"),
      "@modules": path.resolve(__dirname, "./src/modules"),
      "@shared": path.resolve(__dirname, "./src/shared"),

      // Alias para el monorepo (Debe coincidir con el nombre en package.json)
      "@economic-control/shared": path.resolve(
        rootDir,
        "packages/shared/src/index.ts",
      ),
    },
  },

  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Si la librería viene de node_modules, métela en 'vendor'
          if (id.includes("node_modules")) {
            // Esto agrupa React, MUI, Zod, Axios, etc. en un solo archivo sólido
            return "vendor";
          }
        },
      },
    },
  },

  // Exclusión de paquetes de servidor para evitar errores en el navegador
  optimizeDeps: {
    include: [
      "@conform-to/react",
      "@conform-to/zod/v4",
      "@tanstack/react-query",
      "@mui/material",
      "@mui/system",
      "@mui/icons-material",
      "@emotion/react",
      "@emotion/styled",
    ],
    exclude: [],
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
