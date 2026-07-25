import { Request, Response } from "express";
import ControllerErrorHandler from "@utils/ControllerErrorHandler.js";
import { billDetailService } from "@services/cafeteria/bill-detail.service.js";

export const billDetailController = {
  // Obtiene todos los detalles de todos los tickets (útil para analíticas)
  allDetails: async (_req: Request, res: Response) => {
    try {
      const details = await billDetailService.getAll();

      return res.status(200).json({
        ok: true,
        message: details.length > 0
            ? "Detalles de facturas obtenidos correctamente."
            : "No hay detalles registrados.",
        data: details,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener los detalles.");
    }
  },

  // Obtiene un detalle individual
  oneDetail: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ ok: false, message: "ID de detalle inválido." });
      }

      const detail = await billDetailService.getOne(id);

      return res.status(200).json({
        ok: true,
        message: "Detalle de factura obtenido correctamente.",
        data: detail,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener el detalle de factura.");
    }
  },

  // Obtiene todos los detalles pertenecientes a una factura específica
  detailsByBill: async (req: Request, res: Response) => {
    try {
      const billId = parseInt(req.params.billId as string, 10);
      
      if (!billId || isNaN(billId)) {
        return res.status(400).json({ ok: false, message: "ID de factura inválido." });
      }

      const details = await billDetailService.getByBillId(billId);

      return res.status(200).json({
        ok: true,
        message: `Detalles de la factura ${billId} obtenidos correctamente.`,
        data: details,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener los detalles por factura.");
    }
  },
};