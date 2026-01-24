import { Request, Response } from "express";
import ControllerErrorHandler from "../utils/ControllerErrorHandler.js";
import type { PersonSearchData } from "../models/person.model.js";
import {
  PersonActions,
  PersonCreationAttributes,
  PersonAttributes,
} from "../models/person.model.js";
import {
  PersonCreationSchema,
  PersonCreationRequest,
  PersonUpdateSchema,
  PersonUpdateRequest,
} from "@economic-control/shared";
import { UniqueConstraintError } from "sequelize";

export const personsController = {
  // Obtiene todas las personas
  allPersons: async (_req: Request, res: Response) => {
    try {
      const persons: PersonAttributes[] = await PersonActions.getAll();

      return res.status(200).json({
        ok: true,
        message:
          persons.length === 0
            ? "No hay personas registradas."
            : "Personas obtenidas correctamente.",
        data: persons,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener las personas.",
      );
    }
  },

  // Obtiene una persona por ID o nombre
  onePerson: async (req: Request, res: Response) => {
    try {
      const { id, first_name, last_name, dni } = req.params;
      const searchCriteria: PersonSearchData = {};

      if (id) {
        searchCriteria.id = parseInt(id as string, 10);
      }
      if (first_name) {
        searchCriteria.first_name = first_name as string;
      }
      if (last_name) {
        searchCriteria.last_name = last_name as string;
      }
      if (dni) {
        searchCriteria.dni = dni as string;
      }

      const person = await PersonActions.getOne(searchCriteria);

      if (!person) {
        return res.status(404).json({
          message:
            "No se encontró la persona con los parámetros proporcionados.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Persona obtenida correctamente.",
        data: person,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener la persona.");
    }
  },

  // Crea una nueva persona
  createPerson: async (req: Request, res: Response) => {
    try {
      const validationResult = PersonCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nueva persona inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const personData: PersonCreationRequest = validationResult.data;

      const existingPerson = await PersonActions.getOne({
        dni: personData.dni,
      });
      if (existingPerson) {
        return res.status(409).json({
          ok: false,
          message: "Ya existe una persona con el mismo DNI.",
        });
      }

      const newPerson = await PersonActions.create(
        personData as PersonCreationAttributes,
      );

      return res.status(201).json({
        ok: true,
        message: "Persona creada correctamente.",
        data: newPerson,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return res.status(409).json({
          ok: false,
          message: "El DNI ya está en la base de datos.",
        });
      }
      return ControllerErrorHandler(res, error, "Error al crear la persona.");
    }
  },

  updatePerson: async (req: Request, res: Response) => {
    try {
      const personId = parseInt((req.params.id as string) || "0", 10);

      if (!personId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de persona inválido" });
      }

      const validationResult = PersonUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización de persona inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const updateData: PersonUpdateRequest = validationResult.data;

      const existingPerson = await PersonActions.getOne({
        dni: updateData.dni,
      });

      if (existingPerson) {
        return res.status(409).json({
          ok: false,
          message: "Ya existe una persona con el mismo DNI.",
        });
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedPerson = await PersonActions.update(
        personId,
        updateData as Partial<PersonCreationAttributes>,
      );

      if (!updatedPerson) {
        return res.status(404).json({
          ok: false,
          message: "Persona no encontrada para actualizar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Persona actualizada correctamente.",
        data: updatedPerson,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return res.status(409).json({
          ok: false,
          message: "El DNI ya está en la base de datos.",
        });
      }
      return ControllerErrorHandler(
        res,
        error,
        "Error al actualizar la persona.",
      );
    }
  },

  deletePerson: async (req: Request, res: Response) => {
    try {
      const personId = parseInt((req.params.id as string) || "0", 10);

      if (!personId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de persona inválido" });
      }

      const deleted = await PersonActions.delete({ id: personId });

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          message: "No se encontró la persona para eliminar.",
        });
      }

      return res.status(200).json({
        ok: true,
        message: "Persona eliminada correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al eliminar la persona.",
      );
    }
  },
};
