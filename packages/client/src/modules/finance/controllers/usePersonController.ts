import { useState } from "react";
import {
  usePersons,
  useCreatePerson,
  useUpdatePerson,
  useDeletePerson,
} from "@modules/finance/hooks/usePerson";
import type { Person, PersonAttributes } from "@modules/finance/types/person.type";
import * as SharedPersonSchemas from "@economic-control/shared";

export default function usePersonController() {
  const { data: persons = [], isLoading, isError, error } = usePersons();
  const createMutation = useCreatePerson();
  const updateMutation = useUpdatePerson();
  const deleteMutation = useDeletePerson();

  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const handleCreatePerson = (person: SharedPersonSchemas.PersonCreationDTO) => {
    createMutation.mutate(person);
  };

  const handleUpdatePerson = (person: PersonAttributes) => {
    updateMutation.mutate(person, {
      onSuccess: () => {
        setEditingPerson(null);
      },
    });
  };

  const handleFormSubmit = (data: SharedPersonSchemas.PersonCreationDTO) => {
    if (editingPerson) {
      handleUpdatePerson({ ...data, id: editingPerson.id } as PersonAttributes);
    } else {
      handleCreatePerson(data);
    }
  };

  const startEdit = (person: Person) => {
    setEditingPerson(person);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingPerson(null);
  };

  const deletePerson = (id: number) => {
    if (
      window.confirm(
        `¿Está seguro de eliminar la Persona con ID ${id}? Esta acción es irreversible.`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  // Centralizamos los estados de carga y error para simplificar la UI
  const isActionPending =
    deleteMutation.isPending || updateMutation.isPending || createMutation.isPending;

  const actionError =
    deleteMutation.error?.message ||
    updateMutation.error?.message ||
    createMutation.error?.message;

  return {
    persons,
    isLoading,
    isError,
    error,
    editingPerson,
    isActionPending,
    actionError,
    handleFormSubmit,
    startEdit,
    cancelEdit,
    deletePerson,
  };
}