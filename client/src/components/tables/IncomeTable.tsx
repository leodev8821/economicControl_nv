import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowId } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { Income } from '../../types/income';

interface IncomeTableProps {
  incomes: Income[];
  onUpdate: (id: GridRowId) => void; 
  onDelete: (id: GridRowId) => void;
}

interface IncomeActionsCellProps {
    id: GridRowId;
    onUpdate: (id: GridRowId) => void;
    onDelete: (id: GridRowId) => void;
}

// Componente para el menú de opciones
const IncomeActionsCell: React.FC<IncomeActionsCellProps> = ({ id, onUpdate, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUpdateClick = () => {
    handleClose();
    // Llama a la prop onUpdate
    onUpdate(id); 
  };

  const handleDeleteClick = () => {
    handleClose();
    // Llama a la prop onDelete
    onDelete(id);
  };

  return (
    <>
      <IconButton
        aria-label="más opciones"
        aria-controls={open ? 'menu-acciones' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size="small"
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="menu-acciones"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleUpdateClick}>Actualizar</MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>Eliminar</MenuItem>
      </Menu>
    </>
  );
};

export default function IncomeTable({ incomes, onUpdate, onDelete }: IncomeTableProps) {

  const columns: GridColDef<Income>[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 90 
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
      field: 'source',
      headerName: 'Fuente',
      width: 130
    },
    {
      field: 'Person',
      headerName: 'NIF de la Persona',
      width: 160,
      renderCell: (params) => 
        params.row.Person?.dni || '-'
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      type: 'actions',
      width: 100,
      sortable: false,
      filterable: false,
      // La función renderCell ahora recibe las funciones onUpdate/onDelete
      renderCell: (params) => (
        <IncomeActionsCell 
            id={params.id} 
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
      ),
    },
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
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
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
}
