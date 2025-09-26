import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_PORT = 3000; 
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      'sequelize',    // Excluir el paquete principal de Sequelize
      'pg',           // Dependencias de PostgreSQL
      'pg-hstore',    // El módulo que causa el error
      'mysql2',       // Tu driver de MySQL (también es solo de servidor)
      'express',      // Tu marco de trabajo de servidor
      '@reduxjs/toolkit',
      // ... otras bibliotecas de backend si aparecen
    ]
  },
  server: {
    proxy: {
      '/ec/api/v1': {
        target: BACKEND_URL,
        changeOrigin: true
      }
    }
  }
})
