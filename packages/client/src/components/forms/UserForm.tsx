import * as React from "react";
/**MUI */
//import { useTheme } from "@mui/material/styles";
import {
  OutlinedInput,
  FormControl,
  Grid,
  InputLabel,
  FormHelperText,
  Button,
  Stack,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useForm } from "@conform-to/react";

/** Schemas de validación */
import { parseWithZod } from "@conform-to/zod/v4";
import * as SharedUserSchema from "@economic-control/shared";
import { ROLE_VALUES } from "@economic-control/shared";

/** Types */
import type { User } from "@/types/user.type";

interface UserFormProps {
  initialValues?: User | null;
  //onSubmit: (data: SharedUserSchema.UserCreationRequest) => void;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  isUpdateMode?: boolean;
}
export default function UserForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  isUpdateMode = false,
}: UserFormProps) {
  //const theme = useTheme();

  const schema = isUpdateMode
    ? SharedUserSchema.UserUpdateSchema
    : SharedUserSchema.UserCreationSchema;

  // 1. Inicialización de Conform
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema,
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    defaultValue: initialValues
      ? ({
          ...initialValues,
        } as any)
      : undefined,
  });

  // 2. Manejador de Envío
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const submission = parseWithZod(formData, { schema });

    if (submission.status !== "success") return;

    onSubmit(submission.value);

    if (!isUpdateMode) event.currentTarget.reset();
  };

  return (
    <form id={form.id} onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" mb={3}>
        {isUpdateMode ? "Editar Usuario" : "Crear Nuevo Usuario"}
      </Typography>

      <Grid container spacing={2}>
        {/* Username */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={!!fields.username.errors}>
            <InputLabel htmlFor={fields.username.id}>
              Nombre de Usuario *
            </InputLabel>
            <OutlinedInput
              id={fields.username.id}
              name={fields.username.name}
              label="Nombre de Usuario *"
              defaultValue={initialValues?.username}
              disabled={isLoading}
            />
            <FormHelperText>{fields.username.errors}</FormHelperText>
          </FormControl>
        </Grid>

        {/* Role Select */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={!!fields.role_name.errors}>
            <InputLabel id="role-label">Rol *</InputLabel>
            <Select
              labelId="role-label"
              id={fields.role_name.id}
              name={fields.role_name.name}
              label="Rol *"
              defaultValue={initialValues?.role_name ?? ""}
              disabled={isLoading}
            >
              {ROLE_VALUES.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{fields.role_name.errors}</FormHelperText>
          </FormControl>
        </Grid>

        {/* First Name */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={!!fields.first_name.errors}>
            <InputLabel htmlFor={fields.first_name.id}>Nombre *</InputLabel>
            <OutlinedInput
              id={fields.first_name.id}
              name={fields.first_name.name}
              label="Nombre *"
              defaultValue={initialValues?.first_name}
              disabled={isLoading}
            />
            <FormHelperText>{fields.first_name.errors}</FormHelperText>
          </FormControl>
        </Grid>

        {/* Last Name */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={!!fields.last_name.errors}>
            <InputLabel htmlFor={fields.last_name.id}>Apellido *</InputLabel>
            <OutlinedInput
              id={fields.last_name.id}
              name={fields.last_name.name}
              label="Apellido *"
              defaultValue={initialValues?.last_name}
              disabled={isLoading}
            />
            <FormHelperText>{fields.last_name.errors}</FormHelperText>
          </FormControl>
        </Grid>

        {/* Password - Solo obligatorio en creación */}
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth error={!!fields.password.errors}>
            <InputLabel htmlFor={fields.password.id}>
              Contraseña {isUpdateMode ? "(Opcional)" : "*"}
            </InputLabel>
            <OutlinedInput
              id={fields.password.id}
              name={fields.password.name}
              type="password"
              label={`Contraseña ${isUpdateMode ? "(Opcional)" : "*"}`}
              disabled={isLoading}
            />
            <FormHelperText>
              {fields.password.errors ||
                (isUpdateMode && "Dejar en blanco para no cambiar")}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{ minWidth: 150 }}
            >
              {isLoading
                ? "Guardando..."
                : isUpdateMode
                  ? "Actualizar Usuario"
                  : "Guardar Usuario"}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
}
