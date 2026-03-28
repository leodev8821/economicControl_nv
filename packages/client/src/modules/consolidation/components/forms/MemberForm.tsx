import * as React from "react";
import { useForm, getFormProps } from "@conform-to/react";
/**MUI */
import { useTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material";
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
  useMediaQuery,
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
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useConsolidationLeaders } from "@/modules/auth/hooks/useUser";
import type { UserType } from "@economic-control/shared";

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

function getStyles(name: string, selectedValue: string, theme: Theme) {
  return {
    fontWeight:
      selectedValue === name
        ? theme.typography.fontWeightMedium
        : theme.typography.fontWeightRegular,
  };
}

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
  const isMobile = useMediaQuery(
    "(max-width: 599px) and (orientation: portrait), (max-height: 500px) and (orientation: landscape)",
  );
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
          birth_date: "",
          status: "",
          visit_date: "",
          how_know_us: "",
          invited_by: "",
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
        const isInvitedByVisible =
          nestedFields.how_know_us.value === SharedMemberSchemas.HOW_KNOW_US[0];
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
            "",
          status:
            nestedFields.status.value ?? nestedFields.status.initialValue ?? "",
          visit_date:
            nestedFields.visit_date.value ??
            nestedFields.visit_date.initialValue ??
            "",
          how_know_us:
            nestedFields.how_know_us.value ??
            nestedFields.how_know_us.initialValue ??
            "",
          invited_by: isInvitedByVisible
            ? (nestedFields.invited_by.value ??
              nestedFields.invited_by.initialValue ??
              "")
            : null,
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
          user_id: "",
          first_name: "",
          last_name: "",
          phone: "",
          gender: "",
          birth_date: "",
          status: "",
          visit_date: "",
          how_know_us: "",
          invited_by: "",
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
          <Typography variant="h6" color="secondary" gutterBottom>
            {isEditMode
              ? `Editando Nueva Persona: ${initialValues?.members[0]?.first_name} ${initialValues?.members[0]?.last_name}`
              : "Crear Nueva Persona"}
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
                <MemberRow
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
                    user_id: "",
                    first_name: "",
                    last_name: "",
                    phone: "",
                    gender: "",
                    birth_date: "",
                    status: "",
                    visit_date: "",
                    how_know_us: "",
                    invited_by: "",
                  },
                })
              }
              type="button"
              variant="outlined"
              startIcon={<AddCircleIcon />}
              disabled={isLoading}
              fullWidth={isMobile}
            >
              Añadir otra persona
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
                  ? "Actualizar nueva persona"
                  : `Confirmar y Guardar (${memberList.length})`}
            </Button>
          </Stack>
        </Stack>
      </form>
    </LocalizationProvider>
  );
}

