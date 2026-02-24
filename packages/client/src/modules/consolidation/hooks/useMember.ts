import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  getAllMembers,
  getOneMember,
  createMember,
  createBulkMembers,
  updateMember,
  deleteMember,
} from "@modules/consolidation/api/memberApi";
import type {
  Member,
  MemberAttributes,
} from "@modules/consolidation/types/member.type";
import type { MemberCreationRequest } from "@economic-control/shared";

// Clave única para esta consulta.
const MEMBERS_QUERY_KEY = "members";

// Hook para obtener la lista de miembros.
export const useReadMembers = (): UseQueryResult<Member[], Error> => {
  return useQuery<Member[], Error>({
    queryKey: [MEMBERS_QUERY_KEY],
    queryFn: getAllMembers,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener un solo miembro
export const useOneMember = (id: number): UseQueryResult<Member, Error> => {
  return useQuery<Member, Error>({
    queryKey: [MEMBERS_QUERY_KEY],
    queryFn: () => getOneMember(id),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para crear una miembro.
export const useCreateMember = (): UseMutationResult<
  Member,
  Error,
  MemberCreationRequest
> => {
  const queryClient = useQueryClient();

  return useMutation<Member, Error, MemberCreationRequest>({
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY] });
    },
  });
};

// Hook para crear múltiples miembros.
export const useCreateBulkMembers = (): UseMutationResult<
  Member[],
  Error,
  MemberCreationRequest[]
> => {
  const queryClient = useQueryClient();

  return useMutation<Member[], Error, MemberCreationRequest[]>({
    mutationFn: createBulkMembers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY] });
    },
  });
};

// Hook para actualizar una miembro.
export const useUpdateMember = (): UseMutationResult<
  Member,
  Error,
  MemberAttributes
> => {
  const queryClient = useQueryClient();

  return useMutation<Member, Error, MemberAttributes>({
    mutationFn: updateMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY] });
    },
  });
};

// Hook para eliminar una miembro.
export const useDeleteMember = (): UseMutationResult<String, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation<String, Error, number>({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY] });
    },
  });
};
