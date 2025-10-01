import { Request, Response, NextFunction } from 'express';
import { tokenUtils } from "../utils/token.utils";
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Obtenemos el tipo del rol súper permitido.
const ALLOWED_ROL = process.env.SUDO_ROLE as string; 

/**
 * Middleware para decodificar el JWT y adjuntar la información del usuario a la Request.
 */
export const decodeUser = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    
    if(!authHeader || authHeader.trim() === '') {
        return res.status(401).json({ ok: false, message: 'No autorizado. Falta el token de autorización.' });
    }
    
    const parts = authHeader.split(' ');

    if (!parts[0] || parts[0].length === 0) {
        return res.status(401).json({ ok: false, message: 'No autorizado. Token malformado.' });
    }

    // Verificar que el formato sea "Bearer token"
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return res.status(401).json({ ok: false, message: 'No autorizado. Formato de token incorrecto.' });
    }
    
    const token = parts[1];

    if (!token || token.trim() === '') {
        return res.status(401).json({ ok: false, message: 'No autorizado. Token vacío.' });
    }

    try {
        // Asume que tokenUtils.decodeToken verifica firma y expiración, y lanza si falla.
        const decoded = tokenUtils.decodeToken(token); 

        if (!decoded) {
            return res.status(401).json({ ok: false, message: 'No autorizado. Token inválido.' });
        }

        // Validar que las propiedades esperadas existan en el payload
        if (typeof decoded.id !== 'number' || !decoded.username || !decoded.role) {
            return res.status(401).json({ ok: false, message: 'No autorizado. Payload del token incompleto o inválido.' });
        }

        // ✅ Asignación de propiedades personalizadas a la Request
        req.username = decoded.username;
        req.first_name = decoded.first_name;
        req.last_name = decoded.last_name;
        req.userRole = decoded.role; // Ya tipado como UserRole
        
        return next();
    } catch (error) {
        // Captura errores de verificación (ej. expiración, firma inválida)
        console.error('Error al decodificar/verificar token:', (error as Error).message);
        return res.status(401).json({ ok: false, message: 'No autorizado. Token inválido o expirado.' });
    }
};

/**
 * Middleware para verificar si la información del usuario (token) fue cargada correctamente.
 * Se usa después de decodeUser.
 */
export const verifyLogin = (req: Request, res: Response, next: NextFunction) => {
    // Verificamos si decodeUser fue exitoso revisando una propiedad clave
    if (!req.username || !req.userRole) {
        return res.status(401).json({ ok: false, message: 'No autorizado. Usuario no autenticado o token incompleto.' });
    }
    return next();
};

/**
 * Middleware para verificar si el usuario tiene el rol de SuperUser.
 * Se usa después de decodeUser.
 */
export const verifySudoRole = (req: Request, res: Response, next: NextFunction) => {
    // Verificamos si el rol decodificado coincide con el rol de superusuario permitido
    if (!req.userRole || req.userRole !== ALLOWED_ROL) {
        return res.status(403).json({ ok: false, message: 'No autorizado. Permisos insuficientes.' });
    }
    return next();
};