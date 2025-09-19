import { createNewPerson, getAllPersons, getOnePerson, deletePerson, updateOnePerson } from "../models/person.model.js";
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obtener la ruta absoluta del directorio del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

export default {
    allPersons: async (req, res) => {
        try {
            const persons = await getAllPersons();

            const formattedPersons = persons.map((person, i) => ({
                person_number: `${i + 1}`,
                id: person.id,
                first_name: person.first_name,
                last_name: person.last_name,
                dni: person.dni,
                isVisible: !!person.isVisible // Convertir a booleano
            }));

            if (!formattedPersons || formattedPersons.length === 0) {
                return res.status(404).json({ ok: false, message: 'No autorizado para mostrar personas' });
            }

            res.status(200).json({
                ok: true,
                message: 'Personas obtenidas correctamente.',
                data: formattedPersons,
            });

        } catch (error) {
            console.error('Error en allPersons:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en allPersons', 
                error: error.message
            });
        }
    },
    onePerson: async (req, res) => {
        try {
            const { id } = req.params;
            const person = await getOnePerson(id);

            if (!person) {
                return res.status(404).json({ ok: false, message: 'Persona no encontrada' });
            }   res.status(200).json({
                    ok: true,
                    message: 'Persona obtenida correctamente.',
                    data: person,
            });

        } catch (error) {
            console.error('Error en onePerson:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en onePerson', 
                error: error.message
            });
        }
    },
    createPerson: async (req, res) => {
        try {
            const { first_name, last_name, dni } = req.body;
            const data = { first_name, last_name, dni};
            const newPerson = await createNewPerson(data);

            if (!newPerson) {
                return res.status(409).json({ ok: false, message: 'La persona ya existe' });
            }

            res.status(201).json({
                ok: true,
                message: 'Persona creada correctamente.',
                data: newPerson,
            });

        } catch (error) {
            console.error('Error en createPerson:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en createPerson', 
                error: error.message
            });
        }
    },
    updatePerson: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;
            const updatedPerson = await updateOnePerson(['id'], { id, ...data });

            if (!updatedPerson) {
                return res.status(404).json({ ok: false, message: 'Persona no encontrada o sin cambios' });
            }

            res.status(200).json({
                ok: true,
                message: 'Persona actualizada correctamente.',
                data: updatedPerson,
            });

        } catch (error) {
            console.error('Error en updatePerson:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en updatePerson', 
                error: error.message
            });
        }
    },
    deletePerson: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await deletePerson({ id });

            if (!deleted) {
                return res.status(404).json({ ok: false, message: 'Persona no encontrada' });
            }

            res.status(200).json({
                ok: true,
                message: 'Persona eliminada correctamente.',
            });

        } catch (error) {
            console.error('Error en deletePerson:', error.message);
            res.status(500).json({
                ok:false,
                message: 'Error en deletePerson', 
                error: error.message
            });
        }
    }
}