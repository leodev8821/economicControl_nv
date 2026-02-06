import Box from "@mui/material/Box";
import {
  DataGrid,
  type GridColDef,
  type GridRowId,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Cash } from "@modules/finance/types/cash.type";

interface CashTableProps {
  cashes: Cash[];
  onEdit: (cash: Cash) => void;
  onDelete: (id: GridRowId) => void;
}

export default function CashTable({
  cashes,
  onEdit,
  onDelete,
}: CashTableProps) {
  const columns: GridColDef<Cash>[] = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "name",
      headerName: "Nombre",
      width: 200,
      renderCell: (params) => params.row.name || "-",
    },
    {
      field: "actual_amount",
      headerName: "Monto Actual",
      type: "number",
      width: 150,
      renderCell: (params) => {
        const amount = Number(params.row.actual_amount);
        return isNaN(amount) ? "-" : `${amount.toFixed(2)} €`;
      },
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
        disableRowSelectionOnClick
      />
    </Box>
  );
}