function MemberRow({
  field,
  removeProps,
  isDisableDelete,
  isLoading,
  index,
}: any) {
  const theme = useTheme();
  const { user } = useAuth();
  const rowFields = field.getFieldset();

  const canAssignLeader =
    user?.role_name === "Administrador" || user?.role_name === "SuperUser";

  let leaders: UserType[] | undefined;
  if (canAssignLeader) {
    leaders = useConsolidationLeaders().data;
  }

  const [selectedBirthDate, setSelectedBirthDate] =
    React.useState<Dayjs | null>(
      rowFields.birth_date.initialValue
        ? dayjs(rowFields.birth_date.initialValue)
        : null,
    );

  React.useEffect(() => {
    setSelectedBirthDate(
      rowFields.birth_date.initialValue
        ? dayjs(rowFields.birth_date.initialValue)
        : null,
    );
  }, [rowFields.birth_date.initialValue, rowFields.birth_date.key]);

  const [selectedVisitDate, setSelectedVisitDate] =
    React.useState<Dayjs | null>(
      rowFields.visit_date?.initialValue
        ? dayjs(rowFields.visit_date.initialValue)
        : null,
    );

  React.useEffect(() => {
    setSelectedVisitDate(
      rowFields.visit_date?.initialValue
        ? dayjs(rowFields.visit_date.initialValue)
        : null,
    );
  }, [rowFields.visit_date?.initialValue, rowFields.visit_date?.key]);

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        boxShadow: { xs: 1, sm: 0 },
        bgcolor: "background.paper",
      }}
    >
      {/* Etiqueta visible solo en móviles para identificar la fila */}
      <Typography
        variant="subtitle2"
        color="primary"
        sx={{ display: { xs: "block", sm: "none" }, mb: 1, fontWeight: "bold" }}
      >
        Nueva Persona #{index + 1}
      </Typography>

      <Grid container spacing={2} alignItems="flex-start">
        {canAssignLeader && (
          <Grid size={{ xs: 6, sm: 2 }}>
            <FormControl
              fullWidth
              size="small"
              error={!!rowFields.user_id.errors}
            >
              <InputLabel>Asignar Líder</InputLabel>
              <Select
                key={rowFields.user_id.key}
                label="Asignar Líder"
                name={rowFields.user_id.name}
                defaultValue={rowFields.user_id.initialValue ?? ""}
                disabled={isLoading}
                MenuProps={MenuProps}
              >
                {leaders?.map((leader) => (
                  <MenuItem
                    key={leader.id}
                    value={leader.id}
                    style={getStyles("user_id", leader.username, theme)}
                  >
                    {leader.username}
                  </MenuItem>
                ))}
              </Select>
              {rowFields.user_id.errors && (
                <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>
                  {rowFields.user_id.errors.join(", ")}
                </Typography>
              )}
            </FormControl>
          </Grid>
        )}
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
            type="string"
            name={rowFields.phone.name}
            defaultValue={rowFields.phone.initialValue}
            fullWidth
            size="small"
            disabled={isLoading}
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
              defaultValue={rowFields.gender.initialValue ?? ""}
              disabled={isLoading}
              MenuProps={MenuProps}
            >
              {SharedMemberSchemas.GENDER.map((s) => (
                <MenuItem
                  key={s}
                  value={s}
                  style={getStyles("gender", s, theme)}
                >
                  {s}
                </MenuItem>
              ))}
            </Select>
            {rowFields.gender.errors && (
              <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>
                {rowFields.gender.errors.join(", ")}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 6, sm: 2.5 }}>
          <DatePicker
            key={rowFields.birth_date.key}
            label="Fecha de Nacimiento *"
            value={selectedBirthDate}
            onChange={(val) => setSelectedBirthDate(val)}
            disabled={isLoading}
            format="DD-MM-YYYY"
            maxDate={dayjs()}
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
                ? selectedBirthDate.format("YYYY-MM-DD")
                : ""
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 2.5 }}>
          <DatePicker
            key={rowFields.visit_date?.key}
            label="Fecha de Visita *"
            value={selectedVisitDate}
            onChange={(val) => setSelectedVisitDate(val)}
            disabled={isLoading}
            format="DD-MM-YYYY"
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                error: !!rowFields.visit_date?.errors,
                helperText: rowFields.visit_date?.errors?.join(", "),
              },
            }}
          />
          <input
            type="hidden"
            name={rowFields.visit_date?.name}
            value={
              selectedVisitDate?.isValid()
                ? selectedVisitDate.format("YYYY-MM-DD")
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
              MenuProps={MenuProps}
            >
              {SharedMemberSchemas.STATUS.map((s) => (
                <MenuItem
                  key={s}
                  value={s}
                  style={getStyles("status", s, theme)}
                >
                  {s}
                </MenuItem>
              ))}
            </Select>
            {rowFields.status.errors && (
              <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>
                {rowFields.status.errors.join(", ")}
              </Typography>
            )}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <FormControl
            fullWidth
            size="small"
            error={!!rowFields.how_know_us.errors}
          >
            <InputLabel>Cómo nos conoció</InputLabel>
            <Select
              key={rowFields.how_know_us.key}
              label="Cómo nos conoció"
              name={rowFields.how_know_us.name}
              defaultValue={rowFields.how_know_us.initialValue ?? ""}
              disabled={isLoading}
              MenuProps={MenuProps}
            >
              {SharedMemberSchemas.HOW_KNOW_US.map((s) => (
                <MenuItem
                  key={s}
                  value={s}
                  style={getStyles("how_know_us", s, theme)}
                >
                  {s}
                </MenuItem>
              ))}
            </Select>
            {rowFields.how_know_us.errors && (
              <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>
                {rowFields.how_know_us.errors.join(", ")}
              </Typography>
            )}
          </FormControl>
        </Grid>

        {rowFields.how_know_us.value === SharedMemberSchemas.HOW_KNOW_US[0] ? (
          <Grid size={{ xs: 6, sm: 2 }}>
            <TextField
              key={rowFields.invited_by.key}
              label="¿Quién invitó?"
              type="string"
              name={rowFields.invited_by.name}
              defaultValue={rowFields.invited_by.initialValue}
              fullWidth
              size="small"
              disabled={isLoading}
              error={!!rowFields.invited_by.errors}
              helperText={rowFields.invited_by.errors?.join(", ")}
            />
          </Grid>
        ) : (
          <input type="hidden" name={rowFields.invited_by.name} value="" />
        )}

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
