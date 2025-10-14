import { CookieOptions } from 'express';

const isProd = process.env.NODE_ENV === 'production';

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProd,                // true en producción con HTTPS
  sameSite: 'lax',              // 'lax' suele ser buen equilibrio;
  path: '/',                   // Cookie válida para toda la web
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
};
