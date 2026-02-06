import React, { useState } from "react";
import type { GridRowId } from "@mui/x-data-grid";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import {
  usePersons,
  useCreatePerson,
  useUpdatePerson,
  useDeletePerson,
} from "@modules/finance/hooks/usePerson";
import PersonTable from "@modules/finance/components/tables/PersonTable";
import PersonForm from "@modules/finance/components/forms/PersonForm";
import type { Person } from "@modules/finance/types/person.type";
import type { PersonAttributes } from "@modules/finance/types/person.type";
import * as SharedPersonSchemas from "@economic-control/shared";

export const PersonsPage: React.FC = () => {
  const { data: persons = [], isLoading, isError, error } = usePersons();
  const createMutation = useCreatePerson();
  const updateMutation = useUpdatePerson();
  const deleteMutation = useDeletePerson();

  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const handleCreatePerson = (
    person: SharedPersonSchemas.PersonCreationRequest,
  ) => {
    createMutation.mutate(person, {
      onSuccess: () => {
        // Form reset handled in form component or we can add extra logic here
      },
    });
  };

  const handleUpdatePerson = (person: PersonAttributes) => {
    updateMutation.mutate(person, {
      onSuccess: () => {
        setEditingPerson(null);
      },
    });
  };

  const handleFormSubmit = (
    data: SharedPersonSchemas.PersonCreationRequest,
  ) => {
    if (editingPerson) {
      handleUpdatePerson({ ...data, id: editingPerson.id } as PersonAttributes);
    } else {
      handleCreatePerson(data);
    }
  };

  const handleStartEdit = (person: Person) => {
    setEditingPerson(person);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingPerson(null);
  };

  const handleDeletePerson = (id: GridRowId) => {
    const personId = parseInt(id.toString());

    if (
      window.confirm(
        `¿Está seguro de eliminar la Persona con ID ${personId}? Esta acción es irreversible.`,
      )
    ) {
      deleteMutation.mutate(personId);
    }
  };

  return (
    <Box p={3}>
      {/* Indicador de mutación */}
      {(deleteMutation.isPending ||
        updateMutation.isPending ||
        createMutation.isPending) && (
        <Typography color="primary">
          Realizando acción en el servidor...
        </Typography>
      )}

      {/* Mensaje de error de mutación */}
      {(deleteMutation.isError ||
        updateMutation.isError ||
        createMutation.isError) && (
        <Typography color="error.main">
          Error:{" "}
          {deleteMutation.error?.message ||
            updateMutation.error?.message ||
            createMutation.error?.message}
        </Typography>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: "background.paper" }}>
        <PersonForm
          initialValues={editingPerson}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          isUpdateMode={!!editingPerson}
          onCancel={handleCancelEdit}
        />
      </Paper>

      {/* Loading State */}
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress />
          <Typography variant="h6" ml={2}>
            Cargando listado de personas...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <Box p={3} color="error.main">
          <Typography variant="h6" gutterBottom>
            Error al cargar personas
          </Typography>
          <Typography variant="body2">Mensaje: {error?.message}</Typography>
        </Box>
      )}

      {/* Empty State */}
      {!isLoading && !isError && persons.length === 0 && (
        <Typography variant="body1">
          No hay personas creadas en este momento.
        </Typography>
      )}

      {/* Table */}
      {!isLoading && !isError && persons.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            p: 1,
            borderRadius: 2,
            width: "100%",
            maxWidth: "1200px",
            mx: "auto",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h4">
              Listado de Personas ({persons.length})
            </Typography>
          </Box>
          <PersonTable
            persons={persons}
            onEdit={handleStartEdit}
            onDelete={handleDeletePerson}
          />
        </Paper>
      )}
    </Box>
  );
};
