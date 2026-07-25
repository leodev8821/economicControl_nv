import { Router } from "express";
import multer from "multer";

// Importación de Schemas de validación
import {
  ProductCreationSchema,
  ProductUpdateSchema,
  BillCreationSchema
} from "@economic-control/shared";

// Importación de Middlewares
import { validate } from "@middlewares/validate.middleware.js";
//import { requireRole } from "@middlewares/auth.middleware.js"; // Por si deseas proteger rutas luego

// Importación de Controladores
import { productController } from "@controllers/cafeteria/product.controller.js";
import { billController } from "@controllers/cafeteria/bill.controller.js";
import { billDetailController } from "@controllers/cafeteria/bill-detail.controller.js";
import { printConfigController } from "@controllers/cafeteria/print-config.controller.js";

const router: Router = Router();

// =================================================================
// ☕ PRODUCTOS (PRODUCTS)
// =================================================================
router.get("/products", productController.allProducts);
router.get("/products/:id", productController.oneProduct);

router.post(
  "/products",
  validate(ProductCreationSchema),
  productController.createProduct
);

router.put(
  "/products/:id",
  validate(ProductUpdateSchema),
  productController.updateProduct
);

// Borrado lógico
router.delete("/products/:id", productController.deleteProduct);


// =================================================================
// 🧾 FACTURAS / TICKETS (BILLS)
// =================================================================
router.get("/bills", billController.allBills);
router.get("/bills/:id", billController.oneBill);

// Checkout (Aquí delegamos toda la lógica matemática al servicio)
router.post(
  "/bills",
  validate(BillCreationSchema),
  billController.createBill
);

// Generalmente las facturas no se editan para mantener integridad fiscal, 
// pero dejamos habilitada la anulación (borrado)
router.delete("/bills/:id", billController.deleteBill);


// =================================================================
// 📝 DETALLES DE FACTURA (BILL DETAILS)
// =================================================================
// Rutas de lectura para reportes y analíticas
router.get("/bill-details", billDetailController.allDetails);
router.get("/bill-details/:id", billDetailController.oneDetail);

// Obtener todos los detalles de un ticket específico
router.get("/bills/:billId/details", billDetailController.detailsByBill);


// =================================================================
// ⚙️ CONFIGURACIÓN DE IMPRESIÓN Y MULTER
// =================================================================

// Configuración de Multer para almacenar archivos en memoria (Buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // Límite de 2MB por imagen para proteger el servidor
  },
});

// Definimos los campos que esperamos recibir
const cpUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'qr', maxCount: 1 }
]);

// =================================================================
// 🖨️ RUTAS DE PRINT CONFIG
// =================================================================

// Obtener la configuración actual (generalmente un solo registro)
router.get("/print-config", printConfigController.getConfig);

// Inicializar la configuración (Ideal para la primera vez que arranca el sistema)
router.post("/print-config/init", printConfigController.initializeConfig);

// Actualizar la configuración 
// Pasamos por el middleware `cpUpload` antes de llegar al controlador
router.put(
  "/print-config",
  cpUpload,
  printConfigController.updateConfig
);

// Obtener solo las banderas rápidas para las facturas (Optimizado para el frontend)
router.get("/print-config/flags", printConfigController.getFacturaFlags);

export default router;