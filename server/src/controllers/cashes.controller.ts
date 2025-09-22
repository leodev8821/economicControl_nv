import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
    createNewCash,
    getAllCash,
    getOneCash,
    updateOneCash,
    deleteCash,
    CashAttributes,
    CashCreationAttributes,
    CashUpdateFields,
} from '../models/cash.model';

// Definición de tipos para las solicitudes y respuestas
interface CustomRequest extends Request {
    body: {
        name: string;
        actual_amount: number;
        pettyCash_limit?: number | null;
    };
    params: {
        id?: string;
        name?: string;
    };
}

interface AllCashResponse {
    cash: string;
    id: number;
    name: string;
    actual_amount: number;
    pettyCash_limit: number | null;
}

interface OneCashResponse {
    id: number;
    name: string;
    actual_amount: number;
    pettyCash_limit: number | null;
}

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

export default {
    createCash: async (req: CustomRequest, res: Response) => {
        try {
            const { name, actual_amount, pettyCash_limit } = req.body;

            if (!name || actual_amount === undefined) {
                return res.status(400).json({
                    ok: false,
                    message: 'Faltan datos obligatorios: name y actual_amount son requeridos.'
                });
            }

            const cashData: CashCreationAttributes = { name, actual_amount, pettyCash_limit };
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
                data: {
                    name: newCash.name,
                    actual_amount: parseFloat(newCash.actual_amount.toString()),
                    pettyCash_limit: newCash.pettyCash_limit !== null ? parseFloat(newCash.pettyCash_limit.toString()) : null
                },
            });

        } catch (error: any) {
            console.error('Error en newCash:', error.message);
            res.status(500).json({
                ok: false,
                message: 'Error en newCash',
                error: error.message
            });
        }
    },

    allCash: async (req: Request, res: Response) => {
        try {
            const cashes = await getAllCash();

            if (!cashes || cashes.length === 0) {
                return res.status(404).json({ ok: false, message: 'No se encontraron cajas.' });
            }

            const formattedResponse: AllCashResponse[] = cashes.map((cash, i) => ({
                cash: `Caja ${i + 1}`,
                id: cash.id,
                name: cash.name,
                actual_amount: parseFloat(cash.actual_amount.toString()),
                pettyCash_limit: cash.pettyCash_limit !== null ? parseFloat(cash.pettyCash_limit.toString()) : null
            }));

            res.status(200).json({
                ok: true,
                message: 'Cajas obtenidas correctamente.',
                data: formattedResponse,
            });

        } catch (error: any) {
            console.error('Error en allCash:', error.message);
            res.status(500).json({
                ok: false,
                message: 'Error en allCash',
                error: error.message
            });
        }
    },

    oneCash: async (req: CustomRequest, res: Response) => {
        try {
            const { id, name } = req.params;

            if (!id && !name) {
                return res.status(400).json({
                    ok: false,
                    message: 'Falta el parámetro id o name en la URL.'
                });
            }

            const cashData: { id?: number; name?: string } = {};
            if (id) cashData.id = Number(id);
            if (name) cashData.name = name;

            const cash = await getOneCash(cashData);

            if (!cash) {
                return res.status(404).json({
                    ok: false,
                    message: 'No se encontró la caja con los parámetros proporcionados.'
                });
            }

            const formattedCash: OneCashResponse = {
                id: cash.id,
                name: cash.name,
                actual_amount: parseFloat(cash.actual_amount.toString()),
                pettyCash_limit: cash.pettyCash_limit !== null ? parseFloat(cash.pettyCash_limit.toString()) : null
            };

            res.status(200).json({
                ok: true,
                message: 'Caja obtenida correctamente.',
                data: formattedCash,
            });

        } catch (error: any) {
            console.error('Error en oneCash:', error.message);
            res.status(500).json({
                ok: false,
                message: 'Error en oneCash',
                error: error.message
            });
        }
    },

    updateCash: async (req: CustomRequest, res: Response) => {
        try {
            const { id } = req.params;
            const { name, actual_amount, pettyCash_limit } = req.body;

            if (!id) {
                return res.status(400).json({
                    ok: false,
                    message: 'Falta el parámetro id en la URL.'
                });
            }

            const cashId = Number(id);

            if (!name && actual_amount === undefined && pettyCash_limit === undefined) {
                return res.status(400).json({
                    ok: false,
                    message: 'Al menos un campo (name, actual_amount, pettyCash_limit) debe ser proporcionado para actualizar.'
                });
            }

            const cashData: Partial<CashAttributes> = {};
            if (name) cashData.name = name;
            if (actual_amount !== undefined) cashData.actual_amount = actual_amount;
            if (pettyCash_limit !== undefined) cashData.pettyCash_limit = pettyCash_limit;

            // La llamada ahora es más simple y clara
            const updatedCash = await updateOneCash(cashId, cashData);

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

        } catch (error: any) {
            console.error('Error en editCash:', error.message);
            res.status(500).json({
                ok: false,
                message: 'Error en editCash',
                error: error.message
            });
        }
    },

    deleteCash: async (req: CustomRequest, res: Response) => {
        try {
            const { id, name } = req.params;

            if (!id && !name) {
                return res.status(400).json({
                    ok: false,
                    message: 'Falta el parámetro id o name en la URL.'
                });
            }

            const cashData: { id?: number; name?: string } = {};
            if (id) cashData.id = Number(id);
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

        } catch (error: any) {
            console.error('Error en removeCash:', error.message);
            res.status(500).json({
                ok: false,
                message: 'Error en removeCash',
                error: error.message
            });
        }
    }
};