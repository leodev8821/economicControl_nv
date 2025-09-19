import { createNewCash, getAllCash, getOneCash, updateOneCash, deleteCash } from "../models/cash.model.js";
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

export default {
    createCash: async (req, res) => {
        try {
            const { name, actual_amount, pettyCash_limit } = req.body;
            
            if (!name || actual_amount === undefined) {
                return res.status(400).json({ 
                    ok: false, 
                    message: 'Faltan datos obligatorios: name y actual_amount son requeridos.' 
                });
            }

            const cashData = { name, actual_amount, pettyCash_limit };
            const newCash = await createNewCash(cashData);

            if (!newCash) {
                return res.status(409).json({ 
                    ok: false, 
                    message: 'Ya existe una caja con el mismo nombre.' 
                });
            }

            res.status(201).json({
                ok: true,
                message: 'Caja creada correctamente.',
                data: newCash,
            });

        } catch (error) {
            console.error('Error en newCash:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en newCash', 
                error: error.message
            });
        }
    }, 

    allCash: async (req, res) => {
        try {
            const cashes = await getAllCash();

            if (!cashes || cashes.length === 0) {
                return res.status(404).json({ ok: false, message: 'No autorizado para mostrar cajas' });
            }

            const formattedResponse = cashes.map((cash, i) => ({
                cash: `Caja ${i + 1}`,
                id: cash.id,
                name: cash.name,
                actual_amount: parseFloat(cash.actual_amount),
                pettyCash_limit: cash.pettyCash_limit !== null ? parseFloat(cash.pettyCash_limit) : null
            }));

            res.status(200).json({
                ok: true,
                message: 'Cajas obtenidas correctamente.',
                data: formattedResponse,
            });

        } catch (error) {
            console.error('Error en allCash:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en allCash', 
                error: error.message
            });
        }
    },

    oneCash: async (req, res) => {
        try {
            const { id, name } = req.params;

            if (!id && !name) {
                return res.status(400).json({ 
                    ok: false, 
                    message: 'Falta el parámetro id o name en la URL.' 
                });
            }

            const cashData = {};
            if (id) cashData.id = id;
            if (name) cashData.name = name;

            const cash = await getOneCash(cashData);

            if (!cash) {
                return res.status(404).json({ 
                    ok: false, 
                    message: 'No se encontró la caja con los parámetros proporcionados.' 
                });
            }

            const formattedCash = {
                id: cash.id,
                name: cash.name,
                actual_amount: parseFloat(cash.actual_amount),
                pettyCash_limit: cash.pettyCash_limit !== null ? parseFloat(cash.pettyCash_limit) : null
            };

            res.status(200).json({
                ok: true,
                message: 'Caja obtenida correctamente.',
                data: formattedCash,
            });

        } catch (error) {
            console.error('Error en oneCash:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en oneCash', 
                error: error.message
            });
        }
    },

    updateCash: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, actual_amount, pettyCash_limit } = req.body;

            if (!id) {
                return res.status(400).json({ 
                    ok: false, 
                    message: 'Falta el parámetro id en la URL.' 
                });
            }

            if (!name && actual_amount === undefined && pettyCash_limit === undefined) {
                return res.status(400).json({ 
                    ok: false, 
                    message: 'Al menos un campo (name, actual_amount, pettyCash_limit) debe ser proporcionado para actualizar.' 
                });
            }

            const cashData = {};
            if (name) cashData.name = name;
            if (actual_amount !== undefined) cashData.actual_amount = actual_amount;
            if (pettyCash_limit !== undefined) cashData.pettyCash_limit = pettyCash_limit;

            const updatedCash = await updateOneCash(['id'], { id, ...cashData });

            if (!updatedCash) {
                return res.status(404).json({ 
                    ok: false, 
                    message: 'No se encontró la caja con el ID proporcionado.' 
                });
            }

            res.status(200).json({
                ok: true,
                message: 'Caja actualizada correctamente.',
                data: updatedCash,
            });

        } catch (error) {
            console.error('Error en editCash:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en editCash', 
                error: error.message
            });
        }
    },

    deleteCash: async (req, res) => {
        try {
            const { id, name } = req.params;

            if (!id && !name) {
                return res.status(400).json({ 
                    ok: false, 
                    message: 'Falta el parámetro id o name en la URL.' 
                });
            }

            const cashData = {};
            if (id) cashData.id = id;
            if (name) cashData.name = name;

            const deletedCash = await deleteCash(cashData);

            if (!deletedCash) {
                return res.status(404).json({ 
                    ok: false, 
                    message: 'No se encontró la caja con los parámetros proporcionados.' 
                });
            }

            res.status(200).json({
                ok: true,
                message: 'Caja eliminada correctamente.',
                data: deletedCash,
            });

        } catch (error) {
            console.error('Error en removeCash:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en removeCash', 
                error: error.message
            });
        }
    }
}