// Copiado de server/src/models/income.model.ts
export enum IncomeSource {
    DIEZMO = 'Diezmo',
    OFRENDA = 'Ofrenda',
    CAFETERIA = 'Cafetería',
    OTRO = 'Otro'
}

export interface IncomeAttributes {
    id: number;
    person_id: number | null; 
    week_id: number;
    date: string;
    amount: number;
    source: IncomeSource;
}

// Opcionalidad para la creación (id es auto-generado)
export interface IncomeCreationAttributes extends Optional<IncomeAttributes, 'id' | 'person_id'> {}