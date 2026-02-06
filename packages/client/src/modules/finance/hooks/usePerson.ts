import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import {
  getAllPersons,
  createPerson,
  updatePerson,
  deletePerson,
} from "@modules/finance/api/personApi";
import type {
  Person,
  PersonAttributes,
} from "@modules/finance/types/person.type";
import type { PersonCreationRequest } from "@economic-control/shared";

// Clave única para esta consulta.
const PERSONS_QUERY_KEY = "persons";

// Hook para obtener la lista de personas.
export const usePersons = (): UseQueryResult<Person[], Error> => {
  return useQuery<Person[], Error>({
    queryKey: [PERSONS_QUERY_KEY],
    queryFn: getAllPersons,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para crear una persona.
export const useCreatePerson = (): UseMutationResult<
  Person,
  Error,
  PersonCreationRequest
> => {
  const queryClient = useQueryClient();

  return useMutation<Person, Error, PersonCreationRequest>({
    mutationFn: createPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PERSONS_QUERY_KEY] });
    },
  });
};

// Hook para actualizar una persona.
export const useUpdatePerson = (): UseMutationResult<
  Person,
  Error,
  PersonAttributes
> => {
  const queryClient = useQueryClient();

  return useMutation<Person, Error, PersonAttributes>({
    mutationFn: updatePerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PERSONS_QUERY_KEY] });
    },
  });
};

// Hook para eliminar una persona.
export const useDeletePerson = (): UseMutationResult<Person, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation<Person, Error, number>({
    mutationFn: deletePerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PERSONS_QUERY_KEY] });
    },
  });
};
