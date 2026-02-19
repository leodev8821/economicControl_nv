import nodemailer from "nodemailer";

console.log("Configuración de Mail:", {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS ? "****" : "VACÍO",
});

// Configuramos el "transporte" (el servidor que envía el correo)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para puerto 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Añadimos esto para evitar problemas de certificados en local
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Función genérica para enviar correos
 */
export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"NV Control" <${process.env.EMAIL_USER}>`, // Remitente
      to, // Destinatario
      subject, // Asunto
      html, // Cuerpo del correo en HTML
    });

    console.log("Correo enviado exitosamente: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw new Error("No se pudo enviar el correo electrónico");
  }
};
