import tokenUtils from "../utils/token.utils.js";
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

const ALLOWED_ROL = process.env.SUDO_ROLE;

export const decodeUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if(!authHeader || !authHeader.trim()) {
        return res.status(401).json({ ok: false, message: 'No autorizado. Falta el token de autorización.' });
    }
    
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ ok: false, message: 'No autorizado. Token no proporcionado.' });
    }

    const decoded = tokenUtils.decodeToken(token);

    if (!decoded) {
        return res.status(401).json({ ok: false, message: 'No autorizado. Token inválido o expirado.' });
    }

    req.username = decoded.username;
    req.first_name = decoded.first_name;
    req.last_name = decoded.last_name;
    req.userRole = decoded.role;
    next();
};

export const verifyLogin = (req, res, next) => {
    if (!req.username) {
        return res.status(401).json({ ok: false, message: 'No autorizado. Usuario no autenticado.' });
    }
    next();
};

export const verifySudoRole = (req, res, next) => {
    if (req.userRole !== ALLOWED_ROL) {
        return res.status(403).json({ ok: false, message: 'No autorizado. Permisos insuficientes.' });
    }
    next();
};