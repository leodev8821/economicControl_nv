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
  Fade, // <--- Importamos Fade para la animación
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
import * as SharedIncomeSchemas from "@economic-control/shared";
import { usePersons } from "../../hooks/usePerson";
import { useWeeks } from "../../hooks/useWeek";
import { useCashes } from "../../hooks/useCash";

interface BulkIncomeFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export default function BulkIncomeForm({
  onSubmit,
  isLoading,
}: BulkIncomeFormProps) {
  const [globalWeekId, setGlobalWeekId] = React.useState("");
  const { data: availableWeeks = [] } = useWeeks();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: SharedIncomeSchemas.BulkIncomeSchema,
      });
    },
    onSubmit(event) {
      onSubmit(event);
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onBlur",
    defaultValue: {
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
            Registro Masivo
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
              value={globalWeekId}
              onChange={(e) => setGlobalWeekId(e.target.value)}
              label="Semana del Movimiento"
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

        <Stack spacing={2} sx={{ mb: 4 }}>
          {incomeList.map((income, index) => (
            /* Aplicamos el Fade a cada fila */
            <Fade in={true} key={income.key} timeout={400}>
              <Box>
                <IncomeRow
                  field={income}
                  removeProps={{
                    onClick: () =>
                      form.remove({ name: fields.incomes.name, index }),
                  }}
                  isDisableDelete={incomeList.length === 1}
                  isLoading={isLoading}
                  index={index} // <--- Pasamos el index correctamente
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

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading || !globalWeekId}
            fullWidth={isMobile}
          >
            {isLoading
              ? "Procesando..."
              : `Confirmar y Guardar (${incomeList.length})`}
          </Button>
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
  index, // <--- Uso del index para UI
}: any) {
  const rowFields = field.getFieldset();
  const { data: availableCashes = [] } = useCashes();
  const { data: availablePersons = [] } = usePersons();

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
            label="Fecha *"
            value={selectedDate}
            onChange={(val) => setSelectedDate(val)}
            disabled={isLoading}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                error: !!rowFields.date.errors,
                helperText: rowFields.date.errors,
              },
            }}
          />
          <input
            type="hidden"
            name={rowFields.date.name}
            value={selectedDate?.format("YYYY-MM-DD") ?? ""}
          />
        </Grid>

        <Grid size={{ xs: 6, sm: 2 }}>
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
            helperText={rowFields.amount.errors}
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

        <Grid size={{ xs: 6, sm: 2 }}>
          <FormControl fullWidth size="small" error={!!rowFields.source.errors}>
            <InputLabel>Fuente</InputLabel>
            <Select
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
          <FormControl fullWidth size="small">
            <InputLabel>Persona</InputLabel>
            <Select
              label="Persona"
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
