import { IncomeModel, IncomeAttributes, IncomeCreationAttributes, IncomeSource } from '../models/income.model';
import { PersonModel } from '../models/person.model';
import { WeekModel } from '../models/week.model';
import { BaseError, ForeignKeyConstraintError } from 'sequelize';

// Tipos para las operaciones
type CreateIncomeData = IncomeCreationAttributes;
type UpdateIncomeData = Partial<IncomeCreationAttributes>;

// 💡 Constante para la configuración de inclusión (JOINs)
const INCOME_INCLUDE_CONFIG = [
    {
        model: PersonModel, 
        as: 'Person',
        attributes: ['id', 'dni', 'first_name', 'last_name'],
        required: false,
    },
    {
        model: WeekModel, 
        as: 'Week',
        attributes: ['id', 'week_start', 'week_end'],
        required: true,
    }
];

/**
 * Repositorio de Ingresos, maneja las interacciones con la base de datos.
 */
export class IncomeRepository {

    /**
     * Obtiene todos los ingresos.
     */
    public static async getAllIncomes(): Promise<IncomeAttributes[]> {
        const incomes = await IncomeModel.findAll({
            include: INCOME_INCLUDE_CONFIG,
        });
        return incomes.map(income => income.get({ plain: true }));
    }

    /**
     * Obtiene un ingreso por ID.
     */
    public static async getOneIncome(id: number): Promise<IncomeAttributes | null> {
        const income = await IncomeModel.findByPk(id, {
            include: INCOME_INCLUDE_CONFIG,
        });
        return income ? income.get({ plain: true }) : null;
    }

    /**
     * Crea un nuevo ingreso.
     */
    public static async createNewIncome(data: CreateIncomeData): Promise<IncomeAttributes> {
        try {
            const newIncome = await IncomeModel.create(data);
            return newIncome.get({ plain: true });
        } catch (error: unknown) {
            // 💡 Capturar específicamente el error de clave foránea
            if (error instanceof ForeignKeyConstraintError) {
                // Analizar qué clave falló (person_id, week_id, etc.)
                const key = error.fields ? error.fields[0] : 'relación';
                
                // Relanzar un error de negocio claro que el servicio pueda entender.
                throw new Error(`El valor proporcionado para ${key} no existe en la tabla de referencia. Por favor, verifique el ID.`);
            }
            // Si no es un FK error, lanzar el error original.
            throw error; 
        }
    }

    /**
     * Actualiza un ingreso por ID.
     */
    public static async updateOneIncome(id: number, data: UpdateIncomeData): Promise<IncomeAttributes | null> {
        try {
            const [affectedRows] = await IncomeModel.update(data, { where: { id } });
            if (affectedRows === 0) {
                return null;
            }
            const updatedIncome = await IncomeModel.findByPk(id);
            return updatedIncome ? updatedIncome.get({ plain: true }) : null;
        } catch (error: unknown) {
            // 💡 Manejo de errores FK también en actualización
            if (error instanceof ForeignKeyConstraintError) {
                const key = error.fields ? error.fields[0] : 'relación';
                throw new Error(`El valor proporcionado para ${key} no existe en la tabla de referencia. Por favor, verifique el ID.`);
            }
            throw error;
        }
    }

    /**
     * Elimina un ingreso por ID.
     */
    public static async deleteIncome(id: number): Promise<boolean> {
        const affectedRows = await IncomeModel.destroy({ where: { id } });
        return affectedRows > 0;
    }

    /**
     * Obtiene ingresos de tipo 'Diezmo' para una persona por su DNI.
     */
    public static async getTitheIncomesByDni(dni: string): Promise<IncomeAttributes[]> {
        const person = await PersonModel.findOne(
            { 
                where: { dni },
                include: INCOME_INCLUDE_CONFIG,
            }
    );
        if (!person) {
            return [];
        }
        const incomes = await IncomeModel.findAll({
            where: {
                person_id: person.id,
                source: IncomeSource.DIEZMO
            },
            include: INCOME_INCLUDE_CONFIG,
        });
        return incomes.map(income => income.get({ plain: true }));
    }

    /**
     * Obtiene todos los ingresos para una fecha específica.
     */
    public static async getIncomesByDate(date: string): Promise<IncomeAttributes[]> {
        const incomes = await IncomeModel.findAll(
            { 
                where: { date },
                include: INCOME_INCLUDE_CONFIG,
            }
        );
        return incomes.map(income => income.get({ plain: true }));
    }

    /**
     * Obtiene todos los ingresos para un ID de semana específico. ⬅️ NUEVA FUNCIÓN
     */
    public static async getIncomesByWeekId(weekId: number): Promise<IncomeAttributes[]> {
        const incomes = await IncomeModel.findAll(
            { 
                where: { week_id: weekId },
                include: INCOME_INCLUDE_CONFIG,
            }
    );
        return incomes.map(income => income.get({ plain: true }));
    }
}