import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import { styled } from "@mui/material/styles";

import AppTheme from "@core/theme/shared-theme/AppTheme";
import ColorModeSelect from "@core/theme/shared-theme/ColorModeSelect";
import { NVIcon } from "@shared/components/ui/CustomIcons";
import { useAuth } from "@modules/auth/hooks/useAuth";
import type { LoginCredentials } from "@modules/auth/types/user.type";
import { PERMISSION_REDIRECTS } from "@/core/api/appsApiRoute";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
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
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function SignIn() {
  const { login, isLoading } = useAuth(); // Error eliminado de aquí
  const navigate = useNavigate();

  // Estados locales para errores
  const [localError, setLocalError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const [credentials, setCredentials] = useState<LoginCredentials>({
    login_data: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    // Limpiar errores al escribir
    if (localError) setLocalError(null);
  };

  const validateInputs = () => {
    const { login_data, password } = credentials;
    let isValid = true;

    if (!login_data || login_data.length < 3) {
      setUsernameError(true);
      setUsernameErrorMessage("Ingresa un usuario válido.");
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage("");
    }

    if (!password || password.length < 4) {
      setPasswordError(true);
      setPasswordErrorMessage(
        "La contraseña debe tener al menos 4 caracteres.",
      );
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateInputs()) return;

    setLocalError(null);

    try {
      await login(credentials);
      navigate("/");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error al iniciar sesión";
      setLocalError(errorMessage);
    }
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <SignInContainer>
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
            sx={{
              width: "100%",
              fontSize: "clamp(1.5rem, 10vw, 2rem)",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Bienvenido
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="login_data">Usuario</FormLabel>
              <TextField
                error={usernameError}
                helperText={usernameErrorMessage}
                id="login_data"
                name="login_data"
                placeholder="Tu nombre de usuario"
                autoComplete="username"
                autoFocus
                required
                fullWidth
                size="small"
                variant="outlined"
                value={credentials.login_data}
                onChange={handleChange}
                disabled={isLoading}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Contraseña</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                size="small"
                variant="outlined"
                value={credentials.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </FormControl>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: -1 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate(PERMISSION_REDIRECTS.FORGOT_PASSWORD)}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.8125rem",
                  color: "text.secondary",
                  "&:hover": {
                    textDecoration: "underline",
                    bgcolor: "transparent",
                    color: "primary.main",
                  },
                }}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </Box>

            {localError && (
              <Alert severity="error" variant="filled" sx={{ py: 0 }}>
                {localError}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              size="large"
              sx={{ mt: 1, textTransform: "none", fontWeight: "bold" }}
            >
              {isLoading ? "Validando..." : "Iniciar Sesión"}
            </Button>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
