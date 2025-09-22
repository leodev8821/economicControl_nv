import { getTitheIncomesByPerson, createNewIncome, getAllIncomes, getOneIncome, updateOneIncome, deleteIncome } from "../models/income.model.js";
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

export default {
    allIncomes: async (req, res) => {
        try {
            const incomes = await getAllIncomes();

            if (!incomes || incomes.length === 0) {
                return res.status(404).json({ ok: false, message: 'No autorizado para mostrar ingresos' });
            }

            res.status(200).json({
                ok: true,
                message: 'Ingresos obtenidos correctamente.',
                data: incomes,
            });

        } catch (error) {
            console.error('Error en allIncomes:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en allIncomes', 
                error: error.message
            });
        }
    },
    titheByPerson: async (req, res) => {
        try {
            const { dni } = req.params;
            if (!dni) {
                return res.status(400).json({ ok: false, message: 'Falta el DNI de la persona' });
            }

            const incomes = await getTitheIncomesByPerson(dni);

            if (!incomes || incomes.length === 0) {
                return res.status(404).json({ ok: false, message: 'No se encontraron ingresos de diezmo para esta persona' });
            }

            res.status(200).json({
                ok: true,
                message: 'Ingresos de diezmo obtenidos correctamente.',
                data: incomes,
            });

        } catch (error) {
            console.error('Error en titheByPerson:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en titheByPerson', 
                error: error.message
            });
        }
    },
    createIncome: async (req, res) => {
        try {
            const { amount, source, person_id, week_id, date } = req.body;

            if (!amount || !source || !person_id || !week_id || !date) {
                return res.status(400).json({ ok: false, message: 'Faltan datos obligatorios para crear el ingreso' });
            }

            const newIncome = await createNewIncome({ amount, source, person_id, week_id, date });

            res.status(201).json({
                ok: true,
                message: 'Ingreso creado correctamente.',
                data: newIncome,
            });

        } catch (error) {
            console.error('Error en createIncome:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en createIncome', 
                error: error.message
            });
        }
    },
    oneIncome: async (req, res) => {
        try {
            const { id } = req.params;
            const income = await getOneIncome(id);

            if (!income) {
                return res.status(404).json({ ok: false, message: 'Ingreso no encontrado' });
            }       
            res.status(200).json({
                ok: true,
                message: 'Ingreso obtenido correctamente.',
                data: income,
            });

        } catch (error) {
            console.error('Error en oneIncome:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en oneIncome', 
                error: error.message
            });
        }
    },
    updateIncome: async (req, res) => {
        try {
            const { id } = req.params;
            const { amount, source, person_id, week_id, date } = req.body;
            const data = {};
            if (amount !== undefined) data.amount = amount;
            if (source !== undefined) data.source = source;
            if (person_id !== undefined) data.person_id = person_id;
            if (week_id !== undefined) data.week_id = week_id;
            if (date !== undefined) data.date = date;

            if (Object.keys(data).length === 0) {
                return res.status(400).json({ ok: false, message: 'No se proporcionaron datos para actualizar el ingreso' });
            }

            const updatedIncome = await updateOneIncome(id, data);

            if (!updatedIncome) {
                return res.status(404).json({ ok: false, message: 'Ingreso no encontrado o sin cambios' });
            }

            res.status(200).json({
                ok: true,
                message: 'Ingreso actualizado correctamente.',
                data: updatedIncome,
            });

        } catch (error) {
            console.error('Error en updateIncome:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en updateIncome', 
                error: error.message
            });
        }
    },
    deleteIncome: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await deleteIncome(id);

            if (!deleted) {
                return res.status(404).json({ ok: false, message: 'Ingreso no encontrado' });
            }

            res.status(200).json({
                ok: true,
                message: 'Ingreso eliminado correctamente.',
            });

        } catch (error) {
            console.error('Error en deleteIncome:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en deleteIncome', 
                error: error.message
            });
        }
    }
}