import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { productsApi } from "@modules/cafeteria/api/productApi";
import { CafeteriaQueryKeys } from "@/core/api/queryKeys";
import type {
  ProductType,
  ProductCreationDTO,
  ProductUpdateDTO,
} from "@economic-control/shared";

// Hook para obtener la lista de productos.
export const useProducts = (): UseQueryResult<ProductType[], Error> => {
  return useQuery<ProductType[], Error>({
    queryKey: CafeteriaQueryKeys.products.all(),
    queryFn: () => productsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener un solo producto
export const useProduct = (id: number): UseQueryResult<ProductType, Error> => {
  return useQuery<ProductType, Error>({
    queryKey: CafeteriaQueryKeys.products.one(id),
    queryFn: () => productsApi.getById(id),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para crear un producto.
export const useCreateProduct = (): UseMutationResult<
  ProductType,
  Error,
  ProductCreationDTO
> => {
  const queryClient = useQueryClient();
  return useMutation<ProductType, Error, ProductCreationDTO>({
    mutationFn: (data: ProductCreationDTO) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.products.all(),
      });
    },
  });
};

// Hook para actualizar un producto.
export const useUpdateProduct = (): UseMutationResult<
  ProductType,
  Error,
  { id: number; data: ProductUpdateDTO }
> => {
  const queryClient = useQueryClient();

  return useMutation<ProductType, Error, { id: number; data: ProductUpdateDTO }>({
    mutationFn: ({ id, data }: { id: number; data: ProductUpdateDTO }) =>
      productsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.products.one(id),
      });
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.products.all(),
      });
    },
  });
};

// Hook para eliminar un producto.
export const useDeleteProduct = (): UseMutationResult<
  { message: string },
  Error,
  { id: number }
> => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { id: number }>({
    mutationFn: ({ id }: { id: number }) => productsApi.remove(id),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.products.one(id),
      });
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.products.all(),
      });
    },
  });
};
