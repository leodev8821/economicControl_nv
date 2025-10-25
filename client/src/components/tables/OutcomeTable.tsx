import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import type { Outcome } from '../../types/outcome';

interface OutcomeTableProps {
  outcomes: Outcome[];
}

const columns: GridColDef<Outcome>[] = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 70 
  },
  {
    field: 'Cash',
    headerName: 'Caja',
    width: 130,
    renderCell: (params) => {
      const cash = params.row.Cash;
      return cash ? cash.name : '-';
    }
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
    field: 'description',
    headerName: 'Descripción',
    width: 200,
    renderCell: (params) => 
      params.row.description || '-'
  },
  {
    field: 'category',
    headerName: 'Categoría',
    width: 130
  }
];

export default function OutcomeTable({ outcomes }: OutcomeTableProps) {
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={outcomes}
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
