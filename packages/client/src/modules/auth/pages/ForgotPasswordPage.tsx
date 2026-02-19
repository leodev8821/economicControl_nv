import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CssBaseline,
  FormLabel,
  FormControl,
  TextField,
  Typography,
  Stack,
  Card as MuiCard,
  Alert,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import AppTheme from "@core/theme/shared-theme/AppTheme";
import ColorModeSelect from "@core/theme/shared-theme/ColorModeSelect";
import { NVIcon } from "@shared/components/ui/CustomIcons";
import { forgotPassword } from "@modules/auth/api/authApi"; // Asegúrate de crear esta función

// Reutilizamos tus estilos
const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: { width: "450px" },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const Container = styled(Stack)(({ theme }) => ({
  height: "100vh",
  width: "100vw",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  padding: theme.spacing(2),
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await forgotPassword(email);
      setStatus({
        type: "success",
        msg: "Si el correo está registrado, recibirás un enlace de recuperación pronto.",
      });
    } catch (err: any) {
      setStatus({
        type: "error",
        msg: err.response?.data?.message || "Error al procesar la solicitud",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Container>
        <ColorModeSelect
          sx={{ position: "fixed", top: "1rem", right: "1rem" }}
        />
        <Card variant="outlined">
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <IconButton
              onClick={() => navigate(-1)}
              size="small"
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Volver
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <NVIcon />
          </Box>

          <Typography
            component="h1"
            variant="h4"
            sx={{ textAlign: "center", fontWeight: "bold" }}
          >
            Recuperar acceso
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "text.secondary", textAlign: "center" }}
          >
            Introduce tu correo electrónico para recibir un enlace de
            restablecimiento.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Correo Electrónico</FormLabel>
              <TextField
                id="email"
                type="email"
                name="email"
                placeholder="tu@correo.com"
                required
                fullWidth
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </FormControl>

            {status && (
              <Alert severity={status.type} variant="filled" sx={{ mt: 1 }}>
                {status.msg}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || status?.type === "success"}
              size="large"
              sx={{ mt: 1, textTransform: "none", fontWeight: "bold" }}
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </Button>
          </Box>
        </Card>
      </Container>
    </AppTheme>
  );
}
