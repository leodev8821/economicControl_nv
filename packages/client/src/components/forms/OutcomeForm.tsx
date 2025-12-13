import * as React from 'react';
/**MUI */
import { type Theme, useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { Button, Stack } from '@mui/material';
import { useForm } from '@conform-to/react';

/** Schemas de validación */
import { parseWithZod } from '@conform-to/zod/v4';
import * as SharedOutcomeSchemas from '@economic-control/shared';

/**Types */
import type { Outcome } from '../../types/outcome.type';

/**Hooks de datos necesarios: cajas, semanas y personas */
import { useWeeks } from '../../hooks/useWeek';
import { useCashes } from '../../hooks/useCash';

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
    fontWeight: selectedValue === name
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

interface OutcomeFormProps {
    initialValues?: Outcome | null;
    onSubmit: (data: SharedOutcomeSchemas.OutcomeCreationRequest) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    isUpdateMode?: boolean;
}

export default function OutcomeForm({ initialValues, onSubmit, onCancel, isLoading = false, isUpdateMode = false }: OutcomeFormProps) {
    const theme = useTheme();

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

    // Local state for MUI Selects
    // Initialize with default values if provided
    const [cashId, setCashId] = React.useState(initialValues?.cash_id?.toString() || '');
    const [weekId, setWeekId] = React.useState(initialValues?.week_id?.toString() || '');
    const [category, setCategory] = React.useState(initialValues?.category || '');
    const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(initialValues?.date ? dayjs(initialValues.date) : null);

    // Update local state when initialValues change
    React.useEffect(() => {
        if (initialValues) {
            setCashId(initialValues.cash_id?.toString() || '');
            setWeekId(initialValues.week_id?.toString() || '');
            setCategory(initialValues.category || '');
            setSelectedDate(initialValues.date ? dayjs(initialValues.date) : null);
        } else {
            // Reset fields if switching to create mode (and no initialValues)
            setCashId('');
            setWeekId('');
            setCategory('');
            setSelectedDate(null);
        }
    }, [initialValues]);


    const handleCashChange = (event: SelectChangeEvent) => {
        setCashId(event.target.value);
    };

    const handleWeekChange = (event: SelectChangeEvent) => {
        setWeekId(event.target.value);
    };

    const handleCategoryChange = (event: SelectChangeEvent) => {
        setCategory(event.target.value);
    };

    // 2. Estado de deshabilitación: si está enviando, o si está cargando/fallando la lista de cajas y semanas
    const isFormDisabled = isLoading || isLoadingWeeks || isErrorWeeks || isLoadingCashes || isErrorCashes;

    // 3. Inicializacion  de Conform-to
    const [form, fields] = useForm({
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: SharedOutcomeSchemas.OutcomeCreationSchema });
        },
        shouldValidate: 'onBlur',
        shouldRevalidate: 'onInput',
        defaultValue: initialValues ? {
             ...initialValues,
             cash_id: initialValues.cash_id.toString(),
             week_id: initialValues.week_id.toString(),
             date: initialValues.date, 
             // amount might need string conversion depending on how conform handles it, but usually number is fine or string
             // HTML inputs usually return strings.
        } as any : undefined
    });

    // 4. Manejador de envío
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        // Guarda referencia al formulario
        const formEl = event.currentTarget;
        const formData = new FormData(formEl);
        
        // Validación final en el cliente
        const submission = parseWithZod(formData, { schema: SharedOutcomeSchemas.OutcomeCreationSchema });

        if (submission.status !== 'success') {
            return;
        }

        // Pass clean data to parent
        onSubmit(submission.value);

        // Only reset if NOT in update mode? Or let parent handle it? 
        // Usually better to let parent decide, or if Create mode, reset.
        if (!isUpdateMode) {
             formEl.reset(); 
             setCashId('');
             setWeekId('');
             setCategory('');
             setSelectedDate(null);
        }
    };

    return (
        <form method="post" id={form.id} onSubmit={handleSubmit} className="outcome-form">
            <h2>{isUpdateMode ? 'Editar Gasto' : 'Crear Nuevo Gasto'}</h2>
            
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
                            disabled={isLoading}
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
                                disabled={isLoading}
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
                            disabled={isLoading}
                            required
                            defaultValue={initialValues?.amount}
                            inputProps={{ step: "0.01" }}
                            startAdornment={<InputAdornment position="start">€</InputAdornment>}
                            label="Monto *"
                        />
                        {fields.amount.errors && <FormHelperText>{fields.amount.errors}</FormHelperText>}
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth error={!!fields.description.errors}>
                        <InputLabel htmlFor={fields.description.id}>Descripción *</InputLabel>
                        <OutlinedInput
                            id={fields.description.id}
                            name={fields.description.name}
                            placeholder='Ej: Alquiler mes enero'
                            disabled={isLoading}
                            defaultValue={initialValues?.description}
                            required
                            label="Descripción *"
                        />
                        {fields.description.errors && <FormHelperText>{fields.description.errors}</FormHelperText>}
                    </FormControl>
                </Grid>

                {/* --- Campo category (Requerido, ENUM) --- */}
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth error={!!fields.category.errors}>
                        <InputLabel id="category-select-label">Categoría *</InputLabel>
                        <Select
                            labelId="category-select-label"
                            id={fields.category.id}
                            name={fields.category.name}
                            value={category}
                            onChange={handleCategoryChange}
                            input={<OutlinedInput label="Categoría *" />}
                            MenuProps={MenuProps}
                            disabled={isLoading}
                        >
                            <MenuItem value="">
                                <em>Seleccione una categoría</em>
                            </MenuItem>
                            {SharedOutcomeSchemas.OUTCOME_CATEGORIES.map((src) => (
                                <MenuItem
                                    key={src}
                                    value={src}
                                    style={getStyles(src, category, theme)}
                                >
                                    {src}
                                </MenuItem>
                            ))}
                        </Select>
                        {fields.category.errors && <FormHelperText>{fields.category.errors}</FormHelperText>}
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
                            {isLoading ? 'Guardando...' : (isUpdateMode ? 'Actualizar Egreso' : 'Guardar Egreso')}
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </form>
    );

};