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
  isLoading: boolean;
}

export default function BulkOutcomeForm({
  onSubmit,
  isLoading,
}: BulkOutcomeFormProps) {
  const [globalWeekId, setGlobalWeekId] = React.useState("");
  const { data: availableWeeks = [] } = useWeeks();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: SharedOutcomeSchemas.BulkOutcomeSchema,
      });
    },
    onSubmit(event) {
      onSubmit(event);
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onBlur",
    defaultValue: {
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form {...getFormProps(form)}>
        {/* Cabecera del Formulario */}
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
            Carga Masiva de Egresos
          </Typography>

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

        {/* Selector de Semana Global */}
        <Box
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            bgcolor: "#fff5f5", // Un tono rojizo muy leve para diferenciar de ingresos
            borderRadius: 2,
            border: "1px solid #ffcdd2",
          }}
        >
          <FormControl fullWidth sx={{ maxWidth: { xs: "100%", sm: 400 } }}>
            <InputLabel>Semana del Gasto</InputLabel>
            <Select
              value={globalWeekId}
              onChange={(e) => setGlobalWeekId(e.target.value)}
              label="Semana del Gasto"
              name="common_week_id"
            >
              {availableWeeks.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  Semana {w.id} ({dayjs(w.week_start).format("DD/MM")})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Lista de Filas */}
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
                  isDisableDelete={outcomeList.length === 1}
                  isLoading={isLoading}
                  index={index}
                />
              </Box>
            </Fade>
          ))}
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Botones de Acción */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
        >
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
            Añadir otro gasto
          </Button>

          <Button
            type="submit"
            variant="contained"
            size="large"
            color="primary"
            disabled={isLoading || !globalWeekId}
            fullWidth={isMobile}
          >
            {isLoading
              ? "Procesando..."
              : `Confirmar y Guardar (${outcomeList.length})`}
          </Button>
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
        Gasto #{index + 1}
      </Typography>

      <Grid container spacing={2} alignItems="flex-start">
        {/* Fecha */}
        <Grid size={{ xs: 6, sm: 2 }}>
          <DatePicker
            label="Fecha *"
            value={selectedDate}
            onChange={(val) => setSelectedDate(val)}
            disabled={isLoading}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                error: !!rowFields.date.errors,
              },
            }}
          />
          <input
            type="hidden"
            name={rowFields.date.name}
            value={selectedDate?.format("YYYY-MM-DD") ?? ""}
          />
        </Grid>

        {/* Monto */}
        <Grid size={{ xs: 6, sm: 1.5 }}>
          <TextField
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
          />
        </Grid>

        {/* Caja */}
        <Grid size={{ xs: 12, sm: 2 }}>
          <FormControl
            fullWidth
            size="small"
            error={!!rowFields.cash_id.errors}
          >
            <InputLabel>Caja</InputLabel>
            <Select
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
            <FormHelperText>{rowFields.cash_id.errors}</FormHelperText>
          </FormControl>
        </Grid>

        {/* Categoría */}
        <Grid size={{ xs: 12, sm: 2.5 }}>
          <FormControl
            fullWidth
            size="small"
            error={!!rowFields.category.errors}
          >
            <InputLabel>Categoría</InputLabel>
            <Select
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
          </FormControl>
        </Grid>

        {/* Descripción */}
        <Grid size={{ xs: 10, sm: 3.2 }}>
          <TextField
            label="Descripción"
            name={rowFields.description.name}
            defaultValue={rowFields.description.initialValue}
            fullWidth
            size="small"
            disabled={isLoading}
            error={!!rowFields.description.errors}
            placeholder="Ej: Pago luz"
          />
        </Grid>

        {/* Borrar */}
        <Grid
          size={{ xs: 2, sm: 0.8 }}
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: { xs: 0.5, sm: 0.5 },
          }}
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
