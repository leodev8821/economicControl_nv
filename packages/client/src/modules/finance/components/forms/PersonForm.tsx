import * as React from "react";
/**MUI */
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { Button, Stack, Typography } from "@mui/material";
import { useForm } from "@conform-to/react";

/** Schemas de validación */
import { parseWithZod } from "@conform-to/zod/v4";
import * as SharedPersonSchemas from "@economic-control/shared";

/**Types */
import type { Person } from "@modules/finance/types/person.type";

interface PersonFormProps {
  initialValues?: Person | null;
  onSubmit: (data: SharedPersonSchemas.PersonCreationDTO) => void;
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
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: SharedPersonSchemas.PersonCreationSchema,
      });
    },
    shouldValidate: "onSubmit",
    shouldRevalidate: "onSubmit",
    defaultValue: initialValues
      ? ({
          ...initialValues,
        } as any)
      : undefined,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation(); // Evita que el evento burbujee

    const formData = new FormData(event.currentTarget);
    const submission = parseWithZod(formData, {
      schema: SharedPersonSchemas.PersonCreationSchema,
    });

    if (submission.status !== "success") {
      return;
    }

    onSubmit(submission.value);

    // Añadimos esto para asegurarnos de que solo el botón de submit dispare la lógica
    const submitter = (event.nativeEvent as any).submitter;
    
    // Si no hay un submitter, es probable que haya sido un evento nativo no deseado
    if (!submitter) {
      return;
    }
    
    // Solo reseteamos si no estamos en modo edición
    if (!isUpdateMode) {
      event.currentTarget.reset();
    }
  };

  return (
    <form
      id={form.id}
      onSubmit={handleSubmit}
      className="person-form"
      noValidate // Muy importante: evita la validación nativa del navegador
    >
      <Typography
        variant="h5"
        color="primary"
        gutterBottom
        sx={{ textAlign: { xs: "center", sm: "left" } }}
      >
        {isUpdateMode ? "Editar Persona" : "Crear Nueva Persona"}
      </Typography>

      {form.errors && <div style={{ color: "red" }}>{form.errors}</div>}

      <Grid container spacing={2}>
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
          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={2}
            justifyContent={{ xs: "stretch", sm: "flex-end" }}
          >
            {isUpdateMode && onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={isLoading}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{ minWidth: 150, width: { xs: "100%", sm: "auto" } }}
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
