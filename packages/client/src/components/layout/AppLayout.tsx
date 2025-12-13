import React, { useMemo } from 'react';
import { Box, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CssBaseline } from '@mui/material';
import { Logout, People, AccountBalance, Payments, Euro, Home ,Login } from '@mui/icons-material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AppBar, Toolbar, Typography, Drawer, Divider } from '@mui/material';
import ColorModeSelect from '../../shared-theme/ColorModeSelect';
import AppTheme from '../../shared-theme/AppTheme';


interface DashboardLayoutProps {
  appBar: {
    position: string;
    sx: {
      zIndex: (theme: { zIndex: { drawer: number } }) => number;
    };
    actions: React.ReactNode;
  };
  navigation: Array<{
    kind?: 'header' | 'divider' | 'item';
    title?: string;
    segment?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  }>;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ appBar, navigation, children }) => {
  const drawerWidth = 240;
  const navigate = useNavigate();
  const location = useLocation();

  const renderNavItem = (item: DashboardLayoutProps['navigation'][0]) => {
    if (item.kind === 'header') {
      return (
        <Typography
          key={item.title}
          variant="overline"
          sx={{ px: 3, py: 1, display: 'block', color: 'text.secondary' }}
        >
          {item.title}
        </Typography>
      );
    }

    if (item.kind === 'divider') {
      return <Divider key={Math.random()} />;
    }

    const isSelected = location.pathname === item.segment;

    return (
      <ListItem key={item.title} disablePadding>
        <ListItemButton
          selected={isSelected}
          onClick={() => item.onClick ? item.onClick() : item.segment && navigate(item.segment)}
        >
          {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
          <ListItemText primary={item.title} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Economic Control
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {appBar.actions}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navigation.map((item: DashboardLayoutProps['navigation'][0]) => renderNavItem(item))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
// --- Fin de Componentes Mock ---


const AppLayout = () => {
  const { user, logout } = useAuth();
  const isAuthenticated = useMemo(() => !!user, [user]);

  // Definir la navegación de acuerdo a la autenticación
  type NavItem = {
    kind?: 'header' | 'divider' | 'item';
    title?: string;
    segment?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  };

  const navigation: NavItem[] = useMemo(() => {
    if (isAuthenticated) {
      return [
        { kind: 'header', title: 'General' },
        { segment: '/dashboard', title: 'Dashboard', icon: <Home /> },
        { kind: 'header', title: 'Operaciones' },
        { segment: '/cajas', title: 'Cajas', icon: <AccountBalance /> },
        { segment: '/ingresos', title: 'Ingresos', icon: <Euro /> },
        { segment: '/egresos', title: 'Egresos', icon: <Payments /> },
        { kind: 'divider' },
        { kind: 'header', title: 'Datos' },
        { segment: '/personas', title: 'Personas', icon: <People /> },
        { kind: 'divider' },
      ];
    } else {
      return [
        { kind: 'header', title: 'Acceso' },
        { segment: '/login', title: 'Iniciar Sesión', icon: <Login /> },
      ];
    }
  }, [isAuthenticated]);

  return (
    <AppTheme>
        <CssBaseline enableColorScheme/>
        <DashboardLayout
            navigation={navigation}
            appBar={{
            position: 'sticky',
            sx: { zIndex: (theme) => theme.zIndex.drawer + 1 },
            actions: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ColorModeSelect />
                {isAuthenticated ? (
                    <IconButton
                    aria-label="logout"
                    onClick={logout}
                    color="inherit"
                    >
                    <Logout />
                    </IconButton>
                ) : null}
                </Box>
            ),
            }}
        >
            <Box
            sx={{
                py: 4,
                width: '100%',
                mx: 'auto',
                minHeight: '80vh',
            }}
            >
            <Outlet />
            </Box>
        </DashboardLayout>
    </AppTheme>
  );
};

export default AppLayout;