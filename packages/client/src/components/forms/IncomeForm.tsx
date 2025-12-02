import * as React from 'react';
import { type Theme, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod/v4';
import { useCreateIncome } from '../../hooks/useIncome'
import { usePersons } from '../../hooks/usePerson';
import { useWeeks } from '../../hooks/useWeek';
import { useCashes } from '../../hooks/useCash';
import * as SharedIncomeSchemas from '@economic-control/shared';
import InputAdornment from '@mui/material/InputAdornment';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';

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
    fontWeight: selectedValue === name
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

export default function IncomeForm() {
    const theme = useTheme();

    // 1. Hooks de datos necesarios: cajas, semanas y personas
    const {
        data: availableCashes = [],
        isLoading: isLoadingCashes,
        isError: isErrorCashes
    } = useCashes();

    const {
        data: availableWeeks = [], 
        isLoading: isLoadingWeeks, 
        isError: isErrorWeeks 
    } = useWeeks();

    const { 
        data: availablePersons = [], 
        isLoading: isLoadingPersons, 
        isError: isErrorPersons 
    } = usePersons();
    
    // Hook de mutación para enviar datos a la API (POST /incomes/new-income)
    const createMutation = useCreateIncome();
    const [statusMessage, setStatusMessage] = React.useState('');

    // Local state for MUI Selects
    const [cashId, setCashId] = React.useState('');
    const [weekId, setWeekId] = React.useState('');
    const [source, setSource] = React.useState('');
    const [personId, setPersonId] = React.useState('');
    const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(null);

    const handleCashChange = (event: SelectChangeEvent) => {
        setCashId(event.target.value);
    };

    const handleWeekChange = (event: SelectChangeEvent) => {
        setWeekId(event.target.value);
    };

    const handleSourceChange = (event: SelectChangeEvent) => {
        setSource(event.target.value);
    };

    const handlePersonChange = (event: SelectChangeEvent) => {
        setPersonId(event.target.value);
    };

    // 2. Estado de deshabilitación: si está enviando, o si está cargando/fallando la lista de personas
    const isFormDisabled = createMutation.isPending || isLoadingPersons || isErrorPersons || isLoadingWeeks || isErrorWeeks || isLoadingCashes || isErrorCashes;

    // 3. Inicialización de Conform
    const [form, fields] = useForm({
        // La validación en el cliente usa el esquema Zod final con la lógica de negocio
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: SharedIncomeSchemas.IncomeCreationSchema });
        },
        shouldValidate: 'onBlur', // Valida al salir del campo
        shouldRevalidate: 'onInput' // Vuelve a validar al escribir
    });

    // 4. Manejador de Envío
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatusMessage(''); // Limpiar mensajes de estado
        
        // Guardar referencia al formulario
        const form = event.currentTarget;
        const formData = new FormData(form);
        
        // 4a. Validación Final en el Cliente
        const submission = parseWithZod(formData, { schema: SharedIncomeSchemas.IncomeCreationSchema });

        // Si la validación local falla (ej. campo requerido vacío), Conform actualiza los errores.
        if (submission.status !== 'success') {
            return;
        }

        console.warn('submission.value:', submission.value);

        // 4b. Envío al Servidor (React Query Mutation)
        try {
            // El mutateAsync usa el valor limpio y tipado de Zod (submission.value)
            await createMutation.mutateAsync(submission.value); 
            
            // Éxito:
            setStatusMessage("✅ Ingreso registrado con éxito.");
            form.reset(); // Limpia el formulario usando la referencia guardada
            // Reset local state
            setCashId('');
            setWeekId('');
            setSource('');
            setSource('');
            setPersonId('');
            setSelectedDate(null);
            
        } catch (error) {
            // Error de la API (400 Bad Request o 500 Server Error)
            const apiError = error instanceof Error ? error.message : "Error desconocido al crear el ingreso.";
            
            // Intentar extraer errores de campo del servidor (si la API los devuelve con un formato específico)
            // Aquí, asumimos que el error es un mensaje general para simplicidad.
            setStatusMessage(`❌ Error: ${apiError}`);
        }
    };


    return (
        <form method="post" id={form.id} onSubmit={handleSubmit} className="income-form">
            <h2>Crear Nuevo Ingreso</h2>
            
            {/* Mensaje de estado (éxito/error de la API) */}
            {statusMessage && (
                <p style={{ color: statusMessage.startsWith('❌') ? 'red' : 'green', padding: '10px', border: '1px solid currentColor' }}>
                    {statusMessage}
                </p>
            )}
            
            {/* Errores a nivel de formulario (si existen) */}
            {form.errors && <div style={{ color: 'red' }}>{form.errors}</div>}

            <Grid container spacing={2}>
                {/* --- Campo cash_id (Requerido) --- */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth error={!!fields.cash_id.errors}>
                        <InputLabel id="cash-select-label">Caja</InputLabel>
                        <Select
                            labelId="cash-select-label"
                            id={fields.cash_id.id}
                            name={fields.cash_id.name}
                            value={cashId}
                            onChange={handleCashChange}
                            input={<OutlinedInput label="Caja" />}
                            MenuProps={MenuProps}
                            disabled={isFormDisabled}
                        >
                            <MenuItem value="">
                                <em>
                                    {isLoadingCashes && 'Cargando cajas...'}
                                    {isErrorCashes && 'Error al cargar cajas'}
                                    {!isLoadingCashes && !isErrorCashes && availableCashes?.length === 0 && 'No hay cajas disponibles'}
                                    {!isLoadingCashes && !isErrorCashes && availableCashes?.length > 0 && 'Seleccione una caja'}
                                </em>
                            </MenuItem>
                            {!isLoadingCashes && !isErrorCashes && availableCashes && availableCashes.map((c) => (
                                <MenuItem
                                    key={c.id}
                                    value={c.id}
                                    style={getStyles(c.name, cashId, theme)}
                                >
                                    {c.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {fields.cash_id.errors && <FormHelperText>{fields.cash_id.errors}</FormHelperText>}
                        {isErrorCashes && <FormHelperText error>Hubo un error al cargar la lista de cajas.</FormHelperText>}
                    </FormControl>
                </Grid>

                {/* --- Campo week_id (Requerido) --- */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth error={!!fields.week_id.errors}>
                        <InputLabel id="week-select-label">ID Semana *</InputLabel>
                        <Select
                            labelId="week-select-label"
                            id={fields.week_id.id}
                            name={fields.week_id.name}
                            value={weekId}
                            onChange={handleWeekChange}
                            input={<OutlinedInput label="ID Semana *" />}
                            MenuProps={MenuProps}
                            disabled={createMutation.isPending}
                        >
                            <MenuItem value="">
                                <em>Seleccione una semana</em>
                            </MenuItem>
                            {availableWeeks.map((w) => (
                                <MenuItem
                                    key={w.id}
                                    value={w.id}
                                    style={getStyles(`Semana ${w.id}`, weekId, theme)}
                                >
                                    {`Semana ${w.id} (${w.week_start} al ${w.week_end})`}
                                </MenuItem>
                            ))}
                        </Select>
                        {fields.week_id.errors && <FormHelperText>{fields.week_id.errors}</FormHelperText>}
                    </FormControl>
                </Grid>

                {/* --- Campo date (Requerido) --- */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth error={!!fields.date.errors}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Fecha *"
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                                slotProps={{
                                    textField: {
                                        required: true,
                                        error: !!fields.date.errors,
                                        helperText: fields.date.errors,
                                        fullWidth: true,
                                    },
                                }}
                                disabled={createMutation.isPending}
                            />
                        </LocalizationProvider>
                        {/* Hidden input for form submission */}
                        <input
                            type="hidden"
                            name={fields.date.name}
                            value={selectedDate ? selectedDate.format('YYYY-MM-DD') : ''}
                        />
                    </FormControl>
                </Grid>
                
                {/* --- Campo amount (Requerido) --- */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth error={!!fields.amount.errors}>
                        <InputLabel htmlFor={fields.amount.id}>Monto *</InputLabel>
                        <OutlinedInput
                            id={fields.amount.id}
                            name={fields.amount.name}
                            type='number'
                            placeholder='Ej: 150.50'
                            disabled={createMutation.isPending}
                            required
                            inputProps={{ step: "0.01" }}
                            startAdornment={<InputAdornment position="start">€</InputAdornment>}
                            label="Monto *"
                        />
                        {fields.amount.errors && <FormHelperText>{fields.amount.errors}</FormHelperText>}
                    </FormControl>
                </Grid>

                {/* --- Campo source (Requerido, ENUM) --- */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth error={!!fields.source.errors}>
                        <InputLabel id="source-select-label">Fuente *</InputLabel>
                        <Select
                            labelId="source-select-label"
                            id={fields.source.id}
                            name={fields.source.name}
                            value={source}
                            onChange={handleSourceChange}
                            input={<OutlinedInput label="Fuente *" />}
                            MenuProps={MenuProps}
                            disabled={createMutation.isPending}
                        >
                            <MenuItem value="">
                                <em>Seleccione una fuente</em>
                            </MenuItem>
                            {SharedIncomeSchemas.INCOME_SOURCES.map((src) => (
                                <MenuItem
                                    key={src}
                                    value={src}
                                    style={getStyles(src, source, theme)}
                                >
                                    {src}
                                </MenuItem>
                            ))}
                        </Select>
                        {fields.source.errors && <FormHelperText>{fields.source.errors}</FormHelperText>}
                    </FormControl>
                </Grid>
                
                {/* --- Campo person_id (Opcional pero condicional) --- */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth error={!!fields.person_id.errors}>
                        <InputLabel id="person-select-label">Persona (Obligatorio para Diezmo)</InputLabel>
                        <Select
                            labelId="person-select-label"
                            id={fields.person_id.id}
                            name={fields.person_id.name}
                            value={personId}
                            onChange={handlePersonChange}
                            input={<OutlinedInput label="Persona (Obligatorio para Diezmo)" />}
                            MenuProps={MenuProps}
                            disabled={isFormDisabled}
                        >
                            <MenuItem value="">
                                <em>
                                    {isLoadingPersons && 'Cargando personas...'}
                                    {isErrorPersons && 'Error al cargar personas'}
                                    {!isLoadingPersons && !isErrorPersons && availablePersons?.length === 0 && 'No hay personas disponibles'}
                                    {!isLoadingPersons && !isErrorPersons && availablePersons?.length > 0 && 'Seleccione una persona'}
                                </em>
                            </MenuItem>
                            {!isLoadingPersons && !isErrorPersons && availablePersons && availablePersons.map((p) => (
                                <MenuItem
                                    key={p.id}
                                    value={p.id}
                                    style={getStyles(`${p.first_name} ${p.last_name}`, personId, theme)}
                                >
                                    {p.first_name} {p.last_name}
                                </MenuItem>
                            ))}
                        </Select>
                        {fields.person_id.errors && <FormHelperText>{fields.person_id.errors}</FormHelperText>}
                        {isErrorPersons && <FormHelperText error>Hubo un error al cargar la lista de personas.</FormHelperText>}
                    </FormControl>
                </Grid>

                <Grid size={12}>
                    <button type="submit" disabled={createMutation.isPending} style={{ width: '100%', padding: '12px', fontSize: '1rem' }}>
                        {createMutation.isPending ? 'Guardando...' : 'Guardar Ingreso'}
                    </button>
                </Grid>
            </Grid>
        </form>
    );
}