import tokenUtils from '../utils/token.utils.js';
import { createNewUser, getAllUsers, getOneUser, updateOneUser, deleteUser } from '../models/user.model.js';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

const sudoRole = process.env.SUDO_ROLE;

export default {
    loginUser: async (req, res) => {
        try {
            const { login_data, password } = req.body;

            if (!login_data || !password) {
                return res.status(400).json({ ok: false, message: 'Faltan datos de inicio de sesión' });
            }

            const user = await getOneUser(login_data);

            if (!user) {
                return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ ok: false, message: 'Contraseña incorrecta' });
            }

            const payload = { id: user.id, role: user.role, username: user.username, first_name: user.first_name, last_name: user.last_name };
            
            try {
                const token = await tokenUtils.signJwt(payload);
                res.status(200).json({
                    ok: true,
                    message: token.message,
                    token: token.token,
                });
            } catch (tokenError) {
                console.error('Error al generar el token:', tokenError);
                res.status(500).json({ ok: false, message: 'Error al generar el token', error: tokenError.message });
            }
        } catch (error) {
            console.error('Error en loginUser:', error.message);
            res.status(500).json({ ok: false, message: 'Error en loginUser', error: error.message
            });
        }
    },
    allUsers: async (req, res) => {
        try {
            const users = await getAllUsers();

            const formattedUsers = users.map((user, i) => ({
                user_number: `${i + 1}`,
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                role: user.role,
                isVisible: !!user.isVisible // Convertir a booleano
            }));

            if (!formattedUsers || formattedUsers.length === 0) {
                return res.status(404).json({ ok: false, message: 'No autorizado para mostrar usuarios' });
            }

            res.status(200).json({
                ok: true,
                message: 'Usuarios obtenidos correctamente.',
                data: formattedUsers,
            });

        } catch (error) {
            console.error('Error en allUsers:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en allUsers', 
                error: error.message
            });
        }
    },
    oneUser: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await getOneUser(id);

            if (!user) {
                return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
            }       res.status(200).json({
                ok: true,
                message: 'Usuario obtenido correctamente.',
                data: user,
            });

        } catch (error) {
            console.error('Error en oneUser:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en oneUser', 
                error: error.message
            });
        }
    },
    createUser: async (req, res) => {
        try {
            const { first_name, last_name, username, password, role } = req.body;
            const data = { first_name, last_name, username, password, role };

            if (!first_name || !last_name || !username || !password || !role) {
                return res.status(400).json({ ok: false, message: 'Faltan datos para crear el usuario' });
            }

            if (role === sudoRole) {
                return res.status(403).json({ ok: false, message: 'No autorizado para asignar el rol de superusuario' });
            }

            const newUser = await createNewUser(data);

            if (!newUser) {
                return res.status(409).json({ ok: false, message: 'El nombre de usuario ya existe' });
            }

            res.status(201).json({
                ok: true,
                message: 'Usuario creado correctamente.',
                data: newUser,
            });

        } catch (error) {
            console.error('Error en createUser:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en createUser', 
                error: error.message
            });
        }
    },
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { first_name, last_name, username, password, role, isVisible } = req.body;
            const data = { first_name, last_name, username, password, role, isVisible };

            if (role === sudoRole) {
                return res.status(403).json({ ok: false, message: 'No autorizado para asignar el rol de superusuario' });
            }

            const updatedUser = await updateOneUser(['id'], { id, ...data });

            if (!updatedUser) {
                return res.status(404).json({ ok: false, message: 'Usuario no encontrado o datos no modificados' });
            }

            res.status(200).json({
                ok: true,
                message: 'Usuario actualizado correctamente.',
                data: updatedUser,
            });

        } catch (error) {
            console.error('Error en updateUser:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en updateUser', 
                error: error.message
            });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await deleteUser(['id'], { id });

            if (!deleted) {
                return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
            }

            res.status(200).json({
                ok: true,
                message: 'Usuario eliminado correctamente.',
                data: deleted,
            });

        } catch (error) {
            console.error('Error en deleteUser:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en deleteUser', 
                error: error.message
            });
        }
    },
};