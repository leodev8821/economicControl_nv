import { Request, Response } from 'express';
import handlerControllerError from '../utils/handleControllerError';
import { PersonService } from '../services/person.service';

export const personController = {
    allPersons: async (_req: Request, res: Response) => {
        try {
            const persons = await PersonService.getAll();

            if (persons.length === 0) {
                return res.status(404).json({ ok: false, message: 'No se encontraron personas.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Personas obtenidas correctamente.',
                data: persons,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    onePerson: async (req: Request, res: Response) => {
        try {
            const { id, dni } = req.params;
            const identifier = id ? { id: Number(id) } : { dni: dni! };
            
            const person = await PersonService.getOneByIdentifier(identifier);

            if (!person) {
                return res.status(404).json({ ok: false, message: 'Persona no encontrada.' });
            }   

            return res.status(200).json({
                ok: true,
                message: 'Persona obtenida correctamente.',
                data: person,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    createPerson: async (req: Request, res: Response) => {
        try {
            const newPerson = await PersonService.create(req.body);

            return res.status(201).json({
                ok: true,
                message: 'Persona creada correctamente.',
                data: newPerson,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    updatePerson: async (req: Request, res: Response) => {
        try {
            const { id, dni } = req.params;
            const identifier = id ? { id: Number(id) } : { dni: dni! };
            const data = req.body;
            
            const updatedPerson = await PersonService.update(identifier, data);

            if (!updatedPerson) {
                return res.status(404).json({ ok: false, message: 'Persona no encontrada o sin cambios.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Persona actualizada correctamente.',
                data: updatedPerson,
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    },

    deletePerson: async (req: Request, res: Response) => {
        try {
            const { id, dni } = req.params;
            const identifier = id ? { id: Number(id) } : { dni: dni! };

            const wasDeleted = await PersonService.delete(identifier);

            if (!wasDeleted) {
                return res.status(404).json({ ok: false, message: 'Persona no encontrada.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Persona eliminada correctamente.',
            });
        } catch (error) {
            return handlerControllerError(res, error);
        }
    }
};