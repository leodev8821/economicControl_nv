import { useEffect, useRef, useState } from "react";
import { parseWithZod } from "@conform-to/zod/v4";

import * as SharedMemberSchemas from "@economic-control/shared";

import {
  useMembers,
  useCreateMember,
  useCreateBulkMembers,
  useUpdateMember,
  useDeleteMember,
} from "@modules/consolidation/hooks/useMember";

import type { Member } from "@modules/consolidation/types/member.type";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export default function useMemberController() {
  const [formKey, setFormKey] = useState(0);
  const { data: members = [], isLoading, isError, error } = useMembers();

  const [draft, setDraft] = useState<any>(null);

  const createMutation = useCreateMember();
  const createBulkMutation = useCreateBulkMembers();
  const updateMutation = useUpdateMember();
  const deleteMutation = useDeleteMember();

  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const { user: currentUser } = useAuth();

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

  useEffect(() => {
    const savedDraft = localStorage.getItem("members_draft");
    if (savedDraft && !editingMember) {
      setDraft(JSON.parse(savedDraft));
      setFormKey((prev) => prev + 1);
    }
  }, [editingMember]);

  const handleClearDraft = () => {
    localStorage.removeItem("members_draft");
    setDraft(null);
    setFormKey((prev) => prev + 1);
    showSnackbar("Borrador eliminado");
  };

  // --- Lógica de Formulario ---
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const submission = parseWithZod(formData, {
      schema: SharedMemberSchemas.BulkMemberSchema,
    });

    if (submission.status !== "success") {
      console.log("Errores de validación:", submission.reply());
      return;
    }

    const payload = submission.value;

    const requiresInvitedBy = ["Amigo/Familiar", "Otro"].includes(
      payload.members[0].how_know_us as string,
    );

    if (requiresInvitedBy && !payload.members[0].invited_by) {
      showSnackbar("Debes indicar quién te refirió", "error");
      return;
    }

    const membersWithUser = payload.members.map((member) => ({
      ...member,
      how_know_us: member.how_know_us || null,
      invited_by: requiresInvitedBy ? member.invited_by?.trim() || null : null,
      user_id: member.user_id || currentUser?.id,
    }));

    // Modo edición → update
    if (editingMember) {
      updateMutation.mutate(
        {
          id: editingMember.id,
          data: {
            ...payload.members[0],
            user_id:
              payload.members[0].user_id ||
              editingMember.user_id ||
              currentUser?.id,
            is_visible:
              payload.members[0].is_visible ?? editingMember.is_visible,
          },
        },
        {
          onSuccess: () => {
            setEditingMember(null);
            setFormKey((prev) => prev + 1);
            showSnackbar("Miembro actualizado correctamente");
          },
          onError: () => showSnackbar("Error al actualizar", "error"),
        },
      );
      return;
    }

    // Modo creación (Bulk o Single)
    createBulkMutation.mutate(
      { members: membersWithUser },
      {
        onSuccess: () => {
          localStorage.removeItem("members_draft");
          //setDraft(null);
          setEditingMember(null);
          setFormKey((prev) => prev + 1);
          showSnackbar("Miembros registrados correctamente");
        },
        onError: () => showSnackbar("Error al guardar", "error"),
      },
    );
  };

  const handleStartEdit = (member: Member) => {
    setEditingMember(member);
    setFormKey((prev) => prev + 1);
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleToggleVisibility = (member: Member) => {
    const isHidden = member.is_visible === false;

    if (isHidden) {
      // 1. Lógica de Restauración (Solo Admin/SuperUser llegarán a este punto visualmente)
      if (
        window.confirm(
          `¿Está seguro de RESTAURAR el Miembro con ID ${member.id}?`,
        )
      ) {
        updateMutation.mutate(
          { id: member.id, data: { is_visible: true } },
          {
            onSuccess: () => showSnackbar("Miembro restaurado correctamente"),
            onError: () => showSnackbar("Error al restaurar", "error"),
          },
        );
      }
    } else {
      // 2. Lógica de Eliminación (Soft-delete)
      if (
        window.confirm(
          `¿Está seguro de ELIMINAR el Miembro con ID ${member.id}?`,
        )
      ) {
        deleteMutation.mutate(
          { id: member.id },
          {
            onSuccess: () => showSnackbar("Miembro eliminado"),
            onError: () => showSnackbar("Error al eliminar", "error"),
          },
        );
      }
    }
  };

  const formInitialValues = editingMember
    ? { members: [editingMember] }
    : draft
      ? draft
      : undefined;

  return {
    currentUser,
    members,
    isLoading,
    isError,
    error,
    draft,
    handleClearDraft,
    formKey,
    setFormKey,
    editingMember,
    setEditingMember,
    formRef,
    snackbar,
    setSnackbar,
    isLoadingMutation:
      createMutation.isPending ||
      createBulkMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    isErrorMutation:
      createMutation.isError ||
      createBulkMutation.isError ||
      updateMutation.isError ||
      deleteMutation.isError,
    handleFormSubmit,
    handleStartEdit,
    handleToggleVisibility,
    formInitialValues,
  };
}
