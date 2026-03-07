import { useRef, useState } from "react";
import { parseWithZod } from "@conform-to/zod/v4";

import * as SharedMemberSchemas from "@economic-control/shared";

import {
  useReadNetworks,
  useCreateNetwork,
  useUpdateNetwork,
  useDeleteNetwork,
} from "./useNetwork";

import type { Network } from "../types/network.type";

export default function useNetworkController() {
  const { data: networks = [] } = useReadNetworks();

  const createMutation = useCreateNetwork();
  const updateMutation = useUpdateNetwork();
  const deleteMutation = useDeleteNetwork();

  const [editingNetwork, setEditingNetwork] = useState<Network | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const submission = parseWithZod(formData, {
      schema: SharedMemberSchemas.NetworkCreationSchema,
    });

    if (submission.status !== "success") return;

    const payload = submission.value;

    if (editingNetwork) {
      updateMutation.mutate(
        { ...payload, id: editingNetwork.id },
        {
          onSuccess: () => {
            setEditingNetwork(null);
            showSnackbar("Red actualizada");
          },
          onError: () => showSnackbar("Error al actualizar", "error"),
        },
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => showSnackbar("Red creada"),
      onError: () => showSnackbar("Error al crear", "error"),
    });
  };

  const startEdit = (network: Network) => {
    setEditingNetwork(network);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const cancelEdit = () => {
    setEditingNetwork(null);
  };

  const toggleVisibility = (network: Network) => {
    if (network.is_visible) {
      updateMutation.mutate(
        { id: network.id, is_visible: false },
        {
          onSuccess: () => showSnackbar("Red inactivada"),
          onError: () => showSnackbar("Error al inactivar", "error"),
        },
      );
    } else {
      updateMutation.mutate(
        { id: network.id, is_visible: true },
        {
          onSuccess: () => showSnackbar("Red restaurada"),
          onError: () => showSnackbar("Error al restaurar", "error"),
        },
      );
    }
  };

  return {
    networks,
    editingNetwork,
    formRef,
    snackbar,
    setSnackbar,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    handleFormSubmit,
    startEdit,
    cancelEdit,
    toggleVisibility,
  };
}
