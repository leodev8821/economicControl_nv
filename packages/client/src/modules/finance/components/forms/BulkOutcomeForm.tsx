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
import * as SharedOutcomeSchemas from "@economic-control/shared";
import { useWeeks } from "@modules/finance/hooks/useWeek";
import { useCashes } from "@modules/finance/hooks/useCash";

interface BulkOutcomeFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
  isLoading: boolean;
  initialValues?: {
    common_week_id?: string | number;
    outcomes: any[];
  };
  disableAdd?: boolean;
  isEditMode?: boolean;
}

export default function BulkOutcomeForm({
  onSubmit,
  onCancel,
  isLoading,
  initialValues,
  disableAdd = false,
  isEditMode = false,
}: BulkOutcomeFormProps) {
  const [globalWeekId, setGlobalWeekId] = React.useState(
    initialValues?.common_week_id?.toString() ?? "",
  );
  const { data: weeksResponse } = useWeeks();
  const availableWeeks = weeksResponse?.data ?? [];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const LOCAL_STORAGE_KEY = "bulk_outcome_draft";

  // --- Lógica de Borrador ---
  const saveToLocalStorage = (data: any) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  const [form, fields] = useForm({
    lastResult: initialValues as any,
    id: isEditMode
      ? `edit-outcome-${initialValues?.outcomes[0]?.id}`
      : "create-outcome-form",
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: SharedOutcomeSchemas.BulkOutcomeSchema,
      });
    },
    onSubmit(event) {
      onSubmit(event);
      if (!form.valid) return;
      if (!isEditMode) resetForm();
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onBlur",
    defaultValue: initialValues ?? {
      outcomes: [
        {
          date: dayjs().format("YYYY-MM-DD"),
          amount: "0",
          description: "",
          category: "",
          cash_id: "",
        },
      ],
    },
  });

  const outcomeList = fields.outcomes.getFieldList();

  const handleSaveDraft = () => {
    const draftData = {
      common_week_id: globalWeekId,
      outcomes: outcomeList.map((outcome) => {
        const nestedFields = (outcome as any).getFieldset();
        return {
          date:
            nestedFields.date.value ??
            nestedFields.date.initialValue ??
            dayjs().format("YYYY-MM-DD"),
          amount:
            nestedFields.amount.value ??
            nestedFields.amount.initialValue ??
            "0",
          description:
            nestedFields.description.value ??
            nestedFields.description.initialValue ??
            "",
          category:
            nestedFields.category.value ??
            nestedFields.category.initialValue ??
            "",
          cash_id:
            nestedFields.cash_id.value ??
            nestedFields.cash_id.initialValue ??
            "",
        };
      }),
    };
    saveToLocalStorage(draftData);
    alert("Borrador de egresos guardado");
  };

  const resetForm = React.useCallback(() => {
    form.reset();
    setGlobalWeekId("");
    form.update({
      name: fields.outcomes.name,
      value: [
        {
          date: dayjs().format("YYYY-MM-DD"),
          amount: "0",
          description: "",
          category: "",
          cash_id: "",
        },
      ],
    });
  }, [form, fields.outcomes.name]);

  React.useEffect(() => {
    if (initialValues?.common_week_id) {
      setGlobalWeekId(initialValues.common_week_id.toString());
    }
  }, [initialValues]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form {...getFormProps(form)}>
        {/* Cabecera idéntica a Incomes */}
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
            {isEditMode ? "Editar Egreso" : "Nuevos Egresos"}
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

        {/* Selector de Semana idéntico */}
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
          {outcomeList.map((outcome, index) => (
            <Fade in={true} key={outcome.key} timeout={400}>
              <Box>
                <OutcomeRow
                  field={outcome}
                  removeProps={{
                    onClick: () =>
                      form.remove({ name: fields.outcomes.name, index }),
                  }}
                  isDisableDelete={outcomeList.length === 1 || disableAdd}
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
                  name: fields.outcomes.name,
                  defaultValue: {
                    date: dayjs().format("YYYY-MM-DD"),
                    amount: "0",
                    description: "",
                    category: "",
                    cash_id: "",
                  },
                })
              }
              type="button"
              variant="outlined"
              startIcon={<AddCircleIcon />}
              disabled={isLoading}
              fullWidth={isMobile}
            >
              Añadir otro egreso
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
                  ? "Actualizar egreso"
                  : `Confirmar y Guardar (${outcomeList.length})`}
            </Button>
          </Stack>
        </Stack>
      </form>
    </LocalizationProvider>
  );
}

function OutcomeRow({
  field,
  removeProps,
  isDisableDelete,
  isLoading,
  index,
}: any) {
  const rowFields = field.getFieldset();
  const { data: availableCashes = [] } = useCashes();

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
      <Typography
        variant="subtitle2"
        color="error"
        sx={{ display: { xs: "block", sm: "none" }, mb: 1, fontWeight: "bold" }}
      >
        Egreso #{index + 1}
      </Typography>

      <Grid container spacing={2} alignItems="flex-start">
        <Grid size={{ xs: 6, sm: 2 }}>
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

        <Grid size={{ xs: 6, sm: 1.5 }}>
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

        <Grid size={{ xs: 12, sm: 2 }}>
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

        <Grid size={{ xs: 12, sm: 2.5 }}>
          <FormControl
            fullWidth
            size="small"
            error={!!rowFields.category.errors}
          >
            <InputLabel>Categoría</InputLabel>
            <Select
              key={rowFields.category.key}
              label="Categoría"
              name={rowFields.category.name}
              defaultValue={rowFields.category.initialValue ?? ""}
              disabled={isLoading}
            >
              {SharedOutcomeSchemas.OUTCOME_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {rowFields.category.errors?.join(", ")}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 10, sm: 3.2 }}>
          <TextField
            key={rowFields.description.key}
            label="Descripción"
            name={rowFields.description.name}
            defaultValue={rowFields.description.initialValue}
            fullWidth
            size="small"
            disabled={isLoading}
            error={!!rowFields.description.errors}
            helperText={rowFields.description.errors?.join(", ")}
            placeholder="Ej: Pago luz"
          />
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
