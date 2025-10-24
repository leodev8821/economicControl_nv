import React from 'react';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { useCreateIncome } from '../../../../hooks/useIncome'
import { usePersons } from '../../../../hooks/usePerson';
import { useWeeks } from '../../../../hooks/useWeek';
import { INCOME_SOURCES } from '../../../../types/income';
import { FinalIncomeCreationSchema } from '../../../../schemas/income.schema';

export default function IncomeForm() {

    // 1. Hooks de datos necesarios: semanas y personas
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

    // 2. Estado de deshabilitación: si está enviando, o si está cargando/fallando la lista de personas
    const isFormDisabled = createMutation.isPending || isLoadingPersons || isErrorPersons || isLoadingWeeks || isErrorWeeks;

    // 3. Inicialización de Conform
    const [form, fields] = useForm({
        // La validación en el cliente usa el esquema Zod final con la lógica de negocio
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: FinalIncomeCreationSchema });
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
        const submission = parseWithZod(formData, { schema: FinalIncomeCreationSchema });

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

            
            {/* --- Campo week_id (Requerido) --- */}
            <div>
                <label htmlFor={fields.week_id.id}>ID Semana *</label>
                <select 
                    id={fields.week_id.id}
                    name={fields.week_id.name}
                    required 
                    disabled={createMutation.isPending}
                >
                    <option value="">Seleccione una semana</option>
                    {availableWeeks.map(w => (
                        <option key={w.id} value={w.id}>
                            {`Semana ${w.id} (${w.week_start} al ${w.week_end})`}
                        </option>
                    ))}
                </select>
                {fields.week_id.errors && <div style={{ color: 'red' }}>{fields.week_id.errors}</div>}
            </div>

            {/* --- Campo date (Requerido) --- */}
            <div>
                <label htmlFor={fields.date.id}>Fecha *</label>
                <input 
                    type="date"
                    id={fields.date.id}
                    name={fields.date.name}
                    required 
                    disabled={createMutation.isPending} 
                />
                {fields.date.errors && <div style={{ color: 'red' }}>{fields.date.errors}</div>}
            </div>
            
            {/* --- Campo amount (Requerido) --- */}
            <div>
                <label htmlFor={fields.amount.id}>Monto *</label>
                <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Ej: 150.50"
                    id={fields.amount.id}
                    name={fields.amount.name}
                    required 
                    disabled={createMutation.isPending} 
                />
                {fields.amount.errors && <div style={{ color: 'red' }}>{fields.amount.errors}</div>}
            </div>

            {/* --- Campo source (Requerido, ENUM) --- */}
            <div>
                <label htmlFor={fields.source.id}>Fuente *</label>
                <select 
                    id={fields.source.id} 
                    name={fields.source.name}
                    required 
                    disabled={createMutation.isPending}
                >
                    <option value="">Seleccione una fuente</option>
                    {INCOME_SOURCES.map((source) => (
                        <option key={source} value={source}>
                            {source}
                        </option>
                    ))}
                </select>
                {fields.source.errors && <div style={{ color: 'red' }}>{fields.source.errors}</div>}
            </div>
            
            {/* --- Campo person_id (Opcional pero condicional) --- */}
            <div>
                <label htmlFor={fields.person_id.id}>Persona (Obligatorio para Diezmo)</label>
                <select 
                    id={fields.person_id.id}
                    name={fields.person_id.name}
                    // Deshabilitado si el formulario está ocupado o si las personas no han cargado
                    disabled={isFormDisabled}
                >
                    {/* 🚨 Manejo de estados de React Query en la primera opción */}
                    <option value="">
                        {isLoadingPersons && 'Cargando personas...'}
                        {isErrorPersons && 'Error al cargar personas'}
                        {!isLoadingPersons && !isErrorPersons && availablePersons?.length === 0 && 'No hay personas disponibles'}
                        {!isLoadingPersons && !isErrorPersons && availablePersons?.length > 0 && '-- No aplicar a una persona --'}
                    </option>
                    
                    {/* 🚨 Renderizar opciones solo si los datos están listos */}
                    {!isLoadingPersons && !isErrorPersons && availablePersons && availablePersons.map(p => (
                        // Asumimos que la interfaz Person tiene 'id', 'first_name', 'last_name'
                        <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option> 
                    ))}
                </select>
                {fields.person_id.errors && <div style={{ color: 'red' }}>{fields.person_id.errors}</div>}
                
                {/* Opcional: Mostrar error de carga de forma separada si el select está disabled */}
                {isErrorPersons && <div style={{ color: 'red', marginTop: '5px' }}>Hubo un error al cargar la lista de personas.</div>}
            </div>


            <button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Guardando...' : 'Guardar Ingreso'}
            </button>
        </form>
    );
}