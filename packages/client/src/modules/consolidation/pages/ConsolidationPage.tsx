//import React, { useEffect } from "react";
import React from "react";
import { Box, Typography, Paper } from "@mui/material";
//import { useNavigate } from "react-router-dom";
//import { useAuth } from "@modules/auth/hooks/useAuth";

const ConsolidationPage: React.FC = () => {
  // Seguridad y Autenticación (misma idea que UserPage)
  /* const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const ALLOWED_ROLES = ["Administrador", "SuperUser"];
  const hasPermission =
    authUser?.role_name && ALLOWED_ROLES.includes(authUser.role_name);

  // Redirección si no hay permiso
  useEffect(() => {
    if (authUser && !hasPermission) {
      navigate("/dashboard");
    }
  }, [authUser, hasPermission, navigate]);

  // Si no tiene permiso, no renderizamos nada (el effect redirige)
  if (!authUser || !hasPermission) return null; */

  return (
    <Box p={3}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Consolidación
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Módulo de consolidación de información
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 6,
          textAlign: "center",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h5" gutterBottom>
          🚧 Página en construcción...
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Esta sección estará disponible próximamente. Estamos trabajando para
          ofrecerte nuevas funcionalidades.
        </Typography>
      </Paper>
    </Box>
  );
};
export default ConsolidationPage;
