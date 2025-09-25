// utils/token.utils.ts
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { LoginPayload } from '../services/user.service'; // Importamos el tipo de payload del servicio

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
// Nota: La ruta de join puede variar si el archivo .env no está en la raíz
const envPath = join(__dirname, '../../.env'); 
dotenv.config({ path: envPath });

// Usar variables de entorno y asegurarse de que no son undefined
const SECRET_KEY = process.env.SECRET_KEY as string;

if (!SECRET_KEY) {
    console.error('⚠️ Error de configuración: La variable de entorno SECRET_KEY no está definida.');
    // En un entorno de producción, lanzarías un error fatal
    throw new Error('SECRET_KEY no está definida.'); 
}

// Tipo para el resultado de la firma del token
export interface TokenSignResult {
    message: string;
    token: string;
}

export const tokenUtils = {
    /**
     * Función para generar un token JWT con los datos proporcionados
     * @param tokenForm Objeto con los datos a incluir en el token (LoginPayload o similar)
     * @returns Promesa con el token generado
     */
    signJwt: (tokenForm: LoginPayload): Promise<TokenSignResult> => {
        return new Promise((resolve, reject) => {
            jwt.sign(tokenForm, SECRET_KEY, { expiresIn: '6d' }, (err, token) => {
                if (err) {
                    reject(new Error('Error al generar el token: ' + (err.message || 'Error desconocido')));
                } else {
                    resolve({
                        message: '---- Usuario logueado correctamente ------',
                        token: 'Bearer ' + token
                    });
                }
            });
        });
    },

    /**
     * Función para verificar un token y devuelve su contenido decodificado (null si no es válido)
     * @param token Token a verificar (sin el prefijo 'Bearer ')
     * @returns Contenido decodificado del token (LoginPayload) o null
     */
    decodeToken: (token: string): LoginPayload | null => {
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            return decoded as LoginPayload;
        } catch (error) {
            // Mantenemos el logging para depuración
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.error('❌ Error al verificar token:', errorMessage);
            return null;
        }
    },
};