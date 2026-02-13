import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { getAllRoles } from "../api/roleApi";

export interface Role {
  id: number;
  role_name: string;
}

const ROLES_QUERY_KEY = "db-roles";

export const useRoles = (): UseQueryResult<Role[], Error> => {
  return useQuery<Role[], Error>({
    queryKey: [ROLES_QUERY_KEY],
    queryFn: getAllRoles,
    staleTime: 15 * 60 * 1000,
  });
};
