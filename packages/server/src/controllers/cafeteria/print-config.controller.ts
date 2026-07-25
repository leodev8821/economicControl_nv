import { Request, Response } from "express";
import ControllerErrorHandler from "@utils/ControllerErrorHandler.js";
import { printConfigService } from "@services/cafeteria/print-config.service.js";
import { PrintConfigUpdateSchema } from "@economic-control/shared";

export const printConfigController = {
  // Obtiene la configuración de impresión actual
  getConfig: async (_req: Request, res: Response) => {
    try {
      const config = await printConfigService.getConfig();

      return res.status(200).json({
        ok: true,
        message: "Configuración de impresión obtenida correctamente.",
        data: config,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener la configuración de impresión.");
    }
  },

  // Inicializa la configuración por defecto (útil en el primer despliegue del sistema)
  initializeConfig: async (_req: Request, res: Response) => {
    try {
      const config = await printConfigService.initializeConfig();

      return res.status(200).json({
        ok: true,
        message: "Configuración de impresión inicializada.",
        data: config,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al inicializar la configuración de impresión.");
    }
  },

  // Actualiza la configuración de impresión (Maneja datos en texto y archivos binarios)
  updateConfig: async (req: Request, res: Response) => {
    try {
      // Extraemos los datos del body (texto)
      const bodyData = { ...req.body };

      // Si usamos Multer, extraemos los archivos de la memoria
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files) {
        if (files.logo && files.logo[0]) {
          bodyData.logo_data = files.logo[0].buffer;
          bodyData.logo_tipo = files.logo[0].mimetype;
        }
        if (files.qr && files.qr[0]) {
          bodyData.qr_data = files.qr[0].buffer;
          bodyData.qr_tipo = files.qr[0].mimetype;
        }
      }

      // Validamos y coercemos los datos con Zod
      const parsedData = PrintConfigUpdateSchema.safeParse(bodyData);

      if (!parsedData.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de configuración inválidos.",
          errors: parsedData.error.format(),
        });
      }

      const updatedConfig = await printConfigService.updateConfig(parsedData.data);

      return res.status(200).json({
        ok: true,
        message: "Configuración de impresión actualizada correctamente.",
        data: updatedConfig,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al actualizar la configuración de impresión.");
    }
  },

  // Obtiene exclusivamente las banderas de facturación (útil para comprobaciones rápidas del frontend)
  getFacturaFlags: async (_req: Request, res: Response) => {
    try {
      const flags = await printConfigService.getFacturaFlags();

      return res.status(200).json({
        ok: true,
        message: "Banderas de impresión de factura obtenidas correctamente.",
        data: flags,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener las banderas de impresión.");
    }
  },
};