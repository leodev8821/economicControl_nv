/* import { Request } from "express";
import * as cookieParser from "cookie-parser";
import { UserRole } from "../models/user.model.js";
import { JwtPayload } from "src/auth/auth.types.js";

export interface AuthenticatedUser {
  id: number;
  username: string;
  role_name: string;
  permissions?: any[];
}

// Sobreescribe el módulo 'express' para añadir tus propiedades personalizadas
declare global {
  namespace Express {
    interface Request {
      cookies: cookieParser.CookieJar | { [key: string]: string };
      user?: AuthenticatedUser;
      userPayload?: any;
    }
  }
} */
import { Request } from "express";
import * as cookieParser from "cookie-parser";
import { JwtPayload } from "../auth/auth.types.js";
import { UserRole } from "../models/auth/user.model.js";

declare global {
  namespace Express {
    interface Request {
      cookies: cookieParser.CookieJar | { [key: string]: string };

      user?: JwtPayload & { permissions: any[] };
      userPayload?: JwtPayload;

      id?: number;
      userRole?: UserRole;
    }
  }
}
