import { OutcomeModel, OutcomeAttributes, OutcomeCreationAttributes } from '../models/outcome.model';
import { CashModel } from '../models/cash.model';
import { WeekModel } from '../models/week.model';

// Tipos para las operaciones
type CreateOutcomeData = OutcomeCreationAttributes;
type UpdateOutcomeData = Partial<OutcomeCreationAttributes>;

// 💡 Constante para la configuración de inclusión (JOINs)
const OUTCOME_INCLUDE_CONFIG = [
    {
        model: CashModel, 
        as: 'Cash',
        attributes: ['id', 'name', 'actual_amount', 'pettyCash_limit'],
        required: true,
    },
    {
        model: WeekModel, 
        as: 'Week',
        attributes: ['id', 'week_start', 'week_end'],
        required: true,
    }
];

/**
 * Repositorio de Egresos, maneja las interacciones con la base de datos.
 */
export class OutcomeRepository {

    /**
     * Obtiene todos los egresos.
     */
    public static async getAllOutcomes(): Promise<OutcomeAttributes[]> {
        const outcomes = await OutcomeModel.findAll({
            include: OUTCOME_INCLUDE_CONFIG,
        });
        return outcomes.map(outcome => outcome.get({ plain: true }));
    }

    /**
     * Obtiene un egreso por ID.
     */
    public static async getOneOutcome(id: number): Promise<OutcomeAttributes | null> {
        const outcome = await OutcomeModel.findByPk(id, {
            include: OUTCOME_INCLUDE_CONFIG,
        });
        return outcome ? outcome.get({ plain: true }) : null;
    }

    /**
     * Obtiene todos los egresos asociados a una caja (cash_id).
     */
    public static async getOutcomesByCashId(cashId: number): Promise<OutcomeAttributes[]> {
        const outcomes = await OutcomeModel.findAll({ 
            where: { cash_id: cashId },
            include: OUTCOME_INCLUDE_CONFIG,
        });
        return outcomes.map(outcome => outcome.get({ plain: true }));
    }

    /**
     * Obtiene todos los egresos para una fecha específica.
     */
    public static async getOutcomesByDate(date: string): Promise<OutcomeAttributes[]> {
        const outcomes = await OutcomeModel.findAll({ 
            where: { date },
            include: OUTCOME_INCLUDE_CONFIG,
        });
        return outcomes.map(outcome => outcome.get({ plain: true }));
    }

    /**
     * Crea un nuevo egreso.
     */
    public static async createNewOutcome(data: CreateOutcomeData): Promise<OutcomeAttributes> {
        const newOutcome = await OutcomeModel.create(data);
        return newOutcome.get({ plain: true });
    }

    /**
     * Actualiza un egreso por ID.
     */
    public static async updateOneOutcome(id: number, data: UpdateOutcomeData): Promise<OutcomeAttributes | null> {
        const [affectedRows] = await OutcomeModel.update(data, { where: { id } });
        if (affectedRows === 0) {
            return null;
        }
        const updatedOutcome = await OutcomeModel.findByPk(id, {
            include: OUTCOME_INCLUDE_CONFIG,
        });
        return updatedOutcome ? updatedOutcome.get({ plain: true }) : null;
    }

    /**
     * Elimina un egreso por ID.
     */
    public static async deleteOutcome(id: number): Promise<boolean> {
        const affectedRows = await OutcomeModel.destroy({ where: { id } });
        return affectedRows > 0;
    }

    /**
     * Obtiene todos los egresos para un ID de semana específico.
     */
    public static async getOutcomesByWeekId(weekId: number): Promise<OutcomeAttributes[]> {
        const outcomes = await OutcomeModel.findAll({ 
            where: { week_id: weekId },
            include: OUTCOME_INCLUDE_CONFIG,
        });
        return outcomes.map(outcome => outcome.get({ plain: true }));
    }
}
