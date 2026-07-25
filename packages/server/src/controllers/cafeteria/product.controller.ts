import { Request, Response } from "express";
import ControllerErrorHandler from "@utils/ControllerErrorHandler.js";
import { 
    ProductCreationSchema, 
    ProductUpdateSchema, 
    ProductCreationDTO, 
    ProductUpdateDTO 
} from "@economic-control/shared";
import { productService } from "@services/cafeteria/product.service.js";

export const productController = {
  // Obtiene todos los productos (se puede filtrar por query params si se desea)
  allProducts: async (req: Request, res: Response) => {
    try {
      // Opcional: Permitir filtrar activos/inactivos via query string ?is_active=true
      const isActiveQuery = req.query.is_active;
      const filters: any = {};
      
      if (isActiveQuery !== undefined) {
        filters.is_active = isActiveQuery === 'true';
      }

      const products = await productService.getAll(filters);

      return res.status(200).json({
        ok: true,
        message: products.length > 0
            ? "Productos obtenidos correctamente."
            : "No hay productos registrados.",
        data: products,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener los productos.");
    }
  },

  // Obtiene un producto específico
  oneProduct: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string, 10);
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ ok: false, message: "ID de producto inválido." });
      }

      const product = await productService.getOne(id);

      return res.status(200).json({
        ok: true,
        message: "Producto obtenido correctamente.",
        data: product,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al obtener el producto.");
    }
  },

  // Crea un nuevo producto
  createProduct: async (req: Request, res: Response) => {
    try {
      const validationResult = ProductCreationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de nuevo producto inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const productData: ProductCreationDTO = validationResult.data;
      const newProduct = await productService.create(productData);

      return res.status(201).json({
        ok: true,
        message: "Producto creado correctamente.",
        data: newProduct,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al crear el producto.");
    }
  },

  // Actualiza un producto existente
  updateProduct: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (!id || isNaN(id)) {
        return res.status(400).json({ ok: false, message: "ID de producto inválido." });
      }

      const validationResult = ProductUpdateSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          ok: false,
          message: "Datos de actualización inválidos.",
          errors: validationResult.error.issues,
        });
      }

      const updateData: ProductUpdateDTO = validationResult.data;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          ok: false,
          message: "No se proporcionaron datos para actualizar.",
        });
      }

      const updatedProduct = await productService.update(id, updateData);

      return res.status(200).json({
        ok: true,
        message: "Producto actualizado correctamente.",
        data: updatedProduct,
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al actualizar el producto.");
    }
  },

  // Desactiva un producto (Soft Delete)
  deleteProduct: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string, 10);

      if (!id || isNaN(id)) {
        return res.status(400).json({ ok: false, message: "ID de producto inválido." });
      }

      await productService.remove(id);

      return res.status(200).json({
        ok: true,
        message: "Producto desactivado correctamente.",
      });
    } catch (error) {
      return ControllerErrorHandler(res, error, "Error al eliminar el producto.");
    }
  },
};