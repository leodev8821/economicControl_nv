import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { memberApi } from "@modules/consolidation/api/memberApi";
import { ConsolidationQueryKeys } from "@/core/api/queryKeys";
import type {
  MemberType,
  MemberCreateDTO,
  BulkMemberCreateDTO,
  MemberUpdateDTO,
} from "@economic-control/shared";

// Hook para obtener la lista de miembros.
export const useMembers = (): UseQueryResult<MemberType[], Error> => {
  return useQuery<MemberType[], Error>({
    queryKey: ConsolidationQueryKeys.members.all(),
    queryFn: () => memberApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener un solo miembro
export const useMember = (id: number): UseQueryResult<MemberType, Error> => {
  return useQuery<MemberType, Error>({
    queryKey: ConsolidationQueryKeys.members.one(id),
    queryFn: () => memberApi.getById(id),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para crear una miembro.
export const useCreateMember = (): UseMutationResult<
  MemberType,
  Error,
  MemberCreateDTO
> => {
  const queryClient = useQueryClient();
  return useMutation<MemberType, Error, MemberCreateDTO>({
    mutationFn: (data: MemberCreateDTO) => memberApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.members.all(),
      });
    },
  });
};

// Hook para crear múltiples miembros.
export const useCreateBulkMembers = (): UseMutationResult<
  MemberType[],
  Error,
  BulkMemberCreateDTO[]
> => {
  const queryClient = useQueryClient();

  return useMutation<MemberType[], Error, BulkMemberCreateDTO[]>({
    mutationFn: (data: BulkMemberCreateDTO[]) => memberApi.createBulk(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.members.all(),
      });
    },
  });
};

// Hook para actualizar una miembro.
export const useUpdateMember = (): UseMutationResult<
  MemberType,
  Error,
  { id: number; data: MemberUpdateDTO }
> => {
  const queryClient = useQueryClient();

  return useMutation<MemberType, Error, { id: number; data: MemberUpdateDTO }>({
    mutationFn: ({ id, data }: { id: number; data: MemberUpdateDTO }) =>
      memberApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.members.one(id),
      });
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.members.all(),
      });
    },
  });
};

// Hook para eliminar una miembro.
export const useDeleteMember = (): UseMutationResult<
  { message: string },
  Error,
  { id: number }
> => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { id: number }>({
    mutationFn: ({ id }: { id: number }) => memberApi.remove(id),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.members.one(id),
      });
      queryClient.invalidateQueries({
        queryKey: ConsolidationQueryKeys.members.all(),
      });
    },
  });
};
