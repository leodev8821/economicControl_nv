import { Request, Response } from 'express';
import { 
    updateOneIncome, 
    deleteIncome,
    createNewIncome,
    getAllIncomes,
    getIncomeByDate,
    getOneIncome,
    getTitheIncomesByPerson,
    validateUpdateIncomeData,
    validateIncomeId,
    validateCreateIncomeData,
    validateDNI,
    validateDate,
    IncomeSource 
} from '../models/income.model';

interface CustomRequest extends Request {
    body: {
        amount?: number;
        source?: IncomeSource;
        person_id?: number;
        week_id?: number;
        date?: string;
    };
    params: {
        id?: string;
        dni?: string;
        date?: string;
    };
}

// Función helper para manejar errores de validación
const handleValidationError = (res: Response, error: string) => {
    return res.status(400).json({
        ok: false,
        message: error
    });
};

// Función helper para manejar errores del servidor
const handleServerError = (res: Response, error: any, operation: string) => {
    console.error(`Error en ${operation}:`, error.message);
    return res.status(500).json({
        ok: false,
        message: `Error en ${operation}`,
        error: error.message
    });
};

/**
 * Obtiene todos los ingresos
 */
const allIncomes = async (req: CustomRequest, res: Response) => {
    try {
        const incomes = await getAllIncomes();

        if (!incomes || incomes.length === 0) {
            return res.status(404).json({ 
                ok: false, 
                message: 'No se encontraron ingresos' 
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Ingresos obtenidos correctamente.',
            data: incomes,
        });
    } catch (error: any) {
        return handleServerError(res, error, 'allIncomes');
    }
};

/**
 * Obtiene ingresos de diezmo por DNI de persona
 */
const titheByPerson = async (req: CustomRequest, res: Response) => {
    try {
        const { dni } = req.params;
        
        // Validar DNI
        const dniValidation = validateDNI(dni!);
        if (!dniValidation.isValid) {
            return handleValidationError(res, dniValidation.error!);
        }

        const incomes = await getTitheIncomesByPerson(dniValidation.validatedDni!);

        if (!incomes || incomes.length === 0) {
            return res.status(404).json({ 
                ok: false, 
                message: 'No se encontraron ingresos de diezmo para esta persona' 
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Ingresos de diezmo obtenidos correctamente.',
            data: incomes,
        });
    } catch (error: any) {
        return handleServerError(res, error, 'titheByPerson');
    }
};

/**
 * Obtiene ingresos por fecha
 */
const getIncomesByDate = async (req: CustomRequest, res: Response) => {
    try {
        const { date } = req.params;
        
        // Validar fecha
        const dateValidation = validateDate(date!);
        if (!dateValidation.isValid) {
            return handleValidationError(res, dateValidation.error!);
        }

        const incomes = await getIncomeByDate(dateValidation.validatedDate!);

        if (!incomes || incomes.length === 0) {
            return res.status(404).json({ 
                ok: false, 
                message: `No se encontraron ingresos para la fecha ${date}` 
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Ingresos obtenidos correctamente.',
            data: incomes,
        });
    } catch (error: any) {
        return handleServerError(res, error, 'getIncomesByDate');
    }
};

/**
 * Crea un nuevo ingreso
 */
const createIncome = async (req: CustomRequest, res: Response) => {
    try {
        // Validar datos de entrada
        const validation = validateCreateIncomeData(req.body);
        if (!validation.isValid) {
            return handleValidationError(res, validation.error!);
        }

        const newIncome = await createNewIncome(validation.validatedData!);

        res.status(201).json({
            ok: true,
            message: 'Ingreso creado correctamente.',
            data: newIncome,
        });
    } catch (error: any) {
        return handleServerError(res, error, 'createIncome');
    }
};

/**
 * Obtiene un ingreso por ID
 */
const oneIncome = async (req: CustomRequest, res: Response) => {
    try {
        const { id } = req.params;
        
        // Validar ID
        const idValidation = validateIncomeId(id!);
        if (!idValidation.isValid) {
            return handleValidationError(res, idValidation.error!);
        }

        const income = await getOneIncome(idValidation.validatedId!);

        if (!income) {
            return res.status(404).json({ 
                ok: false, 
                message: 'Ingreso no encontrado' 
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Ingreso obtenido correctamente.',
            data: income,
        });
    } catch (error: any) {
        return handleServerError(res, error, 'oneIncome');
    }
};

/**
 * Actualiza un ingreso existente
 */
const updateIncome = async (req: CustomRequest, res: Response) => {
    try {
        const { id } = req.params;
        
        // Validar ID
        const idValidation = validateIncomeId(id!);
        if (!idValidation.isValid) {
            return handleValidationError(res, idValidation.error!);
        }

        // Validar datos de actualización
        const dataValidation = validateUpdateIncomeData(req.body);
        if (!dataValidation.isValid) {
            return handleValidationError(res, dataValidation.error!);
        }

        // Actualizar ingreso
        const updatedIncome = await updateOneIncome(idValidation.validatedId!, dataValidation.validatedData!);

        if (!updatedIncome) {
            return res.status(404).json({
                ok: false,
                message: 'Ingreso no encontrado o sin cambios.'
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Ingreso actualizado correctamente.',
            data: updatedIncome,
        });
    } catch (error: any) {
        return handleServerError(res, error, 'updateIncome');
    }
};

/**
 * Elimina un ingreso por ID
 */
const deleteIncomeController = async (req: CustomRequest, res: Response) => {
    try {
        const { id } = req.params;
        
        // Validar ID
        const idValidation = validateIncomeId(id!);
        if (!idValidation.isValid) {
            return handleValidationError(res, idValidation.error!);
        }

        // Eliminar ingreso
        const deletedIncome = await deleteIncome(idValidation.validatedId!);

        if (!deletedIncome) {
            return res.status(404).json({
                ok: false,
                message: 'Ingreso no encontrado.'
            });
        }

        res.status(200).json({
            ok: true,
            message: 'Ingreso eliminado correctamente.',
        });
    } catch (error: any) {
        return handleServerError(res, error, 'deleteIncome');
    }
};

export {
    allIncomes,
    titheByPerson,
    getIncomesByDate,
    createIncome,
    oneIncome,
    updateIncome,
    deleteIncomeController
};