import React, { useEffect } from "react";
import { Box, Typography, Paper, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@modules/auth/hooks/useAuth";

const AdminPage: React.FC = () => {
  // Seguridad y Autenticación
  const { user: authUser } = useAuth();
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
  if (!authUser || !hasPermission) return null;

  return (
    <Box p={3}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Administración
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Panel central de acceso a módulos
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
          Selecciona un módulo
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          justifyContent="center"
          mt={4}
        >
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={() => navigate("/finance/dashboard")}
          >
            Finanzas
          </Button>

          <Button
            variant="outlined"
            size="large"
            color="primary"
            onClick={() => navigate("/consolidation/home")}
          >
            Consolidation
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AdminPage;
