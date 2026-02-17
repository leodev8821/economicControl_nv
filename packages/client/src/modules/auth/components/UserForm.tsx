import * as React from "react";
/**MUI */
import { type Theme, useTheme } from "@mui/material/styles";
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
  InputAdornment,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Delete, AddCircleOutline } from "@mui/icons-material";
import { AxiosError } from "axios";

/** Schemas de validación */
import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import * as SharedUserSchema from "@economic-control/shared";
import { ROLE_VALUES } from "@economic-control/shared";

/** Hooks & Context */
import { useAuth } from "../hooks/useAuth";
import { useApplications } from "../hooks/useApplications";
import { useRoles } from "../hooks/useRoles";
import { APPS, ROLE_WEIGHTS } from "@shared/constants/app";

// Constantes para MUI Select
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface FeedbackState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

function getStyles(name: string, selectedValue: string, theme: Theme) {
  return {
    fontWeight:
      selectedValue === name
        ? theme.typography.fontWeightMedium
        : theme.typography.fontWeightRegular,
  };
}

interface UserFormProps {
  initialValues?: any;
  onSubmit: (data: any) => Promise<void> | void;
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
  const sanitizedValues = React.useMemo(() => {
    if (!initialValues) return null;
    return {
      ...initialValues,
      role_name: initialValues.role_name ?? "",
      permissions: initialValues.permissions || initialValues.Permissions || [],
    };
  }, [initialValues]);

  const theme = useTheme();
  const { user: currentUser } = useAuth();

  // 1. Cargar datos maestros para los selectores de permisos
  const { data: allApplications = [] } = useApplications();
  const { data: roles = [] } = useRoles();

  // A. Determinar el nivel del usuario ACTUAL (el que está logueado)
  const currentUserLevel = React.useMemo(() => {
    if (currentUser?.role_name === "SuperUser") return 99;

    // Si tiene permiso para la APP 1 (ALL), es un Admin Global
    const hasGlobalAccess = currentUser?.permissions?.some(
      (p: any) => p.application_id === APPS.ALL,
    );
    if (hasGlobalAccess && currentUser?.role_name === "Administrador")
      return 50;

    // Admin de App específica
    if (currentUser?.role_name === "Administrador") return 40;

    return 0; // Otros
  }, [currentUser]);

  // B. Filtrar qué APLICACIONES puede asignar
  const assignableApplications = React.useMemo(() => {
    // Si es SuperUser o Admin Global (Nivel >= 50), puede asignar CUALQUIER app
    if (currentUserLevel >= 50) return allApplications;

    // Si es Admin de App (Nivel 40), solo puede asignar SU propia app
    const myAppIds =
      currentUser?.permissions?.map((p: any) => p.application_id) || [];
    return allApplications.filter((app) => myAppIds.includes(app.id));
  }, [allApplications, currentUserLevel, currentUser]);

  // C. Filtrar qué ROLES puede asignar
  const filteredRoles = React.useMemo(() => {
    if (!currentUser) return [];

    return ROLE_VALUES.filter((roleName) => {
      // 1. Nadie puede crear un SuperUser excepto otro SuperUser
      if (roleName === "SuperUser" && currentUserLevel < 99) return false;

      // 2. Un Admin de App (Nivel 40) no debería poder crear otros "Administrador"
      if (currentUserLevel === 40 && roleName === "Administrador") return false;

      // 3. Regla general: No puedes crear a alguien con más o igual rango que tú
      // (Excepto SuperUser que puede crear otros SuperUsers)
      const roleWeight = ROLE_WEIGHTS[roleName] || 0;
      if (currentUserLevel < 99 && roleWeight >= currentUserLevel) return false;

      return true;
    });
  }, [currentUser, currentUserLevel]);

  // Detectar si se está editando a sí mismo
  const isEditingSelf = React.useMemo(() => {
    return isUpdateMode && initialValues?.id === currentUser?.id;
  }, [isUpdateMode, initialValues, currentUser]);

  // 2. Estado local para la tabla de permisos
  const [selectedApps, setSelectedApps] = React.useState<
    { application_id: number }[]
  >([]);

  const [fieldErrors, setFieldErrors] = React.useState<{
    [key: string]: string | null;
  }>({});

  // 3. Estado para el feedback (Snackbar)
  const [feedback, setFeedback] = React.useState<FeedbackState>({
    open: false,
    message: "",
    severity: "success",
  });

  const schema = isUpdateMode
    ? SharedUserSchema.UserUpdateSchema
    : SharedUserSchema.UserCreationSchema;

