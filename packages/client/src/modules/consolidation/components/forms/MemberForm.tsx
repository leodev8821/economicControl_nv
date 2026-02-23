import * as React from "react";
import { useForm, getFormProps } from "@conform-to/react";
import Grid from "@mui/material/Grid";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Stack,
  Typography,
  TextField,
  Box,
  Divider,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Fade,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddCircleIcon,
  Save as SaveIcon,
  SaveAlt as SaveDraftIcon,
} from "@mui/icons-material";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

import { parseWithZod } from "@conform-to/zod/v4";
import * as SharedMemberSchemas from "@economic-control/shared";

interface MemberFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
  isLoading: boolean;
  initialValues?: {
    members: any[];
  };
  disableAdd?: boolean;
  isEditMode?: boolean;
}

export default function MemberForm({
  onSubmit,
  onCancel,
  isLoading,
  initialValues,
  disableAdd = false,
  isEditMode = false,
}: MemberFormProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const LOCAL_STORAGE_KEY = "members_draft";

  // Helper para guardar
  const saveToLocalStorage = (data: any) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  const [form, fields] = useForm({
    lastResult: initialValues as any,
    id: isEditMode ? `edit-${initialValues?.members[0]?.id}` : "create-form",

    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: SharedMemberSchemas.BulkMemberSchema,
      });
    },

    onSubmit(event) {
      onSubmit(event);
      if (!form.valid) return;

      if (!isEditMode) {
        resetForm();
      }
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onBlur",
    defaultValue: initialValues ?? {
      members: [
        {
          first_name: "",
          last_name: "",
          phone: "",
          gender: "",
          birth_date: dayjs().format("DD-MM-YYYY"),
          status: "Soltero/a",
        },
      ],
    },
  });

  const memberList = fields.members.getFieldList();

  const handleSaveDraft = () => {
    // Para obtener los valores actuales sin que falle el tipo:
    const draftData = {
      members: memberList.map((member) => {
        // Accedemos al valor actual de cada campo dentro del objeto del array
        const nestedFields = (member as any).getFieldset();
        return {
          // Usamos value (lo que escribió el usuario) o initialValue (lo que venía de props)
          first_name:
            nestedFields.first_name.value ??
            nestedFields.first_name.initialValue ??
            "",
          last_name:
            nestedFields.last_name.value ??
            nestedFields.last_name.initialValue ??
            "",
          phone:
            nestedFields.phone.value ?? nestedFields.phone.initialValue ?? "",
          gender:
            nestedFields.gender.value ?? nestedFields.gender.initialValue ?? "",
          birth_date:
            nestedFields.birth_date.value ??
            nestedFields.birth_date.initialValue ??
            dayjs().format("DD-MM-YYYY"),
          status:
            nestedFields.status.value ??
            nestedFields.status.initialValue ??
            "Soltero/a",
        };
      }),
    };

    saveToLocalStorage(draftData);
    alert("Borrador guardado localmente");
  };

  const resetForm = React.useCallback(() => {
    form.reset();

    form.update({
      name: fields.members.name,
      value: [
        {
          first_name: "",
          last_name: "",
          phone: "",
          gender: "",
          birth_date: dayjs().format("DD-MM-YYYY"),
          status: "Soltero/a",
        },
      ],
    });
  }, [form, fields.members.name]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form {...getFormProps(form)}>
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
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", textAlign: { xs: "center", sm: "left" } }}
          >
            {isEditMode ? "Editar Miembro" : "Nuevos Miembros"}
          </Typography>

          {!isEditMode && (
            <Button
              variant="outlined"
              color="info"
              startIcon={<SaveDraftIcon />}
              onClick={handleSaveDraft}
            >
              Guardar Borrador
            </Button>
          )}

          <Button
            type="submit"
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            disabled={isLoading}
            fullWidth={isMobile}
          >
            Guardar Todo
          </Button>
        </Box>

        <Stack spacing={2} sx={{ mb: 4 }}>
          {memberList.map((member, index) => (
            <Fade in={true} key={member.key} timeout={400}>
              <Box>
                <IncomeRow
                  field={member}
                  removeProps={{
                    onClick: () =>
                      form.remove({ name: fields.members.name, index }),
                  }}
                  isDisableDelete={memberList.length === 1 || disableAdd}
                  isLoading={isLoading}
                  index={index}
                />
              </Box>
            </Fade>
          ))}
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
        >
          {!disableAdd && (
            <Button
              onClick={() =>
                form.insert({
                  name: fields.members.name,
                  defaultValue: {
                    first_name: "",
                    last_name: "",
                    phone: "",
                    gender: "",
                    birth_date: dayjs().format("DD-MM-YYYY"),
                    status: "Soltero/a",
                  },
                })
              }
              type="button"
              variant="outlined"
              startIcon={<AddCircleIcon />}
              disabled={isLoading}
              fullWidth={isMobile}
            >
              Añadir otro miembro
            </Button>
          )}

          <Stack direction="row" spacing={2} width="100%">
            {isEditMode && (
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                fullWidth={isMobile}
                onClick={() => {
                  resetForm();
                  onCancel?.();
                }}
              >
                Cancelar
              </Button>
            )}

            <Button
              type="submit"
              variant="outlined"
              size="large"
              sx={{
                bgcolor: "success.main",
                color: "success.contrastText",
                ":hover": {
                  bgcolor: "success.light",
                  color: "success.contrastText",
                },
              }}
              disabled={isLoading || memberList.length === 0}
              fullWidth={isMobile}
            >
              {isLoading
                ? "Procesando..."
                : isEditMode
                  ? "Actualizar miembro"
                  : `Confirmar y Guardar (${memberList.length})`}
            </Button>
          </Stack>
        </Stack>
      </form>
    </LocalizationProvider>
  );
}

