import { useState } from "react";
import { Box, TextField, IconButton } from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import type { CashDenomination } from "../../types/cash-denomination.type";

interface Props {
  data: CashDenomination[];
  onSave: (id: number, quantity: number) => void;
  isLoading?: boolean;
}

export default function CashDenominationTable({
  data,
  onSave,
  isLoading,
}: Props) {
  const [editId, setEditId] = useState<number | null>(null);
  const [tempQty, setTempQty] = useState<number>(0);

  const columns: GridColDef<CashDenomination>[] = [
    {
      field: "value",
      headerName: "Denominación",
      minWidth: 180, // Aumentado para que el encabezado no se corte
      flex: 1.5,
      renderCell: (p) => `${p.row.denomination_value} €`,
    },
    {
      field: "quantity",
      headerName: "Cantidad",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => {
        if (editId === params.row.id) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                size="small"
                type="number"
                variant="outlined"
                value={tempQty}
                onChange={(e) => setTempQty(Number(e.target.value))}
                autoFocus
                sx={{ width: 90 }}
              />
              <IconButton
                color="success"
                size="small"
                onClick={() => {
                  onSave(params.row.id, tempQty);
                  setEditId(null);
                }}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton
                color="error"
                size="small"
                onClick={() => setEditId(null)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        }
        return params.row.quantity;
      },
    },
    {
      field: "total",
      headerName: "Total calculado", // Nombre más descriptivo
      minWidth: 180,
      flex: 1,
      valueGetter: (_, row) =>
        (parseFloat(row.denomination_value) * row.quantity).toFixed(2) + " €",
    },
    {
      field: "actions",
      headerName: "Acciones",
      type: "actions",
      width: 120, // Un poco más de espacio para el botón
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={() => {
            setEditId(params.row.id);
            setTempQty(params.row.quantity);
          }}
          disabled={editId !== null || isLoading}
          key="edit"
        />,
      ],
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={data}
        columns={columns}
        hideFooter
        autoHeight
        disableRowSelectionOnClick
        // Ajuste de densidad para que no se vea todo tan apretado
        density="standard"
        sx={{
          border: "none",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "rgba(0, 0, 0, 0.02)",
            fontWeight: "bold",
          },
        }}
      />
    </Box>
  );
}
