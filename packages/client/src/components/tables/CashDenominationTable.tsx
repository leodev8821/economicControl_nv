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
      minWidth: 180,
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
            <Box
              onClick={(e) => e.stopPropagation()}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 280,
                zIndex: 9999,
                bgcolor: "background.paper",
                boxShadow: 24,
                borderRadius: 2,
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <TextField
                size="small"
                type="number"
                variant="outlined"
                label="Cantidad"
                value={tempQty}
                onChange={(e) => setTempQty(Number(e.target.value))}
                autoFocus
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSave(params.row.id, tempQty);
                    setEditId(null);
                  } else if (e.key === "Escape") {
                    setEditId(null);
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "1.1rem",
                  },
                }}
              />

              {/* Botones de acción */}
              <IconButton
                color="success"
                onClick={() => {
                  onSave(params.row.id, tempQty);
                  setEditId(null);
                }}
              >
                <CheckIcon />
              </IconButton>
              <IconButton color="error" onClick={() => setEditId(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
          );
        }
        return params.row.quantity;
      },
    },
    {
      field: "total",
      headerName: "Total calculado",
      minWidth: 180,
      flex: 1,
      valueGetter: (_, row) =>
        (parseFloat(row.denomination_value) * row.quantity).toFixed(2) + " €",
    },
    {
      field: "actions",
      headerName: "Acciones",
      type: "actions",
      width: 120,
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
