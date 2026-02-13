import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { getAllApplications } from "../api/appApi";

export interface Application {
  id: number;
  app_name: string;
  description: string | null;
}

const APPLICATIONS_QUERY_KEY = "applications";

export const useApplications = (): UseQueryResult<Application[], Error> => {
  return useQuery<Application[], Error>({
    queryKey: [APPLICATIONS_QUERY_KEY],
    queryFn: getAllApplications,
    staleTime: 10 * 60 * 1000,
  });
};
