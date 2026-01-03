import * as React from "react";
/**MUI */
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import InputAdornment from "@mui/material/InputAdornment";
import { Button, Stack } from "@mui/material";
import { useForm } from "@conform-to/react";

/** Schemas de validación */
import { parseWithZod } from "@conform-to/zod/v4";
import * as SharedCashSchemas from "@economic-control/shared";

/**Types */
import type { Cash } from "../../types/cash.type";

interface CashFormProps {
  initialValues?: Cash | null;
  onSubmit: (data: SharedCashSchemas.CashCreationRequest) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  isUpdateMode?: boolean;
}

export default function CashForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  isUpdateMode = false,
}: CashFormProps) {
  // 1. Inicialización de Conform
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: SharedCashSchemas.CashCreationSchema,
      });
    },
    shouldValidate: "onBlur", // Valida al salir del campo
    shouldRevalidate: "onInput", // Vuelve a validar al escribir
    defaultValue: initialValues
      ? ({
          ...initialValues,
          actual_amount: initialValues.actual_amount.toString(),
        } as any)
      : undefined,
  });

  // 2. Manejador de Envío
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Guardar referencia al formulario
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);

    // 2a. Validación Final en el Cliente
    const submission = parseWithZod(formData, {
      schema: SharedCashSchemas.CashCreationSchema,
    });

    // Si la validación local falla (ej. campo requerido vacío), Conform actualiza los errores.
    if (submission.status !== "success") {
      return;
    }

    // Pass clean data to parent
    onSubmit(submission.value);

    // Reset if not in update mode
    if (!isUpdateMode) {
      formEl.reset();
    }
  };

  return (
    <form
      method="post"
      id={form.id}
      onSubmit={handleSubmit}
      className="cash-form"
    >
      <h2>{isUpdateMode ? "Editar Caja" : "Crear Nueva Caja"}</h2>

      {/* Errores a nivel de formulario (si existen) */}
      {form.errors && <div style={{ color: "red" }}>{form.errors}</div>}

      <Grid container spacing={2}>
        {/* --- Campo name (Requerido) --- */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={!!fields.name.errors}>
            <InputLabel htmlFor={fields.name.id}>
              Nombre de la Caja *
            </InputLabel>
            <OutlinedInput
              id={fields.name.id}
              name={fields.name.name}
              type="text"
              placeholder="Ej: Caja General"
              disabled={isLoading}
              required
              defaultValue={initialValues?.name}
              label="Nombre de la Caja *"
            />
            {fields.name.errors && (
              <FormHelperText>{fields.name.errors}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* --- Campo actual_amount (Requerido) --- */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth error={!!fields.actual_amount.errors}>
            <InputLabel htmlFor={fields.actual_amount.id}>
              Monto Actual *
            </InputLabel>
            <OutlinedInput
              id={fields.actual_amount.id}
              name={fields.actual_amount.name}
              type="number"
              placeholder="Ej: 1000.00"
              disabled={isLoading}
              required
              defaultValue={initialValues?.actual_amount}
              inputProps={{ step: "0.01" }}
              startAdornment={
                <InputAdornment position="start">€</InputAdornment>
              }
              label="Monto Actual *"
            />
            {fields.actual_amount.errors && (
              <FormHelperText>{fields.actual_amount.errors}</FormHelperText>
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
                ? "Actualizar Caja"
                : "Guardar Caja"}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
}
