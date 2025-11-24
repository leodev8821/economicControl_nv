import { Request } from "express";
import { UserRole } from "../models/user.model.ts";
import * as cookieParser from "cookie-parser";

// Sobreescribe el módulo 'express' para añadir tus propiedades personalizadas
declare global {
  namespace Express {
    interface Request {
      cookies: cookieParser.CookieJar | { [key: string]: string };
      id?: number;
      username?: string;
      first_name?: string;
      last_name?: string;
      userRole?: UserRole;
    }
  }
}
