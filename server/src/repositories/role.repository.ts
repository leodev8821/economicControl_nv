// repositories/role.repository.ts
import { RoleModel, RoleAttributes } from '../models/role.model.js';

/**
 * Repositorio de Roles, maneja las interacciones con la base de datos.
 */
export class RoleRepository {

    /**
     * Obtiene todos los roles.
     */
    public static async getAll(): Promise<RoleAttributes[]> {
        const roles = await RoleModel.findAll();
        // Mapeamos a objetos planos para limpieza
        return roles.map(role => role.get({ plain: true }));
    }
}