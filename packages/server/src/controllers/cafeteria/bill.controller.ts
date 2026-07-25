import { Request, Response } from "express";
import ControllerErrorHandler from "@utils/ControllerErrorHandler.js";
import { BillCreationSchema, BillCreationDTO } from "@economic-control/shared";
import { billService } from "@services/cafeteria/bill.service.js";

export const billController = {
  // Obtiene el historial de ventas
  allBills: async (_req: Request, res: Response) => {
    try {
      const bills = await billService.getAll();

      return res.status(200).json({
        ok: true,
        message: bills.length > 0
            ? "Facturas obtenidas correctamente."
            : "No hay facturas registradas.",
        data: bills,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener las facturas.");
    }
  },

  // Obtiene el ticket completo con sus detalles
  oneBill: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ ok: false, message: "ID de factura inválido." });
      }

      const bill = await billService.getOne(id);

      return res.status(200).json({
        ok: true,
        message: "Factura obtenida correctamente.",
        data: bill,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener la factura.");
    }
  },

  // Checkout: Crea una nueva venta
  createBill: async (req: Request, res: Response) => {
    try {
      const validationResult = BillCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de la nueva venta inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const billData: BillCreationDTO = validationResult.data;
      
      // El servicio se encarga de calcular el total y los subtotales de forma segura
      const newBill = await billService.create(billData);

      return res.status(201).json({
        ok: true,
        message: "Venta procesada y ticket generado correctamente.",
        data: newBill,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al procesar la venta.");
    }
  },

  // Elimina una factura (y en cascada sus detalles)
  deleteBill: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (!id || isNaN(id)) {
        return res.status(400).json({ ok: false, message: "ID de factura inválido." });
      }

      await billService.remove(id);

      return res.status(200).json({
        ok: true,
        message: "Factura eliminada correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al anular la factura.");
    }
  },
};