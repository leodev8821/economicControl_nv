import { createNewOutcome, getOutcomesByCash, getAllOutcomes, getOneOutcome, updateOneOutcome, deleteOutcome} from '../models/outcome.model.js';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

export default {
    allOutcomes: async (req, res) => {
        try {
            const outcomes = await getAllOutcomes();

            if (!outcomes || outcomes.length === 0) {
                return res.status(404).json({ ok: false, message: 'No autorizado para mostrar egresos' });
            }

            res.status(200).json({
                ok: true,
                message: 'Egresos obtenidos correctamente.',
                data: outcomes,
            });

        } catch (error) {
            console.error('Error en allOutcomes:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en allOutcomes', 
                error: error.message
            });
        }
    },
    outcomesByCash: async (req, res) => {
        try {
            const { cash_id } = req.params;
            if (!cash_id) {
                return res.status(400).json({ ok: false, message: 'Falta el ID de la caja' });
            }

            const outcomes = await getOutcomesByCash(cash_id);

            if (!outcomes || outcomes.length === 0) {
                return res.status(404).json({ ok: false, message: 'No se encontraron egresos para esta caja' });
            }

            res.status(200).json({
                ok: true,
                message: 'Egresos obtenidos correctamente.',
                data: outcomes,
            });

        } catch (error) {
            console.error('Error en outcomesByCash:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en outcomesByCash', 
                error: error.message
            });
        }
    },
    oneOutcome: async (req, res) => {
        try {
            const { id } = req.params;
            const outcome = await getOneOutcome(id);

            if (!outcome) {
                return res.status(404).json({ ok: false, message: 'Egreso no encontrado' });
            }       
            res.status(200).json({
                ok: true,
                message: 'Egreso obtenido correctamente.',
                data: outcome,
            });

        } catch (error) {
            console.error('Error en oneOutcome:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en oneOutcome',
                error: error.message
            });
        }
    },
    createOutcome: async (req, res) => {
        try {
            const { cash_id, week_id, date, amount, description, category } = req.body;
            // Validar que todos los campos requeridos estén presentes y no sean undefined/null/vacíos
            if (!cash_id || !week_id || !date || !amount || !description || !category) {
                return res.status(400).json({ ok: false, message: 'Faltan datos obligatorios para crear el egreso' });
            }

            const outcomeData = { cash_id, week_id, date, amount, description, category };
            const newOutcome = await createNewOutcome(outcomeData);

            res.status(201).json({
                ok: true,
                message: 'Egreso creado correctamente.',
                data: newOutcome,
            });

        } catch (error) {
            console.error('Error en createOutcome:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en createOutcome', 
                error: error.message
            });
        }
    },
    updateOutcome: async (req, res) => {
        try {
            const { id } = req.params;
            const { cash_id, week_id, date, amount, description, category } = req.body;
            const data = {};
            if (cash_id !== undefined) data.cash_id = cash_id;
            if (week_id !== undefined) data.week_id = week_id;
            if (date !== undefined) data.date = date;
            if (amount !== undefined) data.amount = amount;
            if (description !== undefined) data.description = description;
            if (category !== undefined) data.category = category;

            if (Object.keys(data).length === 0) {
                return res.status(400).json({ ok: false, message: 'No se proporcionaron datos para actualizar el egreso' });
            }

            const updatedOutcome = await updateOneOutcome(id, data);

            if (!updatedOutcome) {
                return res.status(404).json({ ok: false, message: 'Egreso no encontrado o sin cambios' });
            }

            res.status(200).json({
                ok: true,
                message: 'Egreso actualizado correctamente.',
                data: updatedOutcome,
            });

        } catch (error) {
            console.error('Error en updateOutcome:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en updateOutcome', 
                error: error.message
            });
        }
    },
    deleteOutcome: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await deleteOutcome(id);

            if (!deleted) {
                return res.status(404).json({ ok: false, message: 'Egreso no encontrado' });
            }

            res.status(200).json({
                ok: true,
                message: 'Egreso eliminado correctamente.',
            });

        } catch (error) {
            console.error('Error en deleteOutcome:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en deleteOutcome', 
                error: error.message
            });
        }
    }
}