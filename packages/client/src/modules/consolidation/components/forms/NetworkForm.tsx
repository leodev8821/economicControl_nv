import * as React from "react";
import { useForm, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import * as SharedMemberSchemas from "@economic-control/shared";

/** MUI */
import {
  Button,
  Stack,
  Typography,
  TextField,
  Box,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface NetworkFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
  isLoading: boolean;
  initialValues?: {
    id?: number;
    name?: string;
    is_visible?: boolean;
  };
  isEditMode?: boolean;
}

export default function NetworkForm({
  onSubmit,
  onCancel,
  isLoading,
  initialValues,
  isEditMode = false,
}: NetworkFormProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, fields] = useForm({
    id: isEditMode ? `edit-${initialValues?.id}` : "create-network",

    defaultValue: initialValues ?? {
      name: "",
      is_visible: true,
    },

    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: SharedMemberSchemas.NetworkCreationSchema,
      });
    },

    onSubmit(event, { submission }) {
      if (submission?.status !== "success") return;

      onSubmit(event);

      if (!isEditMode) {
        resetForm();
      }
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onBlur",
  });

  const nameField = fields.name;

  const resetForm = React.useCallback(() => {
    resetForm();

    form.update({
      name: fields.name.name,
      value: nameField.initialValue,
    });
  }, [form, fields.name.name]);

  return (
    <form {...getFormProps(form)}>
      {/* HEADER */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
        }}
      >
        <Typography variant="h6" color="secondary">
          {isEditMode
            ? `Editando Red: ${initialValues?.name}`
            : "Crear Nueva Red"}
        </Typography>
      </Box>

      {/* FORM */}
      <Stack spacing={3}>
        <TextField
          key={nameField.key}
          label="Nombre de la Red"
          name={nameField.name}
          defaultValue={nameField.initialValue}
          required
          fullWidth
          size="small"
          disabled={isLoading}
          error={!!nameField.errors}
          helperText={nameField.errors?.[0]}
        />
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* ACTIONS */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="flex-end"
      >
        {isEditMode && (
          <Button
            type="button"
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
          color="success"
          disabled={isLoading}
          fullWidth={isMobile}
        >
          {isLoading
            ? "Procesando..."
            : isEditMode
              ? "Actualizar red"
              : "Crear red"}
        </Button>
      </Stack>
    </form>
  );
}
