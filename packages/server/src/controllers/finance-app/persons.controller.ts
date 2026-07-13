import { Request, Response } from "express";
import ControllerErrorHandler from "@utils/ControllerErrorHandler.js";
import type { PersonSearchData, PersonAttributes } from "@models/finance-app/person.model.js";
import {
  PersonCreationDTO,
  PersonUpdateDTO,
} from "@economic-control/shared";
import { personService } from "@services/finance-app/person.service.js";
import { UniqueConstraintError } from "sequelize";

// Asumo que estas importaciones existen en tu archivo original
// import { PersonCreationSchema, PersonUpdateSchema } from "ruta-a-tus-schemas";

export const personsController = {
  // Obtiene todas las personas
  allPersons: async (_req: Request, res: Response) => {
    try {
      const persons: PersonAttributes[] = await personService.getAll();

      return res.status(200).json({
        ok: true,
        message:
          persons.length > 0
            ? "Personas obtenidas correctamente."
            : "No hay personas registradas.",
        data: persons,
      });
    } catch (error) {
      return ControllerErrorHandler(
        res,
        error,
        "Error al obtener las personas."
      );
    }
  },

  // Obtiene una persona por ID, nombre o DNI
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

      // El servicio lanzará un error automáticamente si no lo encuentra, 
      // por lo que el catch lo atrapará.
      const person = await personService.getOne(searchCriteria);

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

      const personData: PersonCreationDTO = req.body;

      // Creamos directamente; si el DNI está duplicado, Sequelize lanzará un UniqueConstraintError
      const newPerson = await personService.create(personData);

      return res.status(201).json({
        ok: true,
        message: "Persona creada correctamente.",
        data: newPerson,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return res.status(409).json({
          ok: false,
          message: "Ya existe una persona con el mismo DNI.",
        });
      }
      return ControllerErrorHandler(res, error, "Error al crear la persona.");
    }
  },

  // Actualiza una persona existente
  updatePerson: async (req: Request, res: Response) => {
    try {
      const personId = parseInt((req.params.id as string) || "0", 10);

      if (!personId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de persona inválido" });
      }

      const updateData: PersonUpdateDTO = req.body;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      // Actualizamos directamente. Igual que en create, los DNI duplicados caen en el catch.
      const updatedPerson = await personService.update(personId, updateData);

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
        "Error al actualizar la persona."
      );
    }
  },

  // Elimina una persona
  deletePerson: async (req: Request, res: Response) => {
    try {
      const personId = parseInt((req.params.id as string) || "0", 10);

      if (!personId) {
        return res
          .status(400)
          .json({ ok: false, message: "ID de persona inválido" });
      }

      const deleted = await personService.remove(personId);

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
        "Error al eliminar la persona."
      );
    }
  },
};