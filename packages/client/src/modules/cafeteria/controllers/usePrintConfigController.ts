import {
  usePrintConfig, // Cambiado: Ahora importamos el hook Singleton
  useUpdatePrintConfig,
} from "@modules/cafeteria/hooks/usePrintConfigApi";
import type {
  PrintConfigUpdateDTO,
} from "@economic-control/shared";

export default function usePrintConfigController() {
  // Cambiado: Recibimos directamente el objeto (ya no es un array)
  const { data: currentConfig, isLoading, isError, error } = usePrintConfig();
  const updateMutation = useUpdatePrintConfig();

  // Función directa y simplificada para actualizar pasando el ID
  const handleUpdatePrintConfig = (id: number, configData: PrintConfigUpdateDTO, onSuccessCallback?: () => void) => {
    updateMutation.mutate(
      { id, data: configData },
      {
        onSuccess: () => {
          if (onSuccessCallback) {
            onSuccessCallback();
          }
        },
      }
    );
  };

  const isActionPending = updateMutation.isPending;
  const actionError = updateMutation.error?.message;

  return {
    currentConfig, // Exportamos la configuración única para la vista
    isLoading,
    isError,
    error,
    isActionPending,
    actionError,
    handleUpdatePrintConfig,
  };
}