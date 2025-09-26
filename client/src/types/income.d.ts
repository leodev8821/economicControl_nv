// Estructura de los datos que esperas recibir para un solo ingreso
interface Income {
    id: number;
    person_id: number | null;
    week_id: number;
    date: string; // La fecha viene como string (YYYY-MM-DD)
    amount: number; // Decimal se maneja como number en TS
    source: string; // Tipo IncomeSource: 'Diezmo', 'Ofrenda', etc.
    // Si incluyes relaciones (ej. la persona o la semana), deberías añadirlas aquí
}

// Estructura de la respuesta completa del backend (asumiendo que sigue tu estándar)
interface IncomesResponse {
    ok: boolean;
    message: string;
    data: Income[]; // La lista de ingresos
}