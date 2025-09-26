import { useGetIncomesQuery } from '../../../store/api/incomeApi'; 

// Type Guard personalizado para errores de RTK Query
const isFetchBaseQueryError = (error: any): error is { 
  status: number; 
  data: any; 
} => {
  return typeof error === 'object' && 
         error !== null && 
         'status' in error && 
         'data' in error;
};

// --- COMPONENTE PRINCIPAL ---
const IncomeList: React.FC = () => {
    // 1. Obtener datos y estados de la consulta (hook RTK Query)
    const { 
        data: response, 
        isLoading, 
        isSuccess, 
        isError, 
        error 
    } = useGetIncomesQuery(); // Llamada sin argumentos para obtener todos

    // --- Lógica de Manejo de Errores y Estados ---

    // Función auxiliar para obtener un mensaje de error legible
    const getErrorMessage = (): string => {
        if (!error) return 'Error desconocido.';
        
        // Usamos el Type Guard para verificar si es un error de la base de consulta
        if (isFetchBaseQueryError(error)) {
            // Intenta acceder al mensaje del servidor (asumiendo que está en 'data')
            const serverError = error.data as { message?: string };
            return serverError?.message 
                ?? `Error de servidor HTTP ${error.status}`;
        }
        
        // Si es un error de serialización o cliente
        return (error as { message?: string }).message ?? 'Error de Redux/Cliente';
    };

    if (isLoading) {
        return <div className="loading">Cargando ingresos...</div>;
    }

    if (isError) {
        return <div className="error">Error al cargar: {getErrorMessage()}</div>;
    }
    
    // Si no hay respuesta o la respuesta no tiene datos (esSuccess es true pero data es nula/vacía)
    if (isSuccess && (!response || response.data.length === 0)) {
        return <div className="empty">Aún no hay ingresos registrados.</div>;
    }

    // Extraer la lista de ingresos
    const incomes: Income[] = response?.data || [];

    // --- Renderizado de la Lista ---
    return (
        <div className="income-list-container">
            <h1>Registro de Ingresos</h1>
            <ul className="income-list">
                {incomes.map((income: Income) => {
                    // Convertir amount a número y manejar casos donde no sea un número válido
                    const amount = typeof income.amount === 'number' 
                        ? income.amount 
                        : parseFloat(income.amount as string) || 0;
                    
                    return (
                        <li key={income.id} className="income-item">
                            <span className="income-date">{income.date}</span>
                            <span className="income-amount">${amount.toFixed(2)}</span>
                            <span className="income-source">{income.source}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default IncomeList;