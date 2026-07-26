import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { billDetailsApi } from "@modules/cafeteria/api/bill-detailApi";
import { CafeteriaQueryKeys } from "@/core/api/queryKeys";
import type {
  BillDetailType,
  BillDetailCreationDTO,
  BillDetailUpdateDTO,
} from "@economic-control/shared";

// Hook para obtener la lista de detalle de facturas.
export const useBillDetails = (): UseQueryResult<BillDetailType[], Error> => {
  return useQuery<BillDetailType[], Error>({
    queryKey: CafeteriaQueryKeys.bill_details.all(),
    queryFn: () => billDetailsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener un solo detalle de factura
export const useBillDetail = (id: number): UseQueryResult<BillDetailType, Error> => {
  return useQuery<BillDetailType, Error>({
    queryKey: CafeteriaQueryKeys.bill_details.one(id),
    queryFn: () => billDetailsApi.getById(id),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para crear un detalle de factura.
export const useCreateBillDetail = (): UseMutationResult<
  BillDetailType,
  Error,
  BillDetailCreationDTO
> => {
  const queryClient = useQueryClient();
  return useMutation<BillDetailType, Error, BillDetailCreationDTO>({
    mutationFn: (data: BillDetailCreationDTO) => billDetailsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.bill_details.all(),
      });
    },
  });
};

// Hook para actualizar un detalle de factura.
export const useUpdateBillDetail = (): UseMutationResult<
  BillDetailType,
  Error,
  { id: number; data: BillDetailUpdateDTO }
> => {
  const queryClient = useQueryClient();

  return useMutation<BillDetailType, Error, { id: number; data: BillDetailUpdateDTO }>({
    mutationFn: ({ id, data }: { id: number; data: BillDetailUpdateDTO }) =>
      billDetailsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.bill_details.one(id),
      });
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.bill_details.all(),
      });
    },
  });
};

// Hook para eliminar un detalle de factura.
export const useDeleteBillDetail = (): UseMutationResult<
  { message: string },
  Error,
  { id: number }
> => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { id: number }>({
    mutationFn: ({ id }: { id: number }) => billDetailsApi.remove(id),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.bill_details.one(id),
      });
      queryClient.invalidateQueries({
        queryKey: CafeteriaQueryKeys.bill_details.all(),
      });
    },
  });
};
