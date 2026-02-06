import Box from "@mui/material/Box";
import {
  DataGrid,
  type GridColDef,
  type GridRowId,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Outcome } from "@modules/finance/types/outcome.type";

interface OutcomeTableProps {
  outcomes: Outcome[];
  onEdit: (outcome: Outcome) => void;
  onDelete: (id: GridRowId) => void;
}

export default function OutcomeTable({
  outcomes,
  onEdit,
  onDelete,
}: OutcomeTableProps) {
  const columns: GridColDef<Outcome>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "Cash",
      headerName: "Caja",
      width: 130,
      renderCell: (params) => {
        const cash = params.row.Cash;
        return cash ? cash.name : "-";
      },
    },
    {
      field: "Week",
      headerName: "Semana",
      width: 200,
      renderCell: (params) => {
        const week = params.row.Week;
        return week
          ? `S${week.id} (${new Date(
              week.week_start,
            ).toLocaleDateString()} al ${new Date(
              week.week_end,
            ).toLocaleDateString()})`
          : "-";
      },
    },
    {
      field: "date",
      headerName: "Fecha",
      width: 120,
      renderCell: (params) => new Date(params.row.date).toLocaleDateString(),
    },
    {
      field: "amount",
      headerName: "Monto",
      type: "number",
      width: 110,
      renderCell: (params) => `${params.row.amount.toFixed(2)} €`,
    },
    {
      field: "description",
      headerName: "Descripción",
      width: 200,
      renderCell: (params) => params.row.description || "-",
    },
    {
      field: "category",
      headerName: "Categoría",
      width: 130,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Acciones",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={() => onEdit(params.row)}
          key="edit"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Eliminar"
          onClick={() => onDelete(params.id)}
          key="delete"
        />,
      ],
    },
  ];

  return (
    <Box
      sx={{
        p: 4,
        borderRadius: 2,
        width: "100%",
        maxWidth: "1200px",
        mx: "auto",
      }}
    >
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
        disableRowSelectionOnClick
      />
    </Box>
  );
}
