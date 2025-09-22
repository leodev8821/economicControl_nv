import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Usar variables de entorno
const SECRET_KEY = process.env.SECRET_KEY;

const tokenUtils = {
    /**
     * Función para generar un token JWT con los datos proporcionados
     * @param {*} tokenForm --> Objeto con los datos a incluir en el token
     * @returns {Promise} --> Promesa con el token generado
     */
    signJwt: (tokenForm) => {
        return new Promise((resolve, reject) => {
            jwt.sign(tokenForm, SECRET_KEY, { expiresIn: '6d' }, (err, token) => {
                if (err) {
                    reject({ error: 'Error al generar el token' });
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
     * @param {*} token --> Token a verificar
     * @returns {*} --> Contenido decodificado del token
     */
    decodeToken: (token) => {
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            return decoded;
        } catch (error) {
            console.error('❌ Error al verificar token:', error.message);
            return null;
        }
    },
};

export default tokenUtils;