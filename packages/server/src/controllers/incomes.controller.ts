import { Request, Response } from 'express';
import ControllerErrorHandler from '../utils/ControllerErrorHandler';
import { IncomeActions, IncomeCreationAttributes, IncomeAttributes, type IncomeSearchData } from '../models/income.model';
//import { IncomeCreationSchema, IncomeCreationRequest, IncomeUpdateSchema, IncomeUpdateRequest } from '../schemas/income.schema';
//import { CreateIncomeSchema, UpdateIncomeSchema, type CreateIncomeDTO, type UpdateIncomeDTO } from '@economic/shared'
import * as SharedIncomeSchemas from '@economic/shared';


export const incomesController = {
    // Obtiene todas las ingresos
    allIncomes: async (_req: Request, res: Response) => {
        try {
            const incomes: IncomeAttributes[] = await IncomeActions.getAll();

            if (incomes.length === 0) {
                return res.status(404).json({ 
                    ok: false, 
                    message: 'No se encontraron ingresos.' 
                });
            }

            return res.status(200).json({
                ok: true,
                message: 'Ingresos obtenidas correctamente.',
                data: incomes,
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al obtener las ingresos.');
        }
    },

    // Obtiene una ingreso por ID o nombre
    oneIncome: async (req: Request, res: Response) => {
        try {
            const { id, person_id, source } = req.params;
            const searchCriteria: IncomeSearchData = {};

            if (id) {
                searchCriteria.id = parseInt(id, 10);
            }
            if (person_id) {
                searchCriteria.person_id = parseInt(person_id, 10);
            }
            if (source) {
                searchCriteria.source = source;
            }
            
            const income = await IncomeActions.getOne(searchCriteria);

            if (!income) {
                return res.status(404).json({ message: 'No se encontró la ingreso con los parámetros proporcionados.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Ingreso obtenida correctamente.',
                data: income,
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al obtener la ingreso.' );
        }
    },

    /**
     * Obtiene ingresos de diezmo por DNI de persona
     */
    titheByPerson: async (req: Request, res: Response) => {
        try {
            const { dni } = req.params;

            // Validar la existencia del parámetro
            if (!dni) {
                throw new Error('Falta el DNI en los parámetros de la URL.');
            }

            // El servicio se encarga de validar el DNI
            const incomes = await IncomeActions.getTitheIncomesByDni(dni);

            if (incomes.length === 0) {
                return res.status(404).json({ 
                    ok: false, 
                    message: `No se encontraron ingresos de diezmo para el DNI: ${dni}.`
                });
            }
            
            return res.status(200).json({
                ok: true,
                message: 'Ingresos de diezmo obtenidos correctamente.',
                data: incomes,
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al obtener los ingresos de diezmo.' );
        }
    },

    /**
     * Obtiene ingresos por fecha
     */
    getIncomesByDate: async (req: Request, res: Response) => {
        try {
            const { date } = req.params;

            // Validar la existencia del parámetro
            if (!date) {
                throw new Error('Falta la fecha en los parámetros de la URL.');
            }
            
            // El servicio se encarga de validar el formato de fecha
            const incomes = await IncomeActions.getIncomesByDate(date);
            
            if (incomes.length === 0) {
                return res.status(404).json({ 
                    ok: false, 
                    message: `No se encontraron ingresos para la fecha: ${date}.` 
                });
            }
            
            return res.status(200).json({
                ok: true,
                message: 'Ingresos obtenidos correctamente.',
                data: incomes,
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al obtener los ingresos por fecha.' );
        }
    },

    // Crea una nueva ingreso
    createIncome: async (req: Request, res: Response) => {
        try {

            //const validationResult = IncomeCreationSchema.safeParse(req.body);
            const validationResult = SharedIncomeSchemas.CreateIncomeSchema.safeParse(req.body);

            if (!validationResult.success) {
                return res.status(400).json({
                    ok: false,
                    message: 'Datos de nueva ingreso inválidos.',
                    errors: validationResult.error.issues,
                });
            }

            //const incomeData: IncomeCreationRequest = validationResult.data;
            const incomeData: SharedIncomeSchemas.CreateIncomeDTO = validationResult.data;
            
            //const newIncome = await IncomeActions.create(incomeData as IncomeCreationAttributes);
            const newIncome = await IncomeActions.create(incomeData as IncomeCreationAttributes);

            return res.status(201).json({
                ok: true,
                message: 'Ingreso creada correctamente.',
                data: newIncome,
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al crear la ingreso.' );
        }
    },

    updateIncome: async (req: Request, res: Response) => {
        try {
            const incomeId = parseInt(req.params.id || '0', 10);

            if (!incomeId) {
                return res.status(400).json({ ok: false, message: 'ID de ingreso inválido' });
            }
            
            //const validationResult = IncomeUpdateSchema.safeParse(req.body);
            const validationResult = SharedIncomeSchemas.UpdateIncomeSchema.safeParse(req.body);

            if (!validationResult.success) {
                return res.status(400).json({
                    ok: false,
                    message: 'Datos de actualización de ingreso inválidos.',
                    errors: validationResult.error.issues,
                });
            }

            //const updateData : IncomeUpdateRequest = validationResult.data;
            const updateData : SharedIncomeSchemas.UpdateIncomeDTO = validationResult.data;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ ok: false, message: 'No se proporcionaron datos para actualizar.' });
            }

            const updatedIncome = await IncomeActions.update(incomeId, updateData as Partial<IncomeCreationAttributes>);

            if (!updatedIncome) {
                return res.status(404).json({ ok: false, message: 'Ingreso no encontrada para actualizar.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Ingreso actualizada correctamente.',
                data: updatedIncome,
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al actualizar la ingreso.' );
        }
    },

    deleteIncome: async (req: Request, res: Response) => {
        try {
            const incomeId = parseInt(req.params.id || '0', 10);

            if (!incomeId) {
                return res.status(400).json({ ok: false, message: 'ID de ingreso inválido' });
            }

            const deleted = await IncomeActions.delete({ id: incomeId });

            if (!deleted) {
                return res.status(404).json({ ok: false, message: 'No se encontró la ingreso para eliminar.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Ingreso eliminada correctamente.',
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al eliminar la ingreso.' );
        }
    }
};