// @shared/constants/apps.ts
export const APPS = {
  ALL: 1,
  FINANCE: 2,
  CONSOLIDATION: 3,
} as const;

// 1. Definimos los pesos de los roles para filtrar
export const ROLE_WEIGHTS: Record<string, number> = {
  SuperUser: 99,
  Administrador: 40,
  Lider: 20,
  Miembro: 10,
};
