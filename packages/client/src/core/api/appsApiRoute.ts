export const API_ROUTES_PATH: Record<string, string> = {
  ADMIN: "/admin",
  AUTH: "/auth",
  CONSOLIDATION: "/consolidation",
  FINANCE: "/finance",
};

export const PERMISSION_REDIRECTS: Record<string, string> = {
  LOGIN: API_ROUTES_PATH.AUTH + "/login",
  ALL: API_ROUTES_PATH.ADMIN + "/home",
  FINANCE: API_ROUTES_PATH.FINANCE + "/dashboard",
  CONSOLIDATION: API_ROUTES_PATH.CONSOLIDATION + "/home",
};

export const UNAUTHORIZED = "/unauthorized";
