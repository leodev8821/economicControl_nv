import { Request, Response } from "express";
import ControllerErrorHandler from "@utils/ControllerErrorHandler.js";
import type { 
  IncomeSearchData, 
  IncomeAttributes, 
  IncomeCreationAttributes 
} from "@models/finance-app/income.model.js";
import {
  IncomeCreationDTO,
  IncomeUpdateDTO,
  IncomeCreationSchema,
  IncomeUpdateSchema,
  BulkIncomeDTO,
} from "@economic-control/shared";
import { incomeService } from "@services/finance-app/income.service.js";

export const incomesController = {
  // Obtiene todos los ingresos
  allIncomes: async (_req: Request, res: Response) => {
    try {
      const incomes: IncomeAttributes[] = await incomeService.getAll();

      return res.status(200).json({
        ok: true,
        message:
          incomes.length > 0
            ? "Ingresos obtenidos correctamente."
            : "No hay ingresos registrados.",
        data: incomes,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener los ingresos.");
    }
  },

  // Obtiene un ingreso por criterios de búsqueda
  oneIncome: async (req: Request, res: Response) => {
    try {
      const { id, person_id, source } = req.params;
      const searchCriteria: IncomeSearchData = {};

      if (id) {
        searchCriteria.id = parseInt(id as string, 10);
      }
      if (person_id) {
        searchCriteria.person_id = parseInt(person_id as string, 10);
      }
      if (source) {
        searchCriteria.source = source as string;
      }

      // El servicio lanza un error si no lo encuentra, atrapado por el catch
      const income = await incomeService.getOne(searchCriteria);

      return res.status(200).json({
        ok: true,
        message: "Ingreso obtenido correctamente.",
        data: income,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener el ingreso.");
    }
  },

  // Obtiene ingresos de diezmo por DNI de persona
  titheByPerson: async (req: Request, res: Response) => {
    try {
      const { dni } = req.params;

      if (!dni) {
        throw new Error("Falta el DNI en los parámetros de la URL.");
      }

      const incomes = await incomeService.getTitheIncomesByDni(dni as string);

      if (incomes.length === 0) {
        return res.status(404).json({
          ok: false,
          message: `No se encontraron ingresos de diezmo para el DNI: ${dni}.`,
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Ingresos de diezmo obtenidos correctamente.",
        data: incomes,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener los ingresos de diezmo.");
    }
  },

  // Obtiene ingresos por fecha
  getIncomesByDate: async (req: Request, res: Response) => {
    try {
      const { date } = req.params;

      if (!date) {
        throw new Error("Falta la fecha en los parámetros de la URL.");
      }

      const incomes = await incomeService.getIncomesByDate(date as string);

      if (incomes.length === 0) {
        return res.status(404).json({
          ok: false,
          message: `No se encontraron ingresos para la fecha: ${date}.`,
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Ingresos obtenidos correctamente.",
        data: incomes,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener los ingresos por fecha.");
    }
  },

  // Crea un nuevo ingreso
  createIncome: async (req: Request, res: Response) => {
    try {
      const validationResult = IncomeCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nuevo ingreso inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const incomeData: IncomeCreationDTO = validationResult.data;

      const newIncomeData: IncomeCreationAttributes = {
        cash_id: incomeData.cash_id,
        week_id: incomeData.week_id,
        amount: parseFloat(String(incomeData.amount)),
        source: incomeData.source,
        date: new Date(incomeData.date),
      };

      if (incomeData.person_id !== undefined && incomeData.person_id !== null) {
        newIncomeData.person_id = incomeData.person_id;
      }

      const newIncome = await incomeService.create(newIncomeData);

      return res.status(201).json({
        ok: true,
        message: "Ingreso creado correctamente.",
        data: newIncome,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al crear el ingreso.");
    }
  },

  // Crea múltiples ingresos masivamente
  createBulkIncomes: async (req: Request, res: Response) => {
    try {
    // 1. El middleware ya validó el cuerpo contra BulkIncomeSchema,
    // por lo tanto, 'req.body' ya es del tipo BulkIncomeDTO
    const { common_week_id, incomes } = req.body as BulkIncomeDTO;

    // 2. Transformación de datos usando los datos ya validados
    const validatedData: IncomeCreationAttributes[] = incomes.map((item) => ({
      ...item, // Campos básicos (amount, source, date)
      cash_id: item.cash_id,
      week_id: common_week_id, // Inyectamos el ID global de la semana
      person_id: item.person_id ?? null,
      amount: parseFloat(String(item.amount)),
      date: new Date(item.date),
    }));

    // 3. Persistencia
    const newIncomes = await incomeService.createMultipleIncomes(validatedData);

    return res.status(201).json({
      ok: true,
      message: `${newIncomes.length} ingresos creados correctamente.`,
      data: newIncomes,
    });
  } catch (error) {
    return ControllerErrorHandler(res, error, "Error al crear ingresos masivos.");
  }
  },

  // Actualiza un ingreso
  updateIncome: async (req: Request, res: Response) => {
    try {
      const incomeId = parseInt((req.params.id as string) || "0", 10);

      if (!incomeId) {
        return res.status(400).json({ ok: false, message: "ID de ingreso inválido" });
      }

      const validationResult = IncomeUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de ingreso inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const updateData: IncomeUpdateDTO = validationResult.data;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatePayload: Partial<IncomeCreationAttributes> = {};

      if (updateData.cash_id !== undefined) updatePayload.cash_id = updateData.cash_id;
      if (updateData.week_id !== undefined) updatePayload.week_id = updateData.week_id;
      if (updateData.amount !== undefined) updatePayload.amount = parseFloat(String(updateData.amount));
      if (updateData.source !== undefined) updatePayload.source = updateData.source;
      if (updateData.person_id !== undefined && updateData.person_id !== null) {
        updatePayload.person_id = updateData.person_id;
      }
      if (updateData.date !== undefined) {
        updatePayload.date = new Date(updateData.date);
      }

      // El servicio lanza un error si no lo encuentra, atrapado por el catch
      const updatedIncome = await incomeService.update(incomeId, updatePayload);

      return res.status(200).json({
        ok: true,
        message: "Ingreso actualizado correctamente.",
        data: updatedIncome,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al actualizar el ingreso.");
    }
  },

  // Elimina un ingreso
  deleteIncome: async (req: Request, res: Response) => {
    try {
      const incomeId = parseInt((req.params.id as string) || "0", 10);

      if (!incomeId) {
        return res.status(400).json({ ok: false, message: "ID de ingreso inválido" });
      }

      // El servicio lanza un error si no lo encuentra, atrapado por el catch
      await incomeService.remove(incomeId);

      return res.status(200).json({
        ok: true,
        message: "Ingreso eliminado correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al eliminar el ingreso.");
    }
  },
};