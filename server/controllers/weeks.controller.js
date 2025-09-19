import { getIncomesByWeek, getOutcomesByWeek } from '../models/week.model.js';
import generateWeeksForYear from '../utils/week.util.js';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

export default {
    getWeekData: async (req, res) => {
        const { weekId } = req.params;

        try {
            const incomes = await getIncomesByWeek(weekId);
            const outcomes = await getOutcomesByWeek(weekId);

            const formattedIncomes = incomes.map(income => ({
                id: income.id,
                description: income.description,
                amount: parseFloat(income.amount),
                date: income.date,
                person_id: income.person_id,
                week_id: income.week_id,
                created_at: income.created_at,
                updated_at: income.updated_at
            }));

            const formattedOutcomes = outcomes.map(outcome => ({
                id: outcome.id,
                description: outcome.description,
                amount: parseFloat(outcome.amount),
                date: outcome.date,
                person_id: outcome.person_id,
                week_id: outcome.week_id,
                created_at: outcome.created_at,
                updated_at: outcome.updated_at
            }));

            res.status(200).json({
                ok: true,
                message: 'Datos de la semana obtenidos correctamente.',
                data: {
                    incomes: formattedIncomes,
                    outcomes: formattedOutcomes
                },
            });
        } catch (error) {
            console.error('Error en getWeekData:', error.message);
            res.status(500).json({
                ok: false,
                message: 'Error al obtener los datos de la semana.',
                error: error.message
            });
        }
    },

    generateWeeks: async (req, res) => {
        try {
            const { year } = req.params;
            const yearInt = parseInt(year, 10);
            if (isNaN(yearInt) || yearInt < 1970 || yearInt > 2100) {
                return res.status(400).json({
                    ok: false,
                    message: 'Año inválido. Por favor, proporciona un año entre 1970 y 2100.'
                });
            }

            await generateWeeksForYear(yearInt);

            res.status(201).json({
                ok: true,
                message: `Semanas para el año ${year} generadas correctamente.`,
            });
        } catch (error) {
            console.error('Error en generateWeeks:', error.message);
            res.status(500).json({
                ok: false,
                message: 'Error al generar las semanas.',
                error: error.message
            });
        }
    }
}