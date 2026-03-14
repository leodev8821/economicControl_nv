import { typedApiClient } from "./typedApiClient";

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type SortParams = {
  sortBy?: string;
  order?: "asc" | "desc";
};

export type SearchParams = {
  search?: string;
};

export type QueryParams<Filters = {}> = Filters &
  PaginationParams &
  SortParams &
  SearchParams;

/**
 * Factory para crear APIs CRUD genéricas.
 */
export function createCrudApi<
  Entity,
  CreateDTO = Partial<Entity>,
  UpdateDTO = Partial<Entity>,
  Filters = {},
  BulkCreateDTO = Partial<Entity>,
>(baseUrl: string) {
  return {
    getAll: async (params?: QueryParams<Filters>): Promise<Entity[]> => {
      return typedApiClient.get<Entity[]>(baseUrl, params);
    },

    getById: async (id: number): Promise<Entity> => {
      return typedApiClient.get<Entity>(`${baseUrl}/${id}`);
    },

    create: async (data: CreateDTO): Promise<Entity> => {
      return typedApiClient.post<Entity, CreateDTO>(baseUrl, data);
    },

    createBulk: async (data: BulkCreateDTO[]): Promise<Entity[]> => {
      return typedApiClient.post<Entity[], BulkCreateDTO[]>(
        `${baseUrl}/bulk`,
        data,
      );
    },

    update: async (id: number, data: UpdateDTO): Promise<Entity> => {
      return typedApiClient.put<Entity, UpdateDTO>(`${baseUrl}/${id}`, data);
    },

    remove: async (id: number): Promise<{ message: string }> => {
      return typedApiClient.delete<{ message: string }>(`${baseUrl}/${id}`);
    },
  };
}