  // Efecto para inicializar selectedApps
  React.useEffect(() => {
    // CASO 1: EDICIÓN (Cargar permisos existentes)
    if (
      sanitizedValues?.permissions &&
      sanitizedValues.permissions.length > 0
    ) {
      setSelectedApps(
        sanitizedValues.permissions.map((p: any) => ({
          application_id: p.application_id,
        })),
      );
      return;
    }

    // CASO 2: CREACIÓN (Valores por defecto)
    // Si NO es edición y NO soy Admin Global (es decir, soy Admin de App única)
    // Pre-cargamos mi única app disponible para ahorrar clics y errores.
    if (
      !isUpdateMode &&
      !currentUserLevel &&
      assignableApplications.length === 1
    ) {
      setSelectedApps([{ application_id: assignableApplications[0].id }]);
    } else {
      setSelectedApps([]);
    }
  }, [sanitizedValues, isUpdateMode, currentUserLevel, assignableApplications]);

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    // Usamos los valores sanitizados aquí
    defaultValue: sanitizedValues || {
      username: "",
      role_name: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      password: "",
    },
    shouldRevalidate: "onInput",
  });

  // --- Lógica de Permisos ---
  const addApp = () => {
    // Si el admin normal solo tiene acceso a una app y ya está asignada, no permitir añadir más
    if (
      !currentUserLevel &&
      selectedApps.length >= assignableApplications.length
    )
      return;
    setSelectedApps([...selectedApps, { application_id: 0 }]);
  };

  const updateApp = (index: number, value: number) => {
    const updated = [...selectedApps];
    updated[index] = { application_id: value };
    setSelectedApps(updated);
  };

  const removeApp = (index: number) => {
    setSelectedApps(selectedApps.filter((_, i) => i !== index));
  };

  // --- Manejador para cerrar el Snackbar ---
  const handleCloseFeedback = () => {
    setFeedback((prev) => ({ ...prev, open: false }));
  };

  // --- Manejo del Submit ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    if (!formData.has("role_name") && initialValues?.role_name) {
      formData.append("role_name", initialValues.role_name);
    }

    const submission = parseWithZod(formData, { schema });

    if (submission.status !== "success") return;

    const selectedRoleName = submission.value.role_name;
    const targetRole = roles.find((r) => r.role_name === selectedRoleName);

    if (!targetRole) {
      setFeedback({
        open: true,
        message: `Error: No se encontró configuración interna para el rol "${selectedRoleName}".`,
        severity: "error",
      });
      return;
    }

    const cleanPermissions = selectedApps
      .filter((p) => p.application_id !== 0)
      .map((p) => ({
        application_id: p.application_id,
        role_id: targetRole.id,
      }));

    const payload = {
      ...submission.value,
      permissions: cleanPermissions,
    };

    try {
      await onSubmit(payload);

      setFeedback({
        open: true,
        message: isUpdateMode
          ? "Usuario actualizado correctamente."
          : "Usuario creado correctamente.",
        severity: "success",
      });

      if (!isUpdateMode) {
        formElement.reset();
        setSelectedApps([]);
      }
    } catch (error) {
      //console.error("Error capturado:", error);
      let errorMessage = "Hubo un error desconocido al procesar la solicitud.";

      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          errorMessage =
            error.response.data?.message || "El usuario ya existe.";
          setFieldErrors({ username: errorMessage });
        } else {
          errorMessage = error.response?.data?.message || "Error del servidor.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setFeedback({ open: true, message: errorMessage, severity: "error" });
    }
  };
  const isAppLocked = !currentUserLevel && assignableApplications.length === 1;

  return (
    <form
      method="post"
      id={form.id}
      onSubmit={handleSubmit}
      className="user-form"
      noValidate
    >
      {/* Errores a nivel de formulario */}
      {form.errors && (
        <Typography color="error" variant="body2" mb={2}>
          {form.errors}
        </Typography>
      )}

      {/* Componente Snackbar para feedback */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={feedback.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {feedback.message}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        {/* Username */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl
            fullWidth
            error={!!fields.username.errors || !!fieldErrors.username}
          >
            <InputLabel>Nombre de Usuario *</InputLabel>
            <OutlinedInput
              {...getInputProps(fields.username, { type: "text" })}
              defaultValue={initialValues?.username}
              label="Nombre de Usuario *"
              disabled={isLoading}
              onChange={() => {
                if (fieldErrors.username)
                  setFieldErrors({ ...fieldErrors, username: null });
              }}
            />
            <FormHelperText>
              {fields.username.errors
                ? fields.username.errors
                : fieldErrors.username}
            </FormHelperText>
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
              disabled={isLoading || isEditingSelf}
              MenuProps={MenuProps}
            >
              {filteredRoles.map((r) => (
                <MenuItem
                  key={r}
                  value={r}
                  style={getStyles("role_name", r, theme)}
                >
                  {r}
                </MenuItem>
              ))}
            </Select>
            {isEditingSelf && (
              <FormHelperText sx={{ color: "text.secondary" }}>
                No puedes cambiar tu propio rol por seguridad.
              </FormHelperText>
            )}
            {fields.role_name.errors && (
              <FormHelperText>{fields.role_name.errors}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* First Name */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={!!fields.first_name.errors}>
            <InputLabel htmlFor={fields.first_name.id}>Nombre *</InputLabel>
            <OutlinedInput
              {...getInputProps(fields.first_name, { type: "text" })}
              defaultValue={initialValues?.first_name}
              label="Nombre *"
              disabled={isLoading}
            />
            {fields.first_name.errors && (
              <FormHelperText>{fields.first_name.errors}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Last Name */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={!!fields.last_name.errors}>
            <InputLabel htmlFor={fields.last_name.id}>Apellido *</InputLabel>
            <OutlinedInput
              {...getInputProps(fields.last_name, { type: "text" })}
              defaultValue={initialValues?.last_name}
              label="Apellido *"
              disabled={isLoading}
            />
            {fields.last_name.errors && (
              <FormHelperText>{fields.last_name.errors}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Email */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={!!fields.email.errors}>
            <InputLabel htmlFor={fields.email.id}>Email *</InputLabel>
            <OutlinedInput
              {...getInputProps(fields.email, { type: "email" })}
              defaultValue={initialValues?.email}
              label="Email *"
              disabled={isLoading}
            />
            {fields.email.errors && (
              <FormHelperText>{fields.email.errors}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Phone */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={!!fields.phone.errors}>
            <InputLabel htmlFor={fields.phone.id}>Teléfono *</InputLabel>
            <OutlinedInput
              {...getInputProps(fields.phone, { type: "text" })}
              defaultValue={initialValues?.phone}
              label="Teléfono *"
              disabled={isLoading}
              startAdornment={
                <InputAdornment position="start">
                  <Typography variant="body2" color="text.secondary">
                    +34
                  </Typography>
                </InputAdornment>
              }
            />
            {fields.phone.errors && (
              <FormHelperText>{fields.phone.errors}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Password */}
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth error={!!fields.password.errors}>
            <InputLabel htmlFor={fields.password.id}>
              Contraseña {isUpdateMode ? "(Opcional)" : "*"}
            </InputLabel>
            <OutlinedInput
              {...getInputProps(fields.password, { type: "password" })}
              label={`Contraseña ${isUpdateMode ? "(Opcional)" : "*"}`}
              disabled={isLoading}
            />
            <FormHelperText>
              {fields.password.errors ||
                (isUpdateMode && "Dejar en blanco para no cambiar")}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* SECCIÓN DE PERMISOS */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 1 }} />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Acceso a Aplicaciones
            </Typography>
            <Button
              startIcon={<AddCircleOutline />}
              onClick={addApp}
              size="small"
              variant="outlined"
              disabled={
                !currentUserLevel &&
                selectedApps.length >= assignableApplications.length
              }
            >
              Añadir App
            </Button>
          </Stack>

          {selectedApps.map((appItem, index) => (
            <Stack
              key={index}
              direction="row"
              spacing={2}
              sx={{ mb: 2 }}
              alignItems="center"
            >
              <FormControl fullWidth size="small">
                <InputLabel>Aplicación</InputLabel>
                <Select
                  value={appItem.application_id || ""}
                  label="Aplicación"
                  MenuProps={MenuProps}
                  disabled={isAppLocked}
                  onChange={(e) => updateApp(index, Number(e.target.value))}
                >
                  {assignableApplications.map((app) => (
                    <MenuItem
                      key={app.id}
                      value={app.id}
                      style={getStyles("application_id", app.app_name, theme)}
                    >
                      {app.app_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography
                variant="caption"
                sx={{ whiteSpace: "nowrap", color: "text.secondary", px: 2 }}
              >
                Rol: (Heredado)
              </Typography>

              <IconButton
                color="error"
                onClick={() => removeApp(index)}
                disabled={isAppLocked}
              >
                <Delete />
              </IconButton>
            </Stack>
          ))}
          {selectedApps.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              No hay aplicaciones asignadas. El usuario tendrá el rol global
              pero sin acceso a apps específicas.
            </Typography>
          )}
        </Grid>

        {/* Actions */}
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={isLoading}>
              {isLoading
                ? "Procesando..."
                : isUpdateMode
                  ? "Actualizar"
                  : "Crear Usuario"}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
}
