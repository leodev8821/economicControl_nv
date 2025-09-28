import { CookieOptions } from 'express';

const isProd = process.env.NODE_ENV === 'production';

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProd,                // true en producción con HTTPS
  sameSite: 'lax',              // 'lax' suele ser buen equilibrio;
  path: '/auth/refresh-token',  // limitar el scope a la ruta de refresh (opcional)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
};
