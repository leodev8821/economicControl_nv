import { useState, useMemo } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Box,
  Skeleton,
  Paper,
  Chip,
} from "@mui/material";

// Iconos MUI
import SearchIcon from "@mui/icons-material/Search";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import SearchOffIcon from "@mui/icons-material/SearchOff";

import type { ProductType } from "@economic-control/shared";

interface ProductGridProps {
  products: ProductType[];
  isLoading?: boolean;
  onSelectProduct: (product: ProductType) => void;
}

export default function ProductGrid({
  products = [],
  isLoading = false,
  onSelectProduct,
}: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrado en tiempo real por Nombre o Código
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.is_active === false) return false;

      const term = searchTerm.toLowerCase();
      const matchName = product.name.toLowerCase().includes(term);
      const matchCode = product.code.toLowerCase().includes(term);

      return matchName || matchCode;
    });
  }, [products, searchTerm]);

  return (
    <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      {/* 1. Buscador Rápido */}
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar por nombre o código de producto..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ bgcolor: "background.paper", borderRadius: 1.5 }}
      />

      {/* 2. Cuadrícula Dinámica de Productos */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 300, maxHeight: 520, pr: 0.5 }}>
        {isLoading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 2,
            }}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={110} animation="wave" sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        ) : filteredProducts.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: "transparent",
              border: "1px dashed",
              borderColor: "divider",
              mt: 2,
            }}
          >
            <SearchOffIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No se encontraron productos
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 2,
            }}
          >
            {filteredProducts.map((product) => {
              const price = Number(product.unit_price || 0);

              return (
                <Card
                  key={product.id || product.code}
                  elevation={0}
                  sx={{
                    borderRadius: 2.5,
                    border: "1px solid #e2e8f0",
                    transition: "all 0.15s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      borderColor: "primary.main",
                    },
                    "&:active": {
                      transform: "scale(0.98)",
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() =>
                      onSelectProduct({
                        ...product,
                        unit_price: price,
                      })
                    }
                    sx={{
                      height: "100%",
                      p: 1.5,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "stretch",
                    }}
                  >
                    {/* Código del Producto e Icono */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Chip
                        label={product.code}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.68rem", height: 20, fontWeight: 700 }}
                      />
                      <LocalCafeIcon fontSize="small" color="action" sx={{ opacity: 0.4, fontSize: "1rem" }} />
                    </Box>

                    {/* Nombre del Producto */}
                    <CardContent sx={{ p: 0, mb: 1, flexGrow: 1 }}>
                      <Typography
                        variant="subtitle2"
                        component="div"
                        fontWeight="700"
                        lineHeight={1.2}
                        sx={{
                          fontSize: "0.825rem",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          wordBreak: "break-word",
                          textTransform: "uppercase",
                        }}
                      >
                        {product.name}
                      </Typography>
                    </CardContent>

                    {/* Precio */}
                    <Typography
                      variant="subtitle1"
                      color="primary.main"
                      fontWeight="800"
                      align="right"
                      sx={{ fontSize: "1rem" }}
                    >
                      ${price.toFixed(2)}
                    </Typography>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}