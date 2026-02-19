export const API_ROUTES_PATH: Record<string, string> = {
  ADMIN: "/admin",
  AUTH: "/auth",
  CONSOLIDATION: "/consolidation",
  FINANCE: "/finance",
};

export const PERMISSION_REDIRECTS: Record<string, string> = {
  LOGIN: API_ROUTES_PATH.AUTH + "/login",
  FORGOT_PASSWORD: API_ROUTES_PATH.AUTH + "/forgot-password",
  RESET_PASSWORD: API_ROUTES_PATH.AUTH + "/reset-password",
  ALL: API_ROUTES_PATH.ADMIN + "/home",
  FINANCE: API_ROUTES_PATH.FINANCE + "/dashboard",
  CONSOLIDATION: API_ROUTES_PATH.CONSOLIDATION + "/home",
};

export const UNAUTHORIZED = "/unauthorized";
