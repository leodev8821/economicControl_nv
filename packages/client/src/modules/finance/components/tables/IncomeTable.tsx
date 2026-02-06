import Box from "@mui/material/Box";
import {
  DataGrid,
  type GridColDef,
  type GridRowId,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Income } from "@modules/finance/types/income.type";

interface IncomeTableProps {
  incomes: Income[];
  onEdit: (income: Income) => void;
  onDelete: (id: GridRowId) => void;
}

export default function IncomeTable({
  incomes,
  onEdit,
  onDelete,
}: IncomeTableProps) {
  const columns: GridColDef<Income>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
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
      field: "source",
      headerName: "Fuente",
      width: 130,
    },
    {
      field: "Person",
      headerName: "NIF de la Persona",
      width: 160,
      renderCell: (params) => params.row.Person?.dni || "-",
    },
    {
      field: "actions",
      headerName: "Acciones",
      type: "actions",
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
        disableRowSelectionOnClick
      />
    </Box>
  );
}