function IncomeRow({
  field,
  removeProps,
  isDisableDelete,
  isLoading,
  index,
}: any) {
  const rowFields = field.getFieldset();

  const [selectedBirthDate, setSelectedBirthDate] =
    React.useState<Dayjs | null>(
      rowFields.birth_date.initialValue
        ? dayjs(rowFields.birth_date.initialValue)
        : dayjs(),
    );

  React.useEffect(() => {
    setSelectedBirthDate(
      rowFields.birth_date.initialValue
        ? dayjs(rowFields.birth_date.initialValue)
        : dayjs(),
    );
  }, [rowFields.birth_date.initialValue, rowFields.birth_date.key]);

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        border: "1px solid #eee",
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: { xs: 1, sm: 0 },
      }}
    >
      {/* Etiqueta visible solo en móviles para identificar la fila */}
      <Typography
        variant="subtitle2"
        color="primary"
        sx={{ display: { xs: "block", sm: "none" }, mb: 1, fontWeight: "bold" }}
      >
        Miembro #{index + 1}
      </Typography>

      <Grid container spacing={2} alignItems="flex-start">
        <Grid size={{ xs: 6, sm: 2 }}>
          <TextField
            key={rowFields.first_name.key}
            label="Nombre(s)"
            type="text"
            name={rowFields.first_name.name}
            defaultValue={rowFields.first_name.initialValue}
            fullWidth
            size="small"
            disabled={isLoading}
            error={!!rowFields.first_name.errors}
            helperText={rowFields.first_name.errors?.join(", ")}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <TextField
            key={rowFields.last_name.key}
            label="Apellido(s)"
            type="text"
            name={rowFields.last_name.name}
            defaultValue={rowFields.last_name.initialValue}
            fullWidth
            size="small"
            disabled={isLoading}
            error={!!rowFields.last_name.errors}
            helperText={rowFields.last_name.errors?.join(", ")}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <TextField
            key={rowFields.phone.key}
            label="Teléfono"
            type="number"
            name={rowFields.phone.name}
            defaultValue={rowFields.phone.initialValue}
            fullWidth
            size="small"
            disabled={isLoading}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">+34</InputAdornment>
                ),
              },
            }}
            error={!!rowFields.phone.errors}
            helperText={rowFields.phone.errors?.join(", ")}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <FormControl fullWidth size="small" error={!!rowFields.gender.errors}>
            <InputLabel>Género</InputLabel>
            <Select
              key={rowFields.gender.key}
              label="Género"
              name={rowFields.gender.name}
              defaultValue={rowFields.gender.initialValue ?? "Masculino"}
              disabled={isLoading}
            >
              {SharedMemberSchemas.GENDER.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 6, sm: 2.5 }}>
          <DatePicker
            key={rowFields.birth_date.key}
            label="Fecha de Nacimiento *"
            value={selectedBirthDate}
            onChange={(val) => setSelectedBirthDate(val)}
            disabled={isLoading}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                error: !!rowFields.birth_date.errors,
                helperText: rowFields.birth_date.errors?.join(", "),
              },
            }}
          />
          <input
            type="hidden"
            name={rowFields.birth_date.name}
            value={
              selectedBirthDate?.isValid()
                ? selectedBirthDate.format("DD-MM-YYYY")
                : ""
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <FormControl fullWidth size="small" error={!!rowFields.status.errors}>
            <InputLabel>Estado Civil</InputLabel>
            <Select
              key={rowFields.status.key}
              label="Estado"
              name={rowFields.status.name}
              defaultValue={rowFields.status.initialValue ?? "Soltero/a"}
              disabled={isLoading}
            >
              {SharedMemberSchemas.STATUS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid
          size={{ xs: 2, sm: 0.8 }}
          sx={{ textAlign: "center", mt: { xs: 0.5, sm: 0.5 } }}
        >
          <IconButton
            {...removeProps}
            type="button"
            color="error"
            disabled={isDisableDelete || isLoading}
            size="small"
            title={`Eliminar fila ${index + 1}`}
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
}
