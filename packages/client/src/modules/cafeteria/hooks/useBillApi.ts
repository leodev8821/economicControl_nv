import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { billsApi } from "@modules/cafeteria/api/billApi";
import { CafeteriaQueryKeys } from "@/core/api/queryKeys";
import type {
  BillType,
  BillCreationDTO,
  BillUpdateDTO,
} from "@economic-control/shared";

// Hook para obtener la lista facturas.
export const useBills = (): UseQueryResult<BillType[], Error> => {
  return useQuery<BillType[], Error>({
    queryKey: CafeteriaQueryKeys.bills.all(),
    queryFn: () => billsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener una solo factura
export const useBill = (id: number): UseQueryResult<BillType, Error> => {
  return useQuery<BillType, Error>({
    queryKey: CafeteriaQueryKeys.bills.one(id),
    queryFn: () => billsApi.getById(id),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para crear una factura.
export const useCreateBill = (): UseMutationResult<
  BillType,
  Error,
  BillCreationDTO
> => {
  const queryClient = useQueryClient();
  return useMutation<BillType, Error, BillCreationDTO>({
    mutationFn: (data: BillCreationDTO) => billsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.bills.all(),
      });
    },
  });
};

// Hook para actualizar una factura.
export const useUpdateBill = (): UseMutationResult<
  BillType,
  Error,
  { id: number; data: BillUpdateDTO }
> => {
  const queryClient = useQueryClient();

  return useMutation<BillType, Error, { id: number; data: BillUpdateDTO }>({
    mutationFn: ({ id, data }: { id: number; data: BillUpdateDTO }) =>
      billsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.bills.one(id),
      });
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.bills.all(),
      });
    },
  });
};

// Hook para eliminar una factura.
export const useDeleteBill = (): UseMutationResult<
  { message: string },
  Error,
  { id: number }
> => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { id: number }>({
    mutationFn: ({ id }: { id: number }) => billsApi.remove(id),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.bills.one(id),
      });
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.bills.all(),
      });
    },
  });
};
