import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { REFRESH_COOKIE_OPTIONS } from '../config/cookies.config';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../services/token.service';

/**
 * Función genérica para manejar errores en los controladores.
 */
const handleControllerError = (res: Response, error: unknown) => {
    if (error instanceof Error) {
        if (error.message.includes('inválido') || error.message.includes('Falta')) {
            return res.status(400).json({ ok: false, message: error.message });
        }
        if (error.message.includes('Contraseña incorrecta') || error.message.includes('deshabilitada')|| error.message.includes('refresh token')) {
            return res.status(401).json({ ok: false, message: error.message });
        }
        if (error.message.includes('No autorizado')) {
            return res.status(403).json({ ok: false, message: error.message });
        }
        if (error.message.includes('no encontrado') || error.message.includes('No se encontraron')) {
            return res.status(404).json({ ok: false, message: error.message });
        }
        console.error('Error en el controlador:', error.message);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor.',
            error: error.message
        });
    }
    return res.status(500).json({
        ok: false,
        message: 'Error interno del servidor.',
        error: 'Error desconocido'
    });
};

export const authController = {
    loginUser: async (req: Request, res: Response) => {
        try {
            const { login_data, password } = req.body;

            const tokenResult = await UserService.login(login_data, password);

            // tokenResult.token contiene el Access Token y el Refresh Token separados por '|'
            const [accessToken, refreshToken] = tokenResult.token.split('|');

            if (!accessToken || !refreshToken) {
                return res.status(500).json({ ok: false, message: 'Error al generar tokens.' });
            }
            
            //Enviar el Refresh Token en una cookie HttpOnly
            res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);  

            return res.status(200).json({
                ok: true,
                message: tokenResult.message,
                token: accessToken,
            });
        } catch (error) {
            return handleControllerError(res, error);
        }
    },

    /**
     * Función para renovar el Access Token usando el Refresh Token.
     * @param req Request 
     * @param res Response
     * @returns Nuevo Access Token en el body y nuevo Refresh Token en la cookie HttpOnly.
     */
    refreshToken: async (req: Request, res: Response) => {
        try {
            const refreshToken = req.cookies?.refreshToken as string | undefined;

            if (!refreshToken || refreshToken.trim() === '') {
                return handleControllerError(res, new Error('Falta refresh token'));
            }

            const payload = verifyRefreshToken(refreshToken!) as any;
            const userId = Number(payload.id)

            if (isNaN(userId) || !userId) {
                return handleControllerError(res, new Error('Payload inválido en refresh token: ID no válido'));
            }

            // Verificar que el usuario aún existe y está activo
            const user = await UserService.getOneVisible(userId);

            if (!user) {
                return handleControllerError(res, new Error('Usuario no encontrado o inactivo'));
            }

            const payloadForTokens = {
                id: user.id,
                role: user.role,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name
            };

            // Generar nuevos tokens
            const { token: newAccessToken } = await createAccessToken(payloadForTokens);
            const newRefreshToken = createRefreshToken(payloadForTokens);

            // Enviar la nueva cookie (reemplaza la anterior)
            res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

            return res.status(200).json({
                ok: true,
                message: 'Tokens renovados correctamente',
                token: newAccessToken
            });

        } catch (err) {
            // En caso de token inválido/expirado -> borrar cookie
            res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
            return res.status(401).json({
                ok: false,
                message: 'Refresh token inválido o expirado. Inicie sesión nuevamente.',
            });
        }
    },

    logoutUser: async (_req: Request, res: Response) => {
        try {
            // Borrar la cookie del refresh token
            res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
            return res.status(200).json({ 
                ok: true, 
                message: 'Logout exitoso' 
            });
        } catch (error) {
            return handleControllerError(res, error);
        }
    }
}