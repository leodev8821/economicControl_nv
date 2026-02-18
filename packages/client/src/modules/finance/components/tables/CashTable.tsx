import Box from "@mui/material/Box";
import {
  DataGrid,
  type GridColDef,
  type GridRowId,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import Chip from "@mui/material/Chip";
import type { Cash } from "@modules/finance/types/cash.type";

interface CashTableProps {
  cashes: Cash[];
  onEdit: (cash: Cash) => void;
  onDelete: (id: GridRowId) => void;
  // Nuevas props para el manejo de la selección
  selectedCashId?: number;
  onSelect?: (id: number) => void;
}

export default function CashTable({
  cashes,
  onEdit,
  onDelete,
  selectedCashId,
  onSelect,
}: CashTableProps) {
  const columns: GridColDef<Cash>[] = [
    {
      field: "status",
      headerName: "Estado",
      width: 130,
      renderCell: (params) => {
        const isActive = params.row.id === selectedCashId;
        return (
          <Chip
            label={isActive ? "Arqueando" : "En espera"}
            color={isActive ? "primary" : "default"}
            size="small"
            variant={isActive ? "filled" : "outlined"}
          />
        );
      },
    },
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
      width: 150, // Aumentamos un poco el ancho para el nuevo botón
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Editar"
            onClick={() => onEdit(params.row)}
            key="edit"
            showInMenu={false}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Eliminar"
            onClick={() => onDelete(params.id)}
            key="delete"
            showInMenu={false}
          />,
        ];

        // Añadimos el botón de seleccionar solo si no es la caja ya seleccionada
        if (onSelect && params.row.id !== selectedCashId) {
          actions.unshift(
            <GridActionsCellItem
              icon={<AccountBalanceWalletIcon color="primary" />}
              label="Arquear esta caja"
              onClick={() => onSelect(Number(params.id))}
              key="select"
              showInMenu={false}
            />,
          );
        }

        return actions;
      },
    },
  ];

  return (
    <Box
      sx={{
        p: 2, // Reducido un poco para que encaje mejor en el contenedor padre
        width: "100%",
        mx: "auto",
      }}
    >
      <DataGrid
        rows={cashes}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5, // 5 suele ser mejor para tablas que conviven con otros elementos
            },
          },
        }}
        pageSizeOptions={[5, 10]}
        disableRowSelectionOnClick
        // Estilo condicional para la fila seleccionada
        getRowClassName={(params) =>
          params.row.id === selectedCashId ? "selected-cash-row" : ""
        }
        sx={{
          "& .selected-cash-row": {
            bgcolor: "primary.light",
            "&:hover": {
              bgcolor: "primary.light",
              opacity: 0.9,
            },
          },
        }}
      />
    </Box>
  );
}
