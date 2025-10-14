// repositories/user.repository.ts
import { UserModel, UserAttributes, UserCreationAttributes } from '../models/user.model';
import { Op } from 'sequelize';

// Tipos auxiliares
type CreateUserData = UserCreationAttributes;
type UpdateUserData = Partial<UserAttributes>;

/**
 * Repositorio de Usuarios, maneja las interacciones con la base de datos.
 */
export class UserRepository {

    /**
     * Obtiene todos los usuarios (visibles e invisibles).
     */
    public static async getAll(): Promise<UserAttributes[]> {
        const users = await UserModel.findAll();
        return users.map(user => user.get({ plain: true }));
    }
    
    /**
     * Obtiene un usuario por ID o username. Devuelve la INSTANCIA del modelo.
     * Esta función es para uso interno (ej. Login/Update) donde se necesitan métodos
     * de instancia (raw: false) y puede buscar usuarios invisibles.
     * * @param identifier ID o username del usuario.
     * @returns Instancia de UserModel o null.
     */
    public static async getOneInstanceByIdentifier(identifier: string | number): Promise<UserModel | null> {
        const searchValue = typeof identifier === "string" ? identifier.trim() : identifier;

        const whereClause = [];
        if (typeof searchValue === "number") {
            whereClause.push({ id: searchValue });
        }
        if (typeof searchValue === "string") {
            whereClause.push({ username: searchValue });
        }

        const userInstance = await UserModel.findOne({
            where: {
                [Op.or]: whereClause,
            },
            raw: false // CLAVE: Devuelve la instancia con sus métodos (como comparePassword)
        });

        return userInstance;
    }
    
    /**
     * Obtiene un usuario por ID o username, devolviendo un objeto plano.
     * Esta función es para uso general donde solo se necesitan los datos.
     * * @param identifier ID o username del usuario.
     * @returns Objeto plano UserAttributes o null.
     */
    public static async getOnePlainByIdentifier(identifier: string | number): Promise<UserAttributes | null> {
        const userInstance = await this.getOneInstanceByIdentifier(identifier);
        return userInstance ? userInstance.get({ plain: true }) : null;
    }

    /**
     * Obtiene un usuario por ID o username (SOLO VISIBLES).
     */
    public static async getVisibleOneByIdentifier(identifier: string | number): Promise<UserAttributes | null> {
        const searchValue = typeof identifier === "string" ? identifier.trim() : identifier;

        const whereClause = [];
        if (typeof searchValue === "number") {
            whereClause.push({ id: searchValue });
        }
        if (typeof searchValue === "string") {
            whereClause.push({ username: searchValue });
        }
        
        const user = await UserModel.findOne({
            where: {
                [Op.and]: [{ isVisible: true }],
                [Op.or]: whereClause,
            },
            raw: true // Podemos usar raw: true aquí ya que no necesitamos métodos de instancia
        });
        return user ? user as UserAttributes : null;
    }

    /**
     * Crea un nuevo usuario.
     */
    public static async create(data: CreateUserData): Promise<UserAttributes> {
        const newUser = await UserModel.create(data);
        return newUser.get({ plain: true });
    }

    /**
     * Actualiza un usuario.
     */
    public static async update(identifier: { id?: number, username?: string }, data: UpdateUserData): Promise<UserAttributes | null> {
        const [affectedRows] = await UserModel.update(data, { where: identifier });
        if (affectedRows === 0) {
            return null;
        }
        // Devolvemos el objeto actualizado
        // Usamos getOnePlainByIdentifier ya que no necesitamos la instancia para retornar.
        const updatedUser = await UserRepository.getOnePlainByIdentifier(identifier.id || identifier.username!); 
        return updatedUser;
    }

    /**
     * Elimina lógicamente (soft delete) un usuario.
     */
    public static async softDelete(identifier: string | number): Promise<UserAttributes | null> {
        const searchValue = typeof identifier === "string" ? identifier.trim() : identifier;
        
        const userInstance = await UserRepository.getOneInstanceByIdentifier(searchValue);
        
        if (!userInstance) return null;

        // Soft delete
        userInstance.isVisible = false;
        await userInstance.save();

        return userInstance.get({ plain: true }) as UserAttributes;
    }
}