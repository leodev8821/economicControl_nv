import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import type { Income } from '../../../../types/income';

interface IncomeTableProps {
  incomes: Income[];
}

const columns: GridColDef<Income>[] = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 90 
  },
  {
    field: 'Week',
    headerName: 'Semana',
    width: 200,
    renderCell: (params) => {
      const week = params.row.Week;
      return week ? 
        `S${week.id} (${new Date(week.week_start).toLocaleDateString()} al ${new Date(week.week_end).toLocaleDateString()})` :
        '-';
    }
  },
  {
    field: 'date',
    headerName: 'Fecha',
    width: 120,
    renderCell: (params) => 
      new Date(params.row.date).toLocaleDateString()
  },
  {
    field: 'amount',
    headerName: 'Monto',
    type: 'number',
    width: 110,
    renderCell: (params) => 
      `${params.row.amount.toFixed(2)} €`
  },
  {
    field: 'source',
    headerName: 'Fuente',
    width: 130
  },
  {
    field: 'Person',
    headerName: 'NIF de la Persona',
    width: 160,
    renderCell: (params) => 
      params.row.Person?.dni || '-'
  },
];

export default function IncomeTable({ incomes }: IncomeTableProps) {
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={incomes}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
}
