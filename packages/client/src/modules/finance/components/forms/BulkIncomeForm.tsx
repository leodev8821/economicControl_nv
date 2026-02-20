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
  FormHelperText,
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
import * as SharedIncomeSchemas from "@economic-control/shared";
import { usePersons } from "@modules/finance/hooks/usePerson";
import { useWeeks } from "@modules/finance/hooks/useWeek";
import { useCashes } from "@modules/finance/hooks/useCash";

interface BulkIncomeFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
  isLoading: boolean;
  initialValues?: {
    common_week_id?: string | number;
    incomes: any[];
  };
  disableAdd?: boolean;
  isEditMode?: boolean;
}

export default function BulkIncomeForm({
  onSubmit,
  onCancel,
  isLoading,
  initialValues,
  disableAdd = false,
  isEditMode = false,
}: BulkIncomeFormProps) {
  const [globalWeekId, setGlobalWeekId] = React.useState(
    initialValues?.common_week_id?.toString() ?? "",
  );
  const { data: weeksResponse } = useWeeks();
  const availableWeeks = weeksResponse?.data ?? [];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const LOCAL_STORAGE_KEY = "bulk_income_draft";

  // Helper para guardar
  const saveToLocalStorage = (data: any) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  const [form, fields] = useForm({
    lastResult: initialValues as any,
    id: isEditMode ? `edit-${initialValues?.incomes[0]?.id}` : "create-form",
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: SharedIncomeSchemas.BulkIncomeSchema,
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
      incomes: [
        {
          date: dayjs().format("YYYY-MM-DD"),
          amount: "0",
          source: "Ofrenda",
          cash_id: "",
          person_id: "",
        },
      ],
    },
  });

  const incomeList = fields.incomes.getFieldList();

  const handleSaveDraft = () => {
    // Para obtener los valores actuales sin que falle el tipo:
    const draftData = {
      common_week_id: globalWeekId,
      incomes: incomeList.map((income) => {
        // Accedemos al valor actual de cada campo dentro del objeto del array
        const nestedFields = (income as any).getFieldset();
        return {
          // Usamos value (lo que escribió el usuario) o initialValue (lo que venía de props)
          date:
            nestedFields.date.value ??
            nestedFields.date.initialValue ??
            dayjs().format("YYYY-MM-DD"),
          amount:
            nestedFields.amount.value ??
            nestedFields.amount.initialValue ??
            "0",
          source:
            nestedFields.source.value ??
            nestedFields.source.initialValue ??
            "Ofrenda",
          cash_id:
            nestedFields.cash_id.value ??
            nestedFields.cash_id.initialValue ??
            "",
          person_id:
            nestedFields.person_id.value ??
            nestedFields.person_id.initialValue ??
            "",
        };
      }),
    };

    saveToLocalStorage(draftData);
    alert("Borrador guardado localmente");
  };

  const resetForm = React.useCallback(() => {
    form.reset();

    setGlobalWeekId("");

    form.update({
      name: fields.incomes.name,
      value: [
        {
          date: dayjs().format("YYYY-MM-DD"),
          amount: "0",
          source: "Ofrenda",
          cash_id: "",
          person_id: "",
        },
      ],
    });
  }, [form, fields.incomes.name]);

  React.useEffect(() => {
    if (initialValues?.common_week_id) {
      setGlobalWeekId(initialValues.common_week_id.toString());
    }
  }, [initialValues]);

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
            {isEditMode ? "Editar Ingreso" : "Nuevos Ingresos"}
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
            disabled={isLoading || !globalWeekId}
            fullWidth={isMobile}
          >
            Guardar Todo
          </Button>
        </Box>

        <Box
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            bgcolor: "#f8f9fa",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          <FormControl fullWidth sx={{ maxWidth: { xs: "100%", sm: 400 } }}>
            <InputLabel>Semana del Movimiento</InputLabel>
            <Select
              key={fields.common_week_id.key}
              value={globalWeekId}
              onChange={(e) => setGlobalWeekId(e.target.value)}
              label="Semana del Movimiento"
              name="common_week_id"
            >
              {availableWeeks.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  Semana {w.id} desde el (
                  {dayjs(w.week_start).format("DD/MM/YY")})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Stack spacing={2} sx={{ mb: 4 }}>
          {incomeList.map((income, index) => (
            <Fade in={true} key={income.key} timeout={400}>
              <Box>
                <IncomeRow
                  field={income}
                  removeProps={{
                    onClick: () =>
                      form.remove({ name: fields.incomes.name, index }),
                  }}
                  isDisableDelete={incomeList.length === 1 || disableAdd}
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
                  name: fields.incomes.name,
                  defaultValue: {
                    date: dayjs().format("YYYY-MM-DD"),
                    amount: "0",
                    source: "Ofrenda",
                    cash_id: "",
                    person_id: "",
                  },
                })
              }
              type="button"
              variant="outlined"
              startIcon={<AddCircleIcon />}
              disabled={isLoading}
              fullWidth={isMobile}
            >
              Añadir otro ingreso
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
              disabled={isLoading || !globalWeekId}
              fullWidth={isMobile}
            >
              {isLoading
                ? "Procesando..."
                : isEditMode
                  ? "Actualizar ingreso"
                  : `Confirmar y Guardar (${incomeList.length})`}
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
  const isPersonRequired = ["Diezmo", "Primicia"].includes(
    rowFields.source.value,
  );
  const { data: availableCashes = [] } = useCashes();
  const { data: availablePersons = [] } = usePersons();

  const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(
    rowFields.date.initialValue ? dayjs(rowFields.date.initialValue) : dayjs(),
  );

  React.useEffect(() => {
    setSelectedDate(
      rowFields.date.initialValue
        ? dayjs(rowFields.date.initialValue)
        : dayjs(),
    );
  }, [rowFields.date.initialValue, rowFields.date.key]);

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
        Ingreso #{index + 1}
      </Typography>

      <Grid container spacing={2} alignItems="flex-start">
        <Grid size={{ xs: 6, sm: 2.5 }}>
          <DatePicker
            key={rowFields.date.key}
            label="Fecha *"
            value={selectedDate}
            onChange={(val) => setSelectedDate(val)}
            disabled={isLoading}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                error: !!rowFields.date.errors,
                helperText: rowFields.date.errors?.join(", "),
              },
            }}
          />
          <input
            type="hidden"
            name={rowFields.date.name}
            value={
              selectedDate?.isValid() ? selectedDate.format("YYYY-MM-DD") : ""
            }
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <TextField
            key={rowFields.amount.key}
            label="Monto"
            type="number"
            name={rowFields.amount.name}
            defaultValue={rowFields.amount.initialValue}
            fullWidth
            size="small"
            disabled={isLoading}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">€</InputAdornment>
                ),
              },
            }}
            error={!!rowFields.amount.errors}
            helperText={rowFields.amount.errors?.join(", ")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 2.5 }}>
          <FormControl
            fullWidth
            size="small"
            error={!!rowFields.cash_id.errors}
          >
            <InputLabel>Caja</InputLabel>
            <Select
              key={rowFields.cash_id.key}
              label="Caja"
              name={rowFields.cash_id.name}
              defaultValue={rowFields.cash_id.initialValue ?? ""}
              disabled={isLoading}
            >
              {availableCashes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {rowFields.cash_id.errors?.join(", ")}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
          <FormControl fullWidth size="small" error={!!rowFields.source.errors}>
            <InputLabel>Fuente</InputLabel>
            <Select
              key={rowFields.source.key}
              label="Fuente"
              name={rowFields.source.name}
              defaultValue={rowFields.source.initialValue ?? "Ofrenda"}
              disabled={isLoading}
            >
              {SharedIncomeSchemas.INCOME_SOURCES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 4, sm: 2.2 }}>
          <FormControl
            fullWidth
            size="small"
            error={!!rowFields.person_id.errors}
          >
            <InputLabel>Persona {isPersonRequired ? "*" : ""}</InputLabel>
            <Select
              key={rowFields.person_id.key}
              label={`Persona ${isPersonRequired ? "*" : ""}`}
              name={rowFields.person_id.name}
              defaultValue={rowFields.person_id.initialValue ?? ""}
              disabled={isLoading}
            >
              <MenuItem value="">
                <em>Ninguna</em>
              </MenuItem>
              {availablePersons.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {rowFields.person_id.errors?.join(", ")}
            </FormHelperText>
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
