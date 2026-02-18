import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncBalances } from "../api/adminApi";
import { BALANCE_QUERY_KEY } from "./useBalance";

export const useSyncBalances = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncBalances,
    onSuccess: () => {
      // Al terminar con éxito, invalidamos el cache del balance
      // para que el Dashboard se refresque con los nuevos saldos.
      queryClient.invalidateQueries({ queryKey: [BALANCE_QUERY_KEY] });
      alert("Saldos sincronizados correctamente.");
    },
    onError: (error: any) => {
      console.error("Error al sincronizar:", error);
      alert("Hubo un error al sincronizar los saldos.");
    },
  });
};
