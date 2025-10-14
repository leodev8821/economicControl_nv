// services/role.service.ts
import { RoleRepository } from '../repositories/role.repository';
import { RoleAttributes } from '../models/role.model';

/**
 * Función genérica para manejar errores en el servicio.
 */
const handleServiceError = (error: unknown, defaultMessage: string): Error => {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error(`Error en el servicio: ${errorMessage}`);
    return new Error(`${defaultMessage}: ${errorMessage}`);
};

/**
 * Servicio de Roles, maneja la lógica de negocio y validaciones.
 */
export class RoleService {

    /**
     * Obtiene todos los roles disponibles.
     */
    public static async getAll(): Promise<RoleAttributes[]> {
        try {
            return await RoleRepository.getAll();
        } catch (error) {
            throw handleServiceError(error, 'Error al obtener todos los roles');
        }
    }
}