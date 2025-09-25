import { OutcomeModel, OutcomeAttributes, OutcomeCreationAttributes } from '../models/outcome.model';

// Tipos para las operaciones
type CreateOutcomeData = OutcomeCreationAttributes;
type UpdateOutcomeData = Partial<OutcomeCreationAttributes>;

/**
 * Repositorio de Egresos, maneja las interacciones con la base de datos.
 */
export class OutcomeRepository {

    /**
     * Obtiene todos los egresos.
     */
    public static async getAllOutcomes(): Promise<OutcomeAttributes[]> {
        const outcomes = await OutcomeModel.findAll();
        return outcomes.map(outcome => outcome.get({ plain: true }));
    }

    /**
     * Obtiene un egreso por ID.
     */
    public static async getOneOutcome(id: number): Promise<OutcomeAttributes | null> {
        const outcome = await OutcomeModel.findByPk(id);
        return outcome ? outcome.get({ plain: true }) : null;
    }

    /**
     * Obtiene todos los egresos asociados a una caja (cash_id).
     */
    public static async getOutcomesByCashId(cashId: number): Promise<OutcomeAttributes[]> {
        const outcomes = await OutcomeModel.findAll({ where: { cash_id: cashId } });
        return outcomes.map(outcome => outcome.get({ plain: true }));
    }

    /**
     * Obtiene todos los egresos para una fecha específica.
     */
    public static async getOutcomesByDate(date: string): Promise<OutcomeAttributes[]> {
        const outcomes = await OutcomeModel.findAll({ where: { date } });
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
        const updatedOutcome = await OutcomeModel.findByPk(id);
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
        const outcomes = await OutcomeModel.findAll({ where: { week_id: weekId } });
        return outcomes.map(outcome => outcome.get({ plain: true }));
    }
}
