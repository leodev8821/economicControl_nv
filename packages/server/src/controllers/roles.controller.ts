import { Request, Response } from "express";
import ControllerErrorHandler from "../utils/ControllerErrorHandler.ts";
import { RoleActions, RoleAttributes } from "../models/role.model.ts";
//import { RoleCreationAttributes } from '../models/role.model';
//import type { RoleSearchData } from '../models/role.model';
//import { RoleCreationSchema, RoleCreationRequest, RoleUpdateSchema, RoleUpdateRequest } from '../schemas/role.schema';

export const rolesController = {
  // Obtiene todas las rols
  allRoles: async (_req: Request, res: Response) => {
    try {
      const roles: RoleAttributes[] = await RoleActions.getAll();

      return res.status(200).json({
        ok: true,
        message:
          roles.length === 0
            ? "No hay roles registrados."
            : "Roles obtenidos correctamente.",
        data: roles,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener los roles.");
    }
  },

  /* ---- IMPLEMENTAR SI ES NECESARIO ----
    // Obtiene una rol por ID o nombre
    oneRol: async (req: Request, res: Response) => {
        try {
            const { id, role } = req.params;
            const searchCriteria: RoleSearchData = {};

            if (id) {
                searchCriteria.id = parseInt(id, 10);
            }
            if (role) {
                searchCriteria.role = role;
            }
            
            const roleObtained = await RoleActions.getOne(searchCriteria);

            if (!roleObtained) {
                return res.status(404).json({ message: 'No se encontró la rol con los parámetros proporcionados.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Role obtenida correctamente.',
                data: roleObtained,
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al obtener la rol.' );
        }
    },

    // Crea una nueva rol
    createRol: async (req: Request, res: Response) => {
        try {

            const validationResult = RoleCreationSchema.safeParse(req.body);

            if (!validationResult.success) {
                return res.status(400).json({
                    ok: false,
                    message: 'Datos de nueva rol inválidos.',
                    errors: validationResult.error.issues,
                });
            }

            const roleData: RoleCreationRequest = validationResult.data;
            
            const newRole = await RoleActions.create(roleData as RoleCreationAttributes);

            return res.status(201).json({
                ok: true,
                message: 'Role creada correctamente.',
                data: newRole,
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al crear la rol.' );
        }
    },

    updateRol: async (req: Request, res: Response) => {
        try {
            const roleId = parseInt(req.params.id || '0', 10);

            if (!roleId) {
                return res.status(400).json({ ok: false, message: 'ID de rol inválido' });
            }
            
            const validationResult = RoleUpdateSchema.safeParse(req.body);

            if (!validationResult.success) {
                return res.status(400).json({
                    ok: false,
                    message: 'Datos de actualización de rol inválidos.',
                    errors: validationResult.error.issues,
                });
            }

            const updateData : RoleUpdateRequest = validationResult.data;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ ok: false, message: 'No se proporcionaron datos para actualizar.' });
            }

            const updatedRol = await RoleActions.update(roleId, updateData as Partial<RoleCreationAttributes>);

            if (!updatedRol) {
                return res.status(404).json({ ok: false, message: 'Role no encontrada para actualizar.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Role actualizada correctamente.',
                data: updatedRol,
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al actualizar la rol.' );
        }
    },

    deleteRol: async (req: Request, res: Response) => {
        try {
            const roleId = parseInt(req.params.id || '0', 10);

            if (!roleId) {
                return res.status(400).json({ ok: false, message: 'ID de rol inválido' });
            }

            const deleted = await RoleActions.delete({ id: roleId });

            if (!deleted) {
                return res.status(404).json({ ok: false, message: 'No se encontró la rol para eliminar.' });
            }

            return res.status(200).json({
                ok: true,
                message: 'Role eliminada correctamente.',
            });
        } catch (error) {
            return ControllerErrorHandler(res, error, 'Error al eliminar la rol.' );
        }
    }
        */
};
