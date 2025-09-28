// services/user.service.ts
import { UserRepository } from '../repositories/user.repository';
import { UserAttributes, UserCreationAttributes, UserRole } from '../models/user.model';
import { createAccessToken, createRefreshToken } from './token.service';


// Tipos auxiliares
export type LoginPayload = { id: number, role: UserRole, username: string, first_name: string, last_name: string };
export type LoginResult = { token: string, message: string };

/**
 * Función genérica para manejar errores en el servicio.
 */
const handleServiceError = (error: unknown, defaultMessage: string): Error => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`Error en el servicio: ${errorMessage}`);
    return new Error(`${defaultMessage}: ${errorMessage}`);
};

/**
 * Servicio de Usuarios, maneja la lógica de negocio, autenticación y validaciones.
 */
export class UserService {

    /**
     * Autentica un usuario y genera un token JWT. ⬅️ Lógica de Negocio Principal
     */
    public static async login(login_data: string, password: string): Promise<LoginResult> {
        if (!login_data || !password) {
            throw new Error('Faltan datos de inicio de sesión.');
        }

        try {
            // Usa la función del repositorio que devuelve la INSTANCIA (raw: false) para comparePassword
            const userInstance = await UserRepository.getOneInstanceByIdentifier(login_data); 

            if (!userInstance) {
                throw new Error('Usuario no encontrado.');
            }
            if (!userInstance.isVisible) {
                 throw new Error('Cuenta deshabilitada.');
            }
            
            const isPasswordValid = await userInstance.comparePassword(password); 
            if (!isPasswordValid) {
                throw new Error('Contraseña incorrecta.');
            }

            const user = userInstance.get({ plain: true });
            const payload: LoginPayload = { 
                id: user.id, 
                role: user.role, 
                username: user.username, 
                first_name: user.first_name, 
                last_name: user.last_name 
            };

            const accessTokenResult = await createAccessToken(payload);
            const refreshToken = createRefreshToken(payload);
            
            // Devuelve ambos tokens Separados por '|'
            return {
                message: accessTokenResult.message,
                token: accessTokenResult.token + '|' + refreshToken
            };
            
        } catch (error) {
            throw handleServiceError(error, 'Error durante el inicio de sesión');
        }
    }


    /**
     * Obtiene todos los usuarios.
     */
    public static async getAll(): Promise<UserAttributes[]> {
        try {
            return await UserRepository.getAll();
        } catch (error) {
            throw handleServiceError(error, 'Error al obtener todos los usuarios');
        }
    }

    /**
     * Obtiene un usuario por ID o username, devolviendo un objeto plano.
     * Esta función es para uso general (como la busqueda por defecto).
     */
    public static async getOnePlain(identifier: string | number): Promise<UserAttributes | null> {
        try {
            // Llama a la nueva función del repositorio. No necesita validación de isVisible.
            return await UserRepository.getOnePlainByIdentifier(identifier);
        } catch (error) {
            throw handleServiceError(error, `Error al buscar usuario con identificador ${identifier}`);
        }
    }
    // ----------------------

    /**
     * Obtiene un usuario por ID o username (solo visibles).
     */
    public static async getOneVisible(identifier: string | number): Promise<UserAttributes | null> {
        try {
            // Usa la función del repositorio que filtra por isVisible: true
            return await UserRepository.getVisibleOneByIdentifier(identifier);
        } catch (error) {
            throw handleServiceError(error, `Error al buscar usuario con identificador ${identifier}`);
        }
    }

    /**
     * Crea un nuevo usuario, con validaciones de negocio.
     */
    public static async create(data: UserCreationAttributes, sudoRole: string): Promise<UserAttributes> {
        if (!data.first_name || !data.last_name || !data.username || !data.password || !data.role) {
            throw new Error('Faltan datos obligatorios para crear el usuario.');
        }
        if (data.role === sudoRole) {
            throw new Error('No autorizado para asignar el rol de superusuario.');
        }

        try {
            // Comprueba la existencia
            const existing = await UserRepository.getOnePlainByIdentifier(data.username);
            if (existing) {
                throw new Error('El nombre de usuario ya existe.');
            }
            return await UserRepository.create(data);
        } catch (error) {
            throw handleServiceError(error, 'Error al crear el usuario');
        }
    }

    /**
     * Actualiza un usuario.
     */
    public static async update(id: number, data: Partial<UserAttributes>, sudoRole: string): Promise<UserAttributes | null> {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('ID de usuario inválido.');
        }
        if (data.role === sudoRole) {
            throw new Error('No autorizado para asignar el rol de superusuario.');
        }

        try {
            return await UserRepository.update({ id }, data);
        } catch (error) {
            throw handleServiceError(error, `Error al actualizar el usuario con ID ${id}`);
        }
    }

    /**
     * Elimina lógicamente (soft delete) un usuario.
     */
    public static async softDelete(id: number): Promise<UserAttributes | null> {
        if (typeof id !== 'number' || id <= 0) {
            throw new Error('ID de usuario inválido.');
        }

        try {
            return await UserRepository.softDelete(id);
        } catch (error) {
            throw handleServiceError(error, `Error al eliminar el usuario con ID ${id}`);
        }
    }
}