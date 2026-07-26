import { useState } from "react";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@modules/cafeteria/hooks/useProductApi";
import type {
  ProductType,
  ProductCreationDTO,
  ProductUpdateDTO,
} from "@economic-control/shared";

export default function useProductController() {
  const { data: products = [], isLoading, isError, error } = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);

  const handleCreateProduct = (product: ProductCreationDTO) => {
    createMutation.mutate(product);
  };

  const handleUpdateProduct = (id: number, productData: ProductUpdateDTO) => {
    updateMutation.mutate(
      { id, data: productData },
      {
        onSuccess: () => {
          setEditingProduct(null);
        },
      }
    );
  };

  const handleFormSubmit = (data: ProductCreationDTO | ProductUpdateDTO) => {
    if (editingProduct && editingProduct.id) {            //REVISAR
      handleUpdateProduct(editingProduct.id, data as ProductUpdateDTO);
    } else {
      handleCreateProduct(data as ProductCreationDTO);
    }
  };

  const startEdit = (product: ProductType) => {
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
  };

  const deleteProduct = (id: number) => {
    if (window.confirm(`¿Está seguro de eliminar el Producto con ID ${id}? Esta acción es irreversible.`)) {
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
    products,
    isLoading,
    isError,
    error,
    editingProduct,
    isActionPending,
    actionError,
    handleFormSubmit,
    startEdit,
    cancelEdit,
    deleteProduct,
  };
}