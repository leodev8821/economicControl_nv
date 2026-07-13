import React from "react";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import PersonTable from "@modules/finance/components/tables/PersonTable";
import PersonForm from "@modules/finance/components/forms/PersonForm";
import usePersonController from "../hooks/usePersonController"; // Ajusta la ruta según tu proyecto

const PersonsPage: React.FC = () => {
  const controller = usePersonController();

  return (
    <Box p={{ xs: 1, sm: 2, md: 3 }}>
      {/* Estado de Mutaciones pendientes en servidor */}
      {controller.isActionPending && (
        <Typography color="primary" sx={{ mb: 2 }}>
          Realizando acción en el servidor...
        </Typography>
      )}

      {/* Mensajes de error de operaciones */}
      {controller.actionError && (
        <Typography color="error.main" sx={{ mb: 2 }}>
          Error: {controller.actionError}
        </Typography>
      )}

      {/* Formulario de creación/edición */}
      <Paper 
        elevation={3} 
        sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 4 }, bgcolor: "background.paper" }}
      >
        <PersonForm
          initialValues={controller.editingPerson}
          onSubmit={controller.handleFormSubmit}
          isLoading={controller.isActionPending}
          isUpdateMode={!!controller.editingPerson}
          onCancel={controller.cancelEdit}
        />
      </Paper>

      {/* Loading de la query principal */}
      {controller.isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress />
          <Typography variant="h6" ml={2}>
            Cargando listado de personas...
          </Typography>
        </Box>
      )}

      {/* Error de la query principal */}
      {controller.isError && !controller.isLoading && (
        <Box p={3} color="error.main">
          <Typography variant="h6" gutterBottom>
            Error al cargar personas
          </Typography>
          <Typography variant="body2">Mensaje: {controller.error?.message}</Typography>
        </Box>
      )}

      {/* Listado principal (Data y Empty State autogestionado por PersonTable) */}
      {!controller.isLoading && !controller.isError && (
        <Paper
          elevation={3}
          sx={{
            p: { xs: 1, sm: 2 },
            borderRadius: 2,
            width: "100%",
            maxWidth: "1200px",
            mx: "auto",
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            mb={{ xs: 2, sm: 3 }}
            gap={1}
          >
            <Typography variant="h4" sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
              Listado de Personas ({controller.persons.length})
            </Typography>
          </Box>
          
          <PersonTable
            persons={controller.persons}
            onEdit={controller.startEdit}
            onDelete={controller.deletePerson}
          />
        </Paper>
      )}
    </Box>
  );
};

export default PersonsPage;