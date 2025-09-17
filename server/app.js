import express, { json, urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import mysql from './config/mysql.js';
// import swaggerUI from 'swagger-ui-express';
// import swaggerDocs from './swagger/swaggerOptions.js';
// import mongo from './database/mongo.js';
// import { initializeDB } from './utils/configMongoDB.js';
// import { router } from './routes/routes.js';

// Crear la aplicación de Express
const app = express();

// Middlewares
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());

// Configurar Swagger (descomenta si tienes swagger)
// app.use('/inventory-app/v1/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Configurar rutas (descomenta si tienes router)
// app.use('/inventory-app/v1', router);

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../.env');

// Cargar las variables de entorno
dotenv.config({ path: envPath });

// Función para inicializar conexiones y servidor
const startServer = async () => {
    try {
        // Conectar base de datos MySQL
        await mysql.connection();
        console.log('✅ Base de datos MySQL conectada');

        const HOST = process.env.SERVER_HOST || 'localhost';
        const PORT = parseInt(process.env.SERVER_PORT, 10) || 3001;
        const server = app.listen(PORT, () => {
            console.log(`🚀 Servidor en http://${HOST}:${PORT}`);
        });

        await new Promise((resolve, reject) => {
            server.on('listening', resolve);
            server.on('error', reject);
        });

    } catch (error) {
        console.error('❌ Error crítico al iniciar la aplicación:', error.message);
        process.exit(1);
    }
};

// Iniciar la aplicación
startServer();

export default app;
