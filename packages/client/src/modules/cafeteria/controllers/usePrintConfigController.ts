import { useState } from "react";
import {
  usePrintConfigs,
  useUpdatePrintConfig,
} from "@modules/cafeteria/hooks/usePrintConfigApi";
import type {
  PrintConfigType,
  PrintConfigUpdateDTO,
} from "@economic-control/shared";

export default function usePrintConfigController() {
  const { data: printConfigs = [], isLoading, isError, error } = usePrintConfigs();
  const updateMutation = useUpdatePrintConfig();

  const [editingPrintConfig, setEditingPrintConfig] = useState<PrintConfigType | null>(null);

  const handleUpdatePrintConfig = (id: number, configData: PrintConfigUpdateDTO) => {
    updateMutation.mutate(
      { id, data: configData },
      {
        onSuccess: () => {
          setEditingPrintConfig(null);
        },
      }
    );
  };

  const handleFormSubmit = (data: PrintConfigUpdateDTO) => {
    if (editingPrintConfig && editingPrintConfig.id) {          //REVISAR
      handleUpdatePrintConfig(editingPrintConfig.id, data);
    }
  };

  const startEdit = (config: PrintConfigType) => {
    setEditingPrintConfig(config);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingPrintConfig(null);
  };

  const isActionPending = updateMutation.isPending;
  const actionError = updateMutation.error?.message;

  return {
    printConfigs,
    isLoading,
    isError,
    error,
    editingPrintConfig,
    isActionPending,
    actionError,
    handleFormSubmit,
    startEdit,
    cancelEdit,
  };
}