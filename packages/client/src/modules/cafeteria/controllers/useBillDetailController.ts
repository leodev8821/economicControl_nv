import { useState } from "react";
import {
  useBillDetails,
  useCreateBillDetail,
  useUpdateBillDetail,
  useDeleteBillDetail,
} from "@modules/cafeteria/hooks/useBillDetailsApi"; 
import type {
  BillDetailType,
  BillDetailCreationDTO,
  BillDetailUpdateDTO,
} from "@economic-control/shared";

export default function useBillDetailController() {
  const { data: billDetails = [], isLoading, isError, error } = useBillDetails();
  const createMutation = useCreateBillDetail();
  const updateMutation = useUpdateBillDetail();
  const deleteMutation = useDeleteBillDetail();

  const [editingBillDetail, setEditingBillDetail] = useState<BillDetailType | null>(null);

  const handleCreateBillDetail = (detail: BillDetailCreationDTO) => {
    createMutation.mutate(detail);
  };

  const handleUpdateBillDetail = (id: number, detailData: BillDetailUpdateDTO) => {
    updateMutation.mutate(
      { id, data: detailData },
      {
        onSuccess: () => {
          setEditingBillDetail(null);
        },
      }
    );
  };

  const handleFormSubmit = (data: BillDetailCreationDTO | BillDetailUpdateDTO) => {
    if (editingBillDetail && editingBillDetail.id) {            //REVISAR
      handleUpdateBillDetail(editingBillDetail.id, data as BillDetailUpdateDTO);
    } else {
      handleCreateBillDetail(data as BillDetailCreationDTO);
    }
  };

  const startEdit = (detail: BillDetailType) => {
    setEditingBillDetail(detail);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingBillDetail(null);
  };

  const deleteBillDetail = (id: number) => {
    if (window.confirm(`¿Está seguro de eliminar el Detalle con ID ${id}?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const isActionPending =
    deleteMutation.isPending || updateMutation.isPending || createMutation.isPending;

  const actionError =
    deleteMutation.error?.message ||
    updateMutation.error?.message ||
    createMutation.error?.message;

  return {
    billDetails,
    isLoading,
    isError,
    error,
    editingBillDetail,
    isActionPending,
    actionError,
    handleFormSubmit,
    startEdit,
    cancelEdit,
    deleteBillDetail,
  };
}