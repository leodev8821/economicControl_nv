import { useState } from "react";
import {
  useBills,
  useCreateBill,
  useUpdateBill,
  useDeleteBill,
} from "@modules/cafeteria/hooks/useBillApi";
import type {
  BillType,
  BillCreationDTO,
  BillUpdateDTO,
} from "@economic-control/shared";

// Definimos el tipo de opciones para callbacks opcionales
interface ActionOptions {
  onSuccess?: (data?: any) => void;
}

export default function useBillController() {
  const { data: bills = [], isLoading, isError, error } = useBills();
  const createMutation = useCreateBill();
  const updateMutation = useUpdateBill();
  const deleteMutation = useDeleteBill();

  const [editingBill, setEditingBill] = useState<BillType | null>(null);

  const handleCreateBill = (bill: BillCreationDTO, options?: ActionOptions) => {
  createMutation.mutate(bill, {
    onSuccess: (responseData) => {
      options?.onSuccess?.(responseData);
    },
  });
};

  const handleUpdateBill = (
    id: number,
    billData: BillUpdateDTO,
    options?: ActionOptions
  ) => {
    updateMutation.mutate(
      { id, data: billData },
      {
        onSuccess: () => {
          setEditingBill(null);
          options?.onSuccess?.();
        },
      }
    );
  };

  const handleFormSubmit = (
    data: BillCreationDTO | BillUpdateDTO,
    options?: ActionOptions
  ) => {
    if (editingBill && editingBill.id) {
      handleUpdateBill(editingBill.id, data as BillUpdateDTO, options);
    } else {
      handleCreateBill(data as BillCreationDTO, options);
    }
  };

  const startEdit = (bill: BillType) => {
    setEditingBill(bill);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingBill(null);
  };

  const deleteBill = (id: number) => {
    if (
      window.confirm(
        `¿Está seguro de eliminar la Factura con ID ${id}? Esta acción es irreversible.`
      )
    ) {
      deleteMutation.mutate({ id });
    }
  };

  const isActionPending =
    deleteMutation.isPending ||
    updateMutation.isPending ||
    createMutation.isPending;

  const actionError =
    deleteMutation.error?.message ||
    updateMutation.error?.message ||
    createMutation.error?.message;

  return {
    bills,
    isLoading,
    isError,
    error,
    editingBill,
    isActionPending,
    actionError,
    handleFormSubmit,
    startEdit,
    cancelEdit,
    deleteBill,
  };
}