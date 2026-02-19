import * as React from "react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";

import AppTheme from "@core/theme/shared-theme/AppTheme";
import ColorModeSelect from "@core/theme/shared-theme/ColorModeSelect";
import { NVIcon } from "@shared/components/ui/CustomIcons";
import { resetPassword } from "@modules/auth/api/authApi";
import { PERMISSION_REDIRECTS } from "@core/api/appsApiRoute";

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

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setStatus({ type: "error", msg: "Las contraseñas no coinciden." });
    }
    if (!token) {
      return setStatus({
        type: "error",
        msg: "Token no encontrado o inválido.",
      });
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setStatus({
        type: "success",
        msg: "Contraseña actualizada. Redirigiendo al login...",
      });
      setTimeout(() => navigate(PERMISSION_REDIRECTS.LOGIN), 3000);
    } catch (err: any) {
      setStatus({
        type: "error",
        msg: err.response?.data?.message || "Error al restablecer contraseña.",
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
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <NVIcon />
          </Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{ textAlign: "center", fontWeight: "bold" }}
          >
            Nueva Contraseña
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
          >
            <FormControl>
              <FormLabel>Nueva Contraseña</FormLabel>
              <TextField
                type="password"
                required
                fullWidth
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Confirmar Contraseña</FormLabel>
              <TextField
                type="password"
                required
                fullWidth
                size="small"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormControl>

            {status && <Alert severity={status.type}>{status.msg}</Alert>}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !token || status?.type === "success"}
              size="large"
              sx={{ mt: 1, textTransform: "none", fontWeight: "bold" }}
            >
              {loading ? "Actualizando..." : "Restablecer contraseña"}
            </Button>
          </Box>
        </Card>
      </Container>
    </AppTheme>
  );
}
