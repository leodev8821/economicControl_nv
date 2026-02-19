import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import {
  Paper,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import type { PieValueType } from "@mui/x-charts";
import { useAuth } from "@modules/auth/hooks/useAuth";
import { useBalance } from "@modules/finance/hooks/useBalance";
import { WeekSelector } from "@modules/finance/components/selectors/WeekSelector";
import { Button, Tooltip, CircularProgress } from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import { useSyncBalances } from "../hooks/useSyncBalances";

// Helper para transformar el objeto Record<string, number> al formato del PieChart
const transformToPieData = (
  dataObj: Record<string, number>,
): PieValueType[] => {
  return Object.entries(dataObj).map(([label, value], index) => ({
    id: index,
    value: value,
    label: label,
  }));
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [filterType, setFilterType] = React.useState<"all" | "week">("all");
  const [selectedWeek, setSelectedWeek] = React.useState<number | "">("");

  // Efecto para limpiar o inicializar la semana cuando cambias el tipo de filtro
  React.useEffect(() => {
    if (filterType === "all") {
      setSelectedWeek("");
    }
  }, [filterType]);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
  } = useBalance({
    week_id:
      filterType === "week" && selectedWeek !== "" ? selectedWeek : undefined,
  });

  const balanceData = apiResponse?.data;
  const apiResponseMessage = apiResponse?.message;

  // Verificamos si es SuperUser
  const isSuperUser = user?.role_name === "SuperUser";

  const { mutate: executeSync, isPending } = useSyncBalances();

  if (isLoading) {
    return <Box p={3}>Cargando datos del balance...</Box>;
  }

  if (isError) {
    return (
      <Box p={3} color="error.main">
        <Typography variant="h5">Error al cargar el balance</Typography>
        <Typography>{error.message}</Typography>
      </Box>
    );
  }

  if (!balanceData || balanceData.length === 0) {
    return (
      <Box p={3}>
        <Typography variant="body1" color="textSecondary">
          {apiResponseMessage || "No hay información de cajas disponible."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      className="dashboard-container"
      sx={{ p: 3, position: "relative", minHeight: "400px" }}
    >
      {isFetching && !isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(255,255,255,0.6)",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 2,
            backdropFilter: "blur(2px)", // Efecto visual moderno
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography sx={{ mt: 2, fontWeight: "bold", color: "primary.main" }}>
            Actualizando datos...
          </Typography>
        </Box>
      )}

      <Typography variant="h2" component="h1" gutterBottom>
        Bienvenido, {user?.first_name} {user?.last_name}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h4">Dashboard Financiero</Typography>
          </Grid>

          {/* Renderizado Botón Condicional: Solo si es SuperUser */}
          {isSuperUser && (
            <Tooltip title="Recalcular saldos desde el historial de movimientos (Admin Only)">
              <Button
                variant="outlined"
                color="warning"
                startIcon={
                  isPending ? <CircularProgress size={20} /> : <SyncIcon />
                }
                onClick={() => {
                  if (
                    window.confirm(
                      "¿Deseas recalcular los saldos de todas las cajas? Esta acción no se puede deshacer.",
                    )
                  ) {
                    executeSync();
                  }
                }}
                disabled={isPending}
                sx={{ fontWeight: "bold" }}
              >
                {isPending ? "Sincronizando..." : "Sincronizar Saldos"}
              </Button>
            </Tooltip>
          )}

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Ver por</InputLabel>
              <Select
                value={filterType}
                label="Ver por"
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <MenuItem value="all">Histórico (Total)</MenuItem>
                <MenuItem value="week">Por Semana</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            {filterType === "week" && (
              <WeekSelector
                selectedWeek={selectedWeek}
                onChange={(id) => setSelectedWeek(id)}
              />
            )}
          </Grid>
        </Grid>
      </Box>

      {balanceData.map((cash) => {
        const incomePieData = transformToPieData(
          cash.breakdown.incomes_by_source,
        );
        const outcomePieData = transformToPieData(
          cash.breakdown.outcomes_by_category,
        );

        return (
          <Box key={cash.cash_id} sx={{ mb: 6, mt: 4 }}>
            {/* Encabezado de la Caja */}
            <Box sx={{ mb: 2, borderBottom: 1, borderColor: "divider", pb: 1 }}>
              <Typography
                variant="h5"
                component="h2"
                color="primary.main"
                fontWeight="bold"
              >
                📦 {cash.cash_name}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {/* === CARD 1: SALDO ACTUAL === */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={3}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#f5f5f5",
                    position: "relative",
                  }}
                >
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      Saldo Actual Disponible
                    </Typography>
                    <Typography
                      variant="h3"
                      component="p"
                      sx={{
                        fontWeight: "bold",
                        color:
                          cash.cash_actual_amount >= 0
                            ? "success.main"
                            : "error.main",
                      }}
                    >
                      {cash.cash_actual_amount.toFixed(2)}€
                    </Typography>

                    {/* Alerta de Desfase (Drift) */}
                    {Math.abs(cash.drift) > 0.01 && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 0.5,
                          bgcolor: "warning.light",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="warning.contrastText"
                          fontWeight="bold"
                        >
                          ⚠️ Desfase detectado: {cash.drift.toFixed(2)}€
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* === CARD 2: INGRESOS POR FUENTE === */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    height: "100%",
                    minHeight: 300,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" gutterBottom color="success.main">
                    Ingresos por Fuente
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                    + {cash.totals.income.toFixed(2)}€
                  </Typography>

                  {incomePieData.length > 0 ? (
                    <PieChart
                      series={[
                        {
                          data: incomePieData,
                          innerRadius: 30,
                          outerRadius: 100,
                          paddingAngle: 2,
                          cornerRadius: 4,
                          highlightScope: { fade: "global", highlight: "item" },
                        },
                      ]}
                      width={300}
                      height={200}
                      slotProps={{ legend: { sx: { display: "none" } } }}
                    />
                  ) : (
                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography color="textSecondary">
                        Sin ingresos registrados
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* === CARD 3: EGRESOS POR CATEGORÍA === */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    height: "100%",
                    minHeight: 300,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" gutterBottom color="error.main">
                    Egresos por Categoría
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                    - {cash.totals.outcome.toFixed(2)}€
                  </Typography>

                  {outcomePieData.length > 0 ? (
                    <PieChart
                      colors={["#ef5350", "#ab003c", "#ff7961"]}
                      series={[
                        {
                          data: outcomePieData,
                          innerRadius: 30,
                          outerRadius: 100,
                          paddingAngle: 2,
                          cornerRadius: 4,
                          highlightScope: { fade: "global", highlight: "item" },
                        },
                      ]}
                      width={300}
                      height={200}
                      slotProps={{ legend: { sx: { display: "none" } } }}
                    />
                  ) : (
                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Typography color="textSecondary">
                        Sin egresos registrados
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
};

export default DashboardPage;
