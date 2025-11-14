import { useAuth } from '../hooks/useAuth';
import { useBalance } from '../hooks/useBalance';
import { PieChart } from '@mui/x-charts/PieChart';
import type { ChartsLabelCustomMarkProps } from '@mui/x-charts/ChartsLabel';
import type { PieValueType } from '@mui/x-charts';
import { Paper, Grid, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

function HTMLDiamond({ className, color }: ChartsLabelCustomMarkProps) {
  return (
    <div
      className={className}
      style={{ transform: 'scale(0.6, 0.75) rotate(45deg)', background: color }}
    />
  );
}

function SVGStar({ className, color }: ChartsLabelCustomMarkProps) {
  return (
    <svg viewBox="-7.423 -7.423 14.846 14.846">
      <path
        className={className}
        d="M0,-7.528L1.69,-2.326L7.16,-2.326L2.735,0.889L4.425,6.09L0,2.875L-4.425,6.09L-2.735,0.889L-7.16,-2.326L-1.69,-2.326Z"
        fill={color}
      />
    </svg>
  );
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: balanceData, isLoading, isError, error } = useBalance();

  // Transformar los datos para el PieChart
  const pieChartData: PieValueType[] = (balanceData || [])
    // Filtramos solo 'income' y 'outcome' para el gráfico
    .filter(item => item.type === 'income' || item.type === 'outcome')
    .map((item, index) => {
      // Usamos el index como ID y transformamos el tipo para la etiqueta
      const label = item.type === 'income' ? 'Ingresos' : 'Egresos';
      const labelMarkType = item.type === 'income' ? HTMLDiamond : SVGStar;
      
      return {
        id: index,
        value: item.total, 
        label: label,
        labelMarkType: labelMarkType,
      };
    });

// Manejar el estado de carga y error
  if (isLoading) {
    return <div className="dashboard-container">Cargando datos del balance...</div>;
  }

  if (isError) {
    return (
      <Box p={3} color="error.main">
        <Typography variant="h4" gutterBottom>
          Error al cargar el balance
        </Typography>
        <Typography variant="body1" component="p" sx={{ mb: 2 }}>
          Mensaje: {error.message}
        </Typography>
        <Typography variant="body1" component="p" sx={{ mb: 2 }}>
          No se pudo completar la solicitud. Por favor, intente cerrar sesión y volver a entrar.
        </Typography>
      </Box>
    );
  }
  
  // Opcional: Obtener el balance total (type: "balance") para mostrarlo.
  const totalBalance = balanceData?.find(item => item.type === 'balance')?.total;
  
  return (
    <div className="dashboard-container">

      <Typography variant="h4" component="h1" gutterBottom>
        Bienvenido, {user?.first_name} {user?.last_name}!
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Estado actual de las finanzas:
      </Typography>

      <Grid container spacing={3} style={{ marginTop: '20px' }}>
        
        {/* === CARD 1: BALANCE TOTAL === */}
        {totalBalance !== undefined && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                Balance Total
              </Typography>
              <Typography variant="h3" component="p" color={totalBalance >= 0 ? 'primary' : 'error'} style={{ fontWeight: 600 }}>
                ${totalBalance.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
        )}
        
        {/* === CARD 2: GRÁFICO DE INGRESOS/EGRESOS === */}
        <Grid item xs={12} sm={totalBalance !== undefined ? 6 : 12} md={totalBalance !== undefined ? 8 : 12}>
          <Paper elevation={3} style={{ padding: '20px', height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
                Distribución Ingresos/Egresos
            </Typography>
            
            {pieChartData.length > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <PieChart
                        series={[
                        {
                            data: pieChartData,
                            innerRadius: 30,
                            outerRadius: 80,
                            paddingAngle: 5,
                            cornerRadius: 5,
                            startAngle: -90,
                            endAngle: 270,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                        },
                        ]}
                        width={400} 
                        height={200}
                    />
                </div>
            ) : (
              <Typography variant="body1" color="textSecondary">
                No hay datos de ingresos y egresos para mostrar en el gráfico.
              </Typography>
            )}
          </Paper>
        </Grid>

      </Grid>
    </div>
  );
};