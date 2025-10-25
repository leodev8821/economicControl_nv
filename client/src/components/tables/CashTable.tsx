import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import type { Cash } from '../../types/cash';

interface CashTableProps {
  cashes: Cash[];
}

const columns: GridColDef<Cash>[] = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 70 
  },
  {
    field: 'name',
    headerName: 'Nombre',
    width: 200,
    renderCell: (params) => 
      params.row.name || '-'
  },
  {
    field: 'actual_amount',
    headerName: 'Monto Actual',
    type: 'number',
    width: 110,
    renderCell: (params) => {
      const amount = Number(params.row.actual_amount);
      return isNaN(amount) ? '-' : `${amount.toFixed(2)} €`;
    }
  },
  {
    field: 'pettyCash_limit',
    headerName: 'Límite de Caja',
    type: 'number',
    width: 110,
    renderCell: (params) => {
      const limit = params.row.pettyCash_limit ? Number(params.row.pettyCash_limit) : null;
      return limit === null || isNaN(limit) ? '-' : `${limit.toFixed(2)} €`;
    }
  },
];

export default function CashTable({ cashes }: CashTableProps) {
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={cashes}
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
