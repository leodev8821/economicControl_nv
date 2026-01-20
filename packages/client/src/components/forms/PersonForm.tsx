import * as React from "react";
/**MUI */
//import { useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { Button, Stack } from "@mui/material";
import { useForm } from "@conform-to/react";

/** Schemas de validación */
import { parseWithZod } from "@conform-to/zod/v4";
import * as SharedPersonSchemas from "@economic-control/shared";

/**Types */
import type { Person } from "../../types/person.type";

interface PersonFormProps {
  initialValues?: Person | null;
  onSubmit: (data: SharedPersonSchemas.PersonCreationRequest) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  isUpdateMode?: boolean;
}

export default function PersonForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  isUpdateMode = false,
}: PersonFormProps) {
  //const theme = useTheme();

  // 1. Inicialización de Conform
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: SharedPersonSchemas.PersonCreationSchema,
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

    const formEl = event.currentTarget;
    const formData = new FormData(formEl);

    const submission = parseWithZod(formData, {
      schema: SharedPersonSchemas.PersonCreationSchema,
    });

    if (submission.status !== "success") {
      return;
    }

    onSubmit(submission.value);

    if (!isUpdateMode) {
      formEl.reset();
    }
  };

  return (
    <form
      method="post"
      id={form.id}
      onSubmit={handleSubmit}
      className="person-form"
    >
      <h2>{isUpdateMode ? "Editar Persona" : "Crear Nueva Persona"}</h2>

      {form.errors && <div style={{ color: "red" }}>{form.errors}</div>}

      <Grid container spacing={2}>
        {/* --- First Name --- */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={!!fields.first_name.errors}>
            <InputLabel htmlFor={fields.first_name.id}>Nombre *</InputLabel>
            <OutlinedInput
              id={fields.first_name.id}
              name={fields.first_name.name}
              type="text"
              label="Nombre *"
              defaultValue={initialValues?.first_name}
              disabled={isLoading}
            />
            {fields.first_name.errors && (
              <FormHelperText>{fields.first_name.errors}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* --- Last Name --- */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={!!fields.last_name.errors}>
            <InputLabel htmlFor={fields.last_name.id}>Apellido *</InputLabel>
            <OutlinedInput
              id={fields.last_name.id}
              name={fields.last_name.name}
              type="text"
              label="Apellido *"
              defaultValue={initialValues?.last_name}
              disabled={isLoading}
            />
            {fields.last_name.errors && (
              <FormHelperText>{fields.last_name.errors}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* --- DNI --- */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={!!fields.dni.errors}>
            <InputLabel htmlFor={fields.dni.id}>DNI *</InputLabel>
            <OutlinedInput
              id={fields.dni.id}
              name={fields.dni.name}
              type="text"
              label="DNI *"
              defaultValue={initialValues?.dni}
              disabled={isLoading}
            />
            {fields.dni.errors && (
              <FormHelperText>{fields.dni.errors}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid size={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            {isUpdateMode && onCancel && (
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
                  ? "Actualizar Persona"
                  : "Guardar Persona"}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
}
