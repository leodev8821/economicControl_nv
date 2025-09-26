import { Request, Response } from 'express';
import { IncomeService } from '../services/income.service';

/**
 * Función genérica para manejar errores en los controladores.
 * Los errores de validación (400) o de negocio ya vienen del servicio.
 */
const handleControllerError = (res: Response, error: unknown) => {
    // Si el error tiene un mensaje, se asume que es un error de negocio o validación.
    // Ej. 'ID inválido', 'Faltan datos obligatorios'.
    if (error instanceof Error) {
        if (error.message.includes('inválido') || error.message.includes('obligatorio') || error.message.includes('vacío') || error.message.includes('no existe')) {
            return res.status(400).json({ ok: false, message: error.message });
        }
        // Si el error es de tipo 'no encontrado', enviamos un 404
        if (error.message.includes('No se encontraron') || error.message.includes('no encontrado')) {
             return res.status(404).json({ ok: false, message: error.message });
        }
        // Para cualquier otro error (del servidor o BD)
        console.error('Error en el controlador:', error.message);
        return res.status(500).json({
            ok: false,
            message: 'Error interno del servidor.',
            error: error.message
        });
    }
    // Para errores desconocidos
    return res.status(500).json({
        ok: false,
        message: 'Error interno del servidor.',
        error: 'Error desconocido'
    });
};

/**
 * Obtiene todos los ingresos
 */
export const allIncomes = async (req: Request, res: Response) => {
    try {
        const incomes = await IncomeService.getAll();
        
        // Si no hay ingresos, el servicio ya nos devuelve un array vacío,
        // por lo que el controlador puede manejar el 404 aquí.
        if (incomes.length === 0) {
            return res.status(404).json({ 
                ok: false, 
                message: 'No se encontraron ingresos.' 
            });
        }
        
        res.status(200).json({
            ok: true,
            message: 'Ingresos obtenidos correctamente.',
            data: incomes,
        });
    } catch (error) {
        return handleControllerError(res, error);
    }
};

/**
 * Obtiene un ingreso por ID
 */
export const oneIncome = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Validar la existencia del parámetro
        if (!id) {
            throw new Error('Falta el ID del ingreso en los parámetros de la URL.');
        }

        const numericId = parseInt(id, 10);
        
        // El servicio se encarga de validar si el ID es un número positivo
        const income = await IncomeService.getOneById(numericId);
        
        if (!income) {
            return res.status(404).json({ 
                ok: false, 
                message: `Ingreso con ID ${id} no encontrado.`
            });
        }
        
        res.status(200).json({
            ok: true,
            message: 'Ingreso obtenido correctamente.',
            data: income,
        });
    } catch (error) {
        return handleControllerError(res, error);
    }
};

/**
 * Obtiene ingresos de diezmo por DNI de persona
 */
export const titheByPerson = async (req: Request, res: Response) => {
    try {
        const { dni } = req.params;

        // Validar la existencia del parámetro
        if (!dni) {
            throw new Error('Falta el DNI en los parámetros de la URL.');
        }

        // El servicio se encarga de validar el DNI
        const incomes = await IncomeService.getTitheIncomesByDni(dni);

        if (incomes.length === 0) {
            return res.status(404).json({ 
                ok: false, 
                message: `No se encontraron ingresos de diezmo para el DNI: ${dni}.`
            });
        }
        
        res.status(200).json({
            ok: true,
            message: 'Ingresos de diezmo obtenidos correctamente.',
            data: incomes,
        });
    } catch (error) {
        return handleControllerError(res, error);
    }
};

/**
 * Obtiene ingresos por fecha
 */
export const getIncomesByDate = async (req: Request, res: Response) => {
    try {
        const { date } = req.params;

        // Validar la existencia del parámetro
        if (!date) {
            throw new Error('Falta la fecha en los parámetros de la URL.');
        }
        
        // El servicio se encarga de validar el formato de fecha
        const incomes = await IncomeService.getIncomesByDate(date);
        
        if (incomes.length === 0) {
            return res.status(404).json({ 
                ok: false, 
                message: `No se encontraron ingresos para la fecha: ${date}.` 
            });
        }
        
        res.status(200).json({
            ok: true,
            message: 'Ingresos obtenidos correctamente.',
            data: incomes,
        });
    } catch (error) {
        return handleControllerError(res, error);
    }
};

/**
 * Crea un nuevo ingreso
 */
export const createIncome = async (req: Request, res: Response) => {
    try {
        // El servicio se encarga de validar los datos
        const newIncome = await IncomeService.create(req.body);
        
        res.status(201).json({
            ok: true,
            message: 'Ingreso creado correctamente.',
            data: newIncome,
        });
    } catch (error) {
        return handleControllerError(res, error);
    }
};

/**
 * Actualiza un ingreso existente
 */
export const updateIncome = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Validar la existencia del parámetro
        if (!id) {
            throw new Error('Falta el ID del ingreso en los parámetros de la URL.');
        }

        const numericId = parseInt(id, 10);
        
        const updatedIncome = await IncomeService.update(numericId, req.body);
        
        if (!updatedIncome) {
            return res.status(404).json({
                ok: false,
                message: `Ingreso con ID ${id} no encontrado o sin cambios.`
            });
        }
        
        res.status(200).json({
            ok: true,
            message: 'Ingreso actualizado correctamente.',
            data: updatedIncome,
        });
    } catch (error) {
        return handleControllerError(res, error);
    }
};

/**
 * Elimina un ingreso por ID
 */
export const deleteIncome = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Validar la existencia del parámetro
        if (!id) {
            throw new Error('Falta el ID del ingreso en los parámetros de la URL.');
        }
        
        const numericId = parseInt(id, 10);
        
        const wasDeleted = await IncomeService.delete(numericId);
        
        if (!wasDeleted) {
            return res.status(404).json({
                ok: false,
                message: `Ingreso con ID ${id} no encontrado.`
            });
        }
        
        res.status(200).json({
            ok: true,
            message: 'Ingreso eliminado correctamente.',
        });
    } catch (error) {
        return handleControllerError(res, error);
    }
};