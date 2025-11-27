import type { Response } from "express";

/**
 * Función genérica para manejar errores en los controladores.
 */
const ControllerErrorHandler = (
  res: Response,
  error: unknown,
  message: string
) => {
  if (error instanceof Error) {
    return res.status(500).json({
      ok: false,
      message: message || "Ocurrió un error al procesar la solicitud.",
      error: error.message,
    });
  }

  return res.status(500).json({
    ok: false,
    message: message || "Ocurrió un error al procesar la solicitud.",
    error: "Error desconocido del servidor",
  });
};

export default ControllerErrorHandler;
