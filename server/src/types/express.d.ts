import { Request } from 'express';
import { UserRole } from '../models/user.model';

// Sobreescribe el módulo 'express' para añadir tus propiedades personalizadas
declare global {
  namespace Express {
    interface Request {
      id?: number;
      username?: string;
      first_name?: string;
      last_name?: string;
      userRole?: UserRole;
    }
  }
}