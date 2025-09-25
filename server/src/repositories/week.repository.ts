import { WeekModel, WeekAttributes, WeekCreationAttributes } from '../models/week.model';
import { Op } from 'sequelize';

// Tipos auxiliares
type CreateWeekData = WeekCreationAttributes;
type UpdateWeekData = Partial<WeekAttributes>;

/**
 * Repositorio de Semanas, maneja las interacciones con la base de datos.
 */
export class WeekRepository {

    /**
     * Obtiene todas las semanas.
     */
    public static async getAll(): Promise<WeekAttributes[]> {
        const weeks = await WeekModel.findAll();
        return weeks.map(w => w.get({ plain: true }));
    }

    /**
     * Obtiene una semana por ID.
     */
    public static async getOneById(id: number): Promise<WeekAttributes | null> {
        const week = await WeekModel.findByPk(id);
        return week ? week.get({ plain: true }) : null;
    }

    /**
     * Obtiene una semana por su fecha de inicio o fin.
     */
    public static async getOneByDate(date: string): Promise<WeekAttributes | null> {
        const week = await WeekModel.findOne({
            where: {
                [Op.or]: [{ week_start: date }, { week_end: date }]
            }
        });
        return week ? week.get({ plain: true }) : null;
    }
    
    /**
     * Obtiene semanas para un año específico.
     */
    public static async getByYear(year: number): Promise<WeekAttributes[]> {
        const weeks = await WeekModel.findAll({
            where: {
                week_start: {
                    [Op.between]: [`${year}-01-01`, `${year}-12-31`]
                }
            }
        });
        return weeks.map(w => w.get({ plain: true }));
    }

    /**
     * Crea una nueva semana.
     */
    public static async create(data: CreateWeekData): Promise<WeekAttributes> {
        const newWeek = await WeekModel.create(data);
        return newWeek.get({ plain: true });
    }
    
    /**
     * Crea múltiples semanas.
     */
    public static async bulkCreate(data: CreateWeekData[]): Promise<WeekAttributes[]> {
        const newWeeks = await WeekModel.bulkCreate(data, { ignoreDuplicates: true });
        return newWeeks.map(w => w.get({ plain: true }));
    }

    /**
     * Actualiza una semana por ID.
     */
    public static async update(id: number, data: UpdateWeekData): Promise<WeekAttributes | null> {
        const [affectedRows] = await WeekModel.update(data, { where: { id } });
        if (affectedRows === 0) {
            return null;
        }
        const updatedWeek = await WeekModel.findByPk(id);
        return updatedWeek ? updatedWeek.get({ plain: true }) : null;
    }

    /**
     * Elimina una semana por ID.
     */
    public static async delete(id: number): Promise<boolean> {
        const affectedRows = await WeekModel.destroy({ where: { id } });
        return affectedRows > 0;
    }
}