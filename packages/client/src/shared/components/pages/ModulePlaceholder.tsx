import React from "react";
import { Typography, Paper, Stack, Button } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import { useNavigate } from "react-router-dom";

interface ModulePlaceholderProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  backPath?: string;
}

const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  title = "Esta página no existe o está en construcción",
  description = "Estamos trabajando para tener este módulo disponible pronto.",
  showBackButton = false,
  backPath,
}) => {
  const navigate = useNavigate();
  return (
    <Paper
      elevation={3}
      sx={{
        p: 6,
        textAlign: "center",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={3} alignItems="center">
        <ConstructionIcon sx={{ fontSize: 80 }} color="primary" />

        <Typography variant="h5">{title}</Typography>

        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
        {showBackButton && (
          <Button
            variant="contained"
            onClick={() => navigate(backPath ?? "/home")}
          >
            Volver
          </Button>
        )}
      </Stack>
    </Paper>
  );
};

export default ModulePlaceholder;
