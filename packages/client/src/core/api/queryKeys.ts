/**
 * Definición de claves de consulta para React Query en Auth.
 */
export const AuthQueryKeys = {
  users: {
    all: () => ["users"] as const,
    one: (id: number) => ["users", id] as const,
  },
};

/**
 * Definición de claves de consulta para React Query en Consolidation.
 */
export const ConsolidationQueryKeys = {
  consolidations: {
    all: () => ["consolidations"] as const,
    one: (id: number) => ["consolidations", id] as const,
  },
  members: {
    all: () => ["members"] as const,
    one: (id: number) => ["members", id] as const,
  },
  networks: {
    all: () => ["networks"] as const,
    one: (id: number) => ["networks", id] as const,
  },
};

/**
 * Definición de claves de consulta para React Query en Finance.
 */
export const FinanceQueryKeys = {
  finances: {
    all: () => ["finances"] as const,
    one: (id: number) => ["finances", id] as const,
  },
};
