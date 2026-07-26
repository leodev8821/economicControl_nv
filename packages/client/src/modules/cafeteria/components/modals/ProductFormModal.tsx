import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
} from "@mui/material";
import type { ProductType, ProductCreationDTO } from "@economic-control/shared";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductCreationDTO) => void;
  editingProduct: ProductType | null;
  existingProducts: ProductType[]; // 👈 AGREGAMOS ESTA PROPIEDAD
  isLoading?: boolean;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
  existingProducts,
  isLoading = false,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductCreationDTO>({
    code: "",
    name: "",
    unit_price: 0,
    is_active: true,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setValidationError(null);
    if (editingProduct) {
      setFormData({
        code: editingProduct.code || "",
        name: editingProduct.name || "",
        unit_price: Number(editingProduct.unit_price) || 0,
        is_active: editingProduct.is_active ?? true,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        unit_price: 0,
        is_active: true,
      });
    }
  }, [editingProduct, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanCode = formData.code.trim().toLowerCase();

    // Validar si el código ya existe en otro producto
    const codeExists = existingProducts.some((p) => {
      // Si estamos editando, ignoramos el producto actual
      if (editingProduct && p.id === editingProduct.id) {
        return false;
      }
      return p.code.trim().toLowerCase() === cleanCode;
    });

    if (codeExists) {
      setValidationError(`El código "${formData.code}" ya está registrado en otro producto.`);
      return;
    }

    onSubmit({
      ...formData,
      code: formData.code.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <form onSubmit={handleSubmit}>
        <DialogTitle fontWeight="bold">
          {editingProduct ? "Editar Producto" : "Nuevo Producto"}
        </DialogTitle>

        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Alerta de Código Duplicado */}
          {validationError && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {validationError}
            </Alert>
          )}

          <TextField
            label="Código / SKU"
            placeholder="Ej: A01, CAF01"
            value={formData.code}
            onChange={(e) => {
              setValidationError(null);
              setFormData({ ...formData, code: e.target.value });
            }}
            required
            fullWidth
            size="small"
            error={Boolean(validationError)}
          />

          <TextField
            label="Nombre del Producto"
            placeholder="Ej: Croissant de Jamón"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
            size="small"
          />

          <TextField
            label="Precio Unitario (€)"
            type="number"
            value={formData.unit_price === 0 ? "" : formData.unit_price}
            onChange={(e) =>
              setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })
            }
            slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
            required
            fullWidth
            size="small"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                color="primary"
              />
            }
            label={formData.is_active ? "Producto Activo" : "Producto Inactivo"}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={isLoading} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading} sx={{ borderRadius: 2 }}>
            {editingProduct ? "Guardar Cambios" : "Crear Producto"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}