import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";

// Iconos
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

import useProductController from "@modules/cafeteria/controllers/useProductController";
import ProductFormModal from "@modules/cafeteria/components/modals/ProductFormModal";
import type { ProductType, ProductCreationDTO } from "@economic-control/shared";

export type ProductItem = ProductType & {
  created_at: string | null;
};

export default function ProductsPage() {
  const {
    products,
    isLoading,
    isError,
    error,
    editingProduct,
    isActionPending,
    actionError,
    handleFormSubmit,
    startEdit,
    cancelEdit,
    deleteProduct,
  } = useProductController();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenCreate = () => {
    cancelEdit();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: ProductType) => {
    startEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    cancelEdit();
    setIsModalOpen(false);
  };

  const onSubmitForm = (data: ProductCreationDTO) => {
    handleFormSubmit(data as any);
    setIsModalOpen(false);
  };

  const filteredProducts = useMemo(() => {
    return (products as ProductItem[]).filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term)
      );
    });
  }, [products, searchTerm]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100vh", width: "100%", boxSizing: "border-box" }}>
      {/* Cabecera */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="#0f172a">
            Catálogo de Productos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra los productos y precios registrados en la BD
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold" }}
        >
          Nuevo Producto
        </Button>
      </Box>

      {/* Alertas */}
      {(isError || actionError) && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error?.message || actionError}
        </Alert>
      )}

      {/* Buscador y Tabla */}
      <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
          <TextField
            placeholder="Buscar por código o nombre..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ maxWidth: 350, width: "100%" }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={5}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Código</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">Precio Unitario</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">Estado</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">Fecha Creación</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Chip label={product.code} size="small" variant="outlined" sx={{ fontWeight: "bold" }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "primary.main" }}>
                        ${Number(product.unit_price).toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={product.is_active ? "Activo" : "Inactivo"}
                          color={product.is_active ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        {product.created_at ? new Date(product.created_at).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEdit(product)}
                          disabled={isActionPending}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => product.id && deleteProduct(product.id)}
                          disabled={isActionPending}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={onSubmitForm}
        editingProduct={editingProduct as any}
        existingProducts={products as any}
        isLoading={isActionPending}
      />
    </Box>
  );
}