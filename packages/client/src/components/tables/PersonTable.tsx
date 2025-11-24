import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import type { Person } from '../../types/person.type';

interface PersonTableProps {
  persons: Person[];
}

const columns: GridColDef<Person>[] = [
  { 
    field: 'id', 
    headerName: 'ID', 
    width: 70 
  },
  {
    field: 'first_name',
    headerName: 'Nombre',
    width: 200,
    renderCell: (params) => 
      params.row.first_name || '-'
  },
  {
    field: 'last_name',
    headerName: 'Apellidos',
    width: 200,
    renderCell: (params) => 
      params.row.last_name || '-'
  },
  {
    field: 'dni',
    headerName: 'NIF',
    width: 200,
    renderCell: (params) => 
      params.row.dni || '-'
  },
  {
    field: 'isVisible',
    headerName: 'Activo?',
    type: 'boolean',
    width: 110,
    renderCell: (params) => {
      return params.row.isVisible === true ? 'Si' : `No`;
    }
  },
];

export default function PersonTable({ persons }: PersonTableProps) {
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={persons}
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
