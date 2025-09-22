import { getAllRoles } from "../models/role.model.js";
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env');

dotenv.config({ path: envPath });

export default {
    allRoles: async (req, res) => {
        try {
            const roles = await getAllRoles();

            if (!roles || roles.length === 0) {
                return res.status(404).json({ ok: false, message: 'No autorizado para mostrar roles' });
            }

            // Formatea la respuesta directamente con los valores ENUM
            const formattedResponse = roles.map(role => ({
                id: role.id,
                role: role.role
            }));

            res.status(200).json({
                ok: true,
                message: 'Roles obtenidos correctamente.',
                data: formattedResponse,
            });

        } catch (error) {
            console.error('Error en allRoles:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en allRoles', 
                error: error.message
            });
        }
    }
}
