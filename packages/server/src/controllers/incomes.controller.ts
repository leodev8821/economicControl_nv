import { Request, Response } from "express";
import ControllerErrorHandler from "../utils/ControllerErrorHandler.js";
import {
  IncomeActions,
  IncomeCreationAttributes,
  IncomeAttributes,
  type IncomeSearchData,
} from "../models/income.model.js";
import {
  IncomeCreationRequest,
  IncomeUpdateRequest,
  IncomeCreationSchema,
  IncomeUpdateSchema,
} from "@economic-control/shared";

export const incomesController = {
  // Obtiene todas las ingresos
  allIncomes: async (_req: Request, res: Response) => {
    try {
      const incomes: IncomeAttributes[] = await IncomeActions.getAll();

      return res.status(200).json({
        ok: true,
        message:
          incomes.length === 0
            ? "No hay ingresos registrados."
            : "Ingresos obtenidos correctamente.",
        data: incomes, // ← array vacío si no hay registros
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener las ingresos.",
      );
    }
  },

  // Obtiene una ingreso por ID o nombre
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

      const income = await IncomeActions.getOne(searchCriteria);

      if (!income) {
        return res.status(404).json({
          message:
            "No se encontró la ingreso con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Ingreso obtenida correctamente.",
        data: income,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener la ingreso.");
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
        throw new Error("Falta el DNI en los parámetros de la URL.");
      }

      // El servicio se encarga de validar el DNI
      const incomes = await IncomeActions.getTitheIncomesByDni(dni as string);

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
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener los ingresos de diezmo.",
      );
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
        throw new Error("Falta la fecha en los parámetros de la URL.");
      }

      // El servicio se encarga de validar el formato de fecha
      const incomes = await IncomeActions.getIncomesByDate(date as string);

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
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener los ingresos por fecha.",
      );
    }
  },

  // Crea una nueva ingreso
  createIncome: async (req: Request, res: Response) => {
    try {
      //const validationResult = IncomeCreationSchema.safeParse(req.body);
      const validationResult = IncomeCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nueva ingreso inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const incomeData: IncomeCreationRequest = validationResult.data;

      const newIncomeData: IncomeCreationAttributes = {
        cash_id: incomeData.cash_id,
        week_id: incomeData.week_id,
        amount: incomeData.amount,
        source: incomeData.source,
        date: new Date(incomeData.date),
      };

      if (incomeData.person_id !== undefined && incomeData.person_id !== null) {
        newIncomeData.person_id = incomeData.person_id;
      }

      const newIncome = await IncomeActions.create(newIncomeData);

      return res.status(201).json({
        ok: true,
        message: "Ingreso creada correctamente.",
        data: newIncome,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al crear la ingreso.");
    }
  },

  // Crea múltiples ingresos
  createBulkIncomes: async (req: Request, res: Response) => {
    try {
      const data = req.body;

      if (!Array.isArray(data)) {
        return res.status(400).json({
          ok: false,
          message: "Se esperaba un arreglo de ingresos.",
        });
      }

      // Validar cada elemento del arreglo
      const validatedData: IncomeCreationAttributes[] = [];
      for (const item of data) {
        const result = IncomeCreationSchema.safeParse(item);
        if (!result.success) {
          return res.status(400).json({
            ok: false,
            message: "Uno o más ingresos tienen datos inválidos.",
            errors: result.error.issues,
          });
        }
        const incomeItem = result.data;
        const newIncomeData: IncomeCreationAttributes = {
          cash_id: incomeItem.cash_id,
          week_id: incomeItem.week_id,
          amount: incomeItem.amount,
          source: incomeItem.source,
          date: new Date(incomeItem.date),
        };

        if (
          incomeItem.person_id !== undefined &&
          incomeItem.person_id !== null
        ) {
          newIncomeData.person_id = incomeItem.person_id;
        }

        validatedData.push(newIncomeData);
      }

      const newIncomes =
        await IncomeActions.createMultipleIncomes(validatedData);

      return res.status(201).json({
        ok: true,
        message: `${newIncomes.length} ingresos creados correctamente.`,
        data: newIncomes,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al crear ingresos masivos.",
      );
    }
  },

  updateIncome: async (req: Request, res: Response) => {
    try {
      const incomeId = parseInt((req.params.id as string) || "0", 10);

      if (!incomeId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de ingreso inválido" });
      }

      //const validationResult = IncomeUpdateSchema.safeParse(req.body);
      const validationResult = IncomeUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de ingreso inválidos.",
          errors: validationResult.error.issues,
        });
      }

      //const updateData : IncomeUpdateRequest = validationResult.data;
      const updateData: IncomeUpdateRequest = validationResult.data;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatePayload: Partial<IncomeCreationAttributes> = {};

      if (updateData.cash_id !== undefined)
        updatePayload.cash_id = updateData.cash_id;
      if (updateData.week_id !== undefined)
        updatePayload.week_id = updateData.week_id;
      if (updateData.amount !== undefined)
        updatePayload.amount = updateData.amount;
      if (updateData.source !== undefined)
        updatePayload.source = updateData.source;
      if (updateData.person_id !== undefined && updateData.person_id !== null) {
        updatePayload.person_id = updateData.person_id;
      }
      if (updateData.date !== undefined) {
        updatePayload.date = new Date(updateData.date);
      }

      const updatedIncome = await IncomeActions.update(incomeId, updatePayload);

      if (!updatedIncome) {
        return res.status(404).json({
          ok: false,
          message: "Ingreso no encontrada para actualizar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Ingreso actualizada correctamente.",
        data: updatedIncome,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al actualizar la ingreso.",
      );
    }
  },

  deleteIncome: async (req: Request, res: Response) => {
    try {
      const incomeId = parseInt((req.params.id as string) || "0", 10);

      if (!incomeId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de ingreso inválido" });
      }

      const deleted = await IncomeActions.delete({ id: incomeId });

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          message: "No se encontró la ingreso para eliminar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Ingreso eliminada correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al eliminar la ingreso.",
      );
    }
  },
};
