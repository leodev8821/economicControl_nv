import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { SitemarkIcon } from '../components/ui/components/internals/components/CustomIcons'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { LoginCredentials } from '../types/user.type';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    login_data: '',
    password: '',
  });
  const [serverError, setServerError] = useState<string | null>(null); // Para errores del servidor
  
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null; 
  }

  const validateInputs = () => {
    let isValid = true;

    if (!credentials.login_data || !/^[a-zA-Z0-9.]{3,20}$/.test(credentials.login_data)) {
      setUsernameError(true);
      setUsernameErrorMessage(
        !credentials.login_data
          ? 'El usuario no puede estar vacío.'
          : 'Usuario no válido (letras, números, puntos, 3-20 caracteres).'
      );
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage('');
    }

    if (!credentials.password || credentials.password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Contraseña no válida (mínimo 6 caracteres).');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    // Opcional: Limpiar errores de validación local y servidor al cambiar el input
    setUsernameError(false);
    setPasswordError(false);
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Siempre prevenir por si se necesita hacer el login asíncrono.
    setServerError(null); // Limpiar errores previos del servidor

    // 1. Validar inputs localmente
    if (!validateInputs()) {
      // Si la validación local falla, no continuar
      return; 
    }
    
    try {
        // 2. Realizar la autenticación
        await login(credentials);
        
        // 3. Éxito: Navegar al dashboard
        navigate('/dashboard', { replace: true });
    } catch (err) {
        // 4. Capturar y mostrar errores del servidor
        const errorMessage = err instanceof Error 
            ? err.message 
            : 'Error desconocido al iniciar sesión.';
        setServerError(errorMessage);
        setUsernameError(true);
        setUsernameErrorMessage(errorMessage); 
        setPasswordError(true);
        setPasswordErrorMessage(errorMessage);
    }
  };

  

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="login_data">Email</FormLabel>
              <TextField
                error={usernameError}
                helperText={usernameErrorMessage}
                id="login_data"
                type="text"
                name="login_data"
                placeholder="username"
                autoComplete="login_data"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={usernameError ? 'error' : 'primary'}
                value={credentials.login_data}
                onChange={handleChange}
                disabled={isLoading}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
                value={credentials.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </FormControl>
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Remember me"
            />

            {serverError && (
                <Typography color="error" variant="body2" sx={{ alignSelf: 'center' }}>
                  {serverError}
                </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Sign in'}
            </Button>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}