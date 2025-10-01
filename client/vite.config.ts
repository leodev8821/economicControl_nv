import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND_PORT = 3000; 
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const API_PREFIX = '/ec/api/v1'; // Prefijo que usaremos en las llamadas de Axios

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Exclusión de paquetes de servidor para evitar errores en el navegador
  optimizeDeps: {
    exclude: [
      'sequelize',
      'pg',       
      'pg-hstore',
      'mysql2',   
      'express',  
    ]
  },

  resolve: {
    alias: [
      { find: '@', replacement: '/src' }
    ]
  },

  // Configuración del proxy para evitar problemas de CORS en desarrollo
  server: {
    proxy: {
      [API_PREFIX]: {
        target: BACKEND_URL,
        changeOrigin: true
      }
    },
    port: 5173, // Puerto del servidor de desarrollo de Vite
    open: true // Abre el navegador automáticamente
  }
})
