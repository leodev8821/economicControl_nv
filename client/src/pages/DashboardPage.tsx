import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBalance } from '../hooks/useBalance';
import { PieChart } from '@mui/x-charts/PieChart';
import { Paper, Grid, Typography, Box, Divider, Card, CardContent } from '@mui/material';
import type { PieValueType } from '@mui/x-charts';
import type { CashBalance } from '../types/balance';

// Helper para transformar el objeto Record<string, number> al formato del PieChart
const transformToPieData = (dataObj: Record<string, number>): PieValueType[] => {
  return Object.entries(dataObj).map(([label, value], index) => ({
    id: index,
    value: value,
    label: label,
  }));
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: balanceData, isLoading, isError, error } = useBalance();

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
    return <Box p={3}>No hay información de cajas disponible.</Box>;
  }

  return (
    <Box className="dashboard-container" sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bienvenido, {user?.first_name}
      </Typography>
      <Typography variant="subtitle1" gutterBottom color="textSecondary">
        Resumen financiero por Caja
      </Typography>

      {/* Iteramos por cada Caja que devuelve el Backend */}
      {balanceData.map((cash) => {
        
        // Transformamos los datos para los gráficos de esta caja específica
        const incomePieData = transformToPieData(cash.breakdown.incomes_by_source);
        const outcomePieData = transformToPieData(cash.breakdown.outcomes_by_category);

        return (
          <Box key={cash.cash_id} sx={{ mb: 6, mt: 4 }}>
            {/* Encabezado de la Caja */}
            <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
              <Typography variant="h5" component="h2" color="primary.main" fontWeight="bold">
                📦 {cash.cash_name}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              
              {/* === CARD 1: SALDO ACTUAL === */}
              <Grid item xs={12} md={4}>
                <Card elevation={3} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      Saldo Actual Disponible
                    </Typography>
                    <Typography 
                      variant="h3" 
                      component="p" 
                      sx={{ fontWeight: 'bold', color: cash.cash_actual_amount >= 0 ? 'success.main' : 'error.main' }}
                    >
                      {cash.cash_actual_amount.toFixed(2)}€
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                       (Balance Calculado: {cash.calculated_balance.toFixed(2)}€)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* === CARD 2: INGRESOS POR FUENTE === */}
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 2, height: '100%', minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom color="success.main">
                    Ingresos por Fuente
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    + {cash.totals.income.toFixed(2)}€
                  </Typography>
                  
                  {incomePieData.length > 0 ? (
                    <PieChart
                      series={[{
                        data: incomePieData,
                        innerRadius: 30,
                        outerRadius: 100,
                        paddingAngle: 2,
                        cornerRadius: 4,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                      }]}
                      width={300}
                      height={200}
                      slotProps={{ legend: { hidden: true } }} // Ocultamos leyenda si ocupa mucho espacio, o usa 'direction: row'
                    />
                  ) : (
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography color="textSecondary">Sin ingresos registrados</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* === CARD 3: EGRESOS POR CATEGORÍA === */}
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 2, height: '100%', minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom color="error.main">
                    Egresos por Categoría
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    - {cash.totals.outcome.toFixed(2)}€
                  </Typography>

                  {outcomePieData.length > 0 ? (
                    <PieChart
                      colors={['#ef5350', '#ab003c', '#ff7961']} // Paleta rojiza para egresos
                      series={[{
                        data: outcomePieData,
                        innerRadius: 30,
                        outerRadius: 100,
                        paddingAngle: 2,
                        cornerRadius: 4,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                      }]}
                      width={300}
                      height={200}
                      slotProps={{ legend: { hidden: true } }}
                    />
                  ) : (
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography color="textSecondary">Sin egresos registrados</Typography>
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