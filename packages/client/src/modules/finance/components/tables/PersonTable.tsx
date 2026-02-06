import Box from "@mui/material/Box";
import {
  DataGrid,
  GridActionsCellItem,
  type GridRowId,
} from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Person } from "@modules/finance/types/person.type";

interface PersonTableProps {
  persons: Person[];
  onEdit: (person: Person) => void;
  onDelete: (id: GridRowId) => void;
}

export default function PersonTable({
  persons,
  onEdit,
  onDelete,
}: PersonTableProps) {
  const columns: GridColDef<Person>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "first_name",
      headerName: "Nombre",
      width: 200,
      renderCell: (params) => params.row.first_name || "-",
    },
    {
      field: "last_name",
      headerName: "Apellidos",
      width: 200,
      renderCell: (params) => params.row.last_name || "-",
    },
    {
      field: "dni",
      headerName: "NIF",
      width: 200,
      renderCell: (params) => params.row.dni || "-",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Acciones",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => onEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => onDelete(params.id)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 400, width: "100%" }}>
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
