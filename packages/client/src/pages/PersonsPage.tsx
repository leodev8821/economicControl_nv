import React, { useState } from 'react';
import { usePersons, useCreatePerson, useUpdatePerson, useDeletePerson } from '../hooks/usePerson';
import PersonTable from '../components/tables/PersonTable';
import PersonForm from '../components/forms/PersonForm';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import type { GridRowId } from '@mui/x-data-grid';
import type { Person } from '../types/person.type';
import type { PersonAttributes } from '../types/person.type'; // Assuming attributes are here or import from api if needed
import * as SharedPersonSchemas from '@economic-control/shared';

export const PersonsPage: React.FC = () => {
  const { data: persons = [], isLoading, isError, error } = usePersons();
  const createMutation = useCreatePerson();
  const updateMutation = useUpdatePerson();
  const deleteMutation = useDeletePerson();

  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const handleCreatePerson = (person: SharedPersonSchemas.PersonCreationRequest) => {
    createMutation.mutate(person, {
        onSuccess: () => {
             // Form reset handled in form component or we can add extra logic here
        }
    });
  };

  const handleUpdatePerson = (person: PersonAttributes) => {
    updateMutation.mutate(person, {
        onSuccess: () => {
            setEditingPerson(null);
        }
    });
  };

  const handleFormSubmit = (data: SharedPersonSchemas.PersonCreationRequest) => {
       if (editingPerson) {
           handleUpdatePerson({ ...data, id: editingPerson.id } as PersonAttributes);
       } else {
           handleCreatePerson(data);
       }
  };

  const handleStartEdit = (person: Person) => {
      setEditingPerson(person);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
      setEditingPerson(null);
  };

  const handleDeletePerson = (id: GridRowId) => {
    const personId = parseInt(id.toString());

    if (window.confirm(`¿Está seguro de eliminar la Persona con ID ${personId}? Esta acción es irreversible.`)) {
      deleteMutation.mutate(personId);
    }
  };

  return (
      <Box p={3}>
        {/* Indicador de mutación */}
        {(deleteMutation.isPending || updateMutation.isPending || createMutation.isPending) && (
          <Typography color="primary">
            Realizando acción en el servidor...
          </Typography>
        )}
  
        {/* Mensaje de error de mutación */}
        {(deleteMutation.isError || updateMutation.isError || createMutation.isError) && (
          <Typography color="error.main">
            Error: {deleteMutation.error?.message || updateMutation.error?.message || createMutation.error?.message}
          </Typography>
        )}
  
        <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'background.paper' }}>
          <PersonForm 
             initialValues={editingPerson}
             onSubmit={handleFormSubmit}
             isLoading={createMutation.isPending || updateMutation.isPending}
             isUpdateMode={!!editingPerson}
             onCancel={handleCancelEdit}
          /> 
        </Paper>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Listado de Personas ({persons.length})
          </Typography>
        </Box>
  
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
            <Typography variant="body2">
              Mensaje: {error?.message}
            </Typography>
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
          <PersonTable 
            persons={persons} 
            // Note: Make sure PersonTable accepts onEdit and onDelete. 
            // If the user's existing simple table doesn't have these, I might need to update it too.
            // But for now, assuming standard props or I'll check/fix next.
            // Actually, previously the user just showed <PersonTable persons={persons} />.
            // I should check if PersonTable supports actions. 
            // For now I'll pass them, and if it fails TS check I'll fix the table component next.
             onEdit={handleStartEdit}
             onDelete={handleDeletePerson}
          />
        )}
      </Box>
  );
};