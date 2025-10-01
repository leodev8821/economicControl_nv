import express, { Express, json, urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import mysql from './config/mysql.js';
import router from './routes/routes';

// Define el tipo para __dirname, ya que no existe en el módulo ES de forma nativa
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar las variables de entorno
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

const FRONTEND_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'; // Valor por defecto para desarrollo

// Crear la aplicación de Express
const app: Express = express();

// Middlewares
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cors({
    origin: FRONTEND_ORIGIN, // Permitir el origen del frontend (ej: http://localhost:5173)
    credentials: true, // ¡CRUCIAL para que el navegador envíe cookies HttpOnly!
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));
app.use(cookieParser());

// Configurar rutas
app.use('/ec/api/v1', router);

// Definir el tipo para el módulo `mysql`
interface MySqlModule {
    connection: () => Promise<void>;
}

// Función para inicializar conexiones y el servidor
const startServer = async () => {
    try {
        // Conectar base de datos MySQL
        await (mysql as unknown as MySqlModule).connection();
        console.log('✅ Base de datos MySQL conectada');

        const HOST: string = process.env.SERVER_HOST || 'localhost';
        const PORT: number = parseInt(process.env.SERVER_PORT as string, 10) || 3000;

        // Iniciar el servidor
        const server = app.listen(PORT, HOST, () => {
            console.log(`🚀 Servidor en http://${HOST}:${PORT}`);
        });

        // Esperar a que el servidor esté escuchando o a que ocurra un error
        await new Promise<void>((resolve, reject) => {
            server.on('listening', resolve);
            server.on('error', (err: NodeJS.ErrnoException) => {
                if (err.code === 'EADDRINUSE') {
                    console.error(`❌ El puerto ${PORT} ya está en uso. Intentando en otro puerto.`);
                    // Lógica para intentar otro puerto si es necesario, o simplemente rechazar
                    reject(err);
                } else {
                    reject(err);
                }
            });
        });

    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Error crítico al iniciar la aplicación:', error.message);
        } else {
            console.error('❌ Error crítico al iniciar la aplicación:', error);
        }
        process.exit(1);
    }
};

// Iniciar la aplicación
startServer();

export default app;
