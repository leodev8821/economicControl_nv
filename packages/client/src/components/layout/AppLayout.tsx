import React, { useMemo, useState } from "react";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
} from "@mui/material";
import {
  Logout,
  People,
  AccountBalance,
  Payments,
  Euro,
  Home,
  Login,
  Menu,
  FindInPage,
} from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ColorModeSelect from "../../shared-theme/ColorModeSelect";
import AppTheme from "../../shared-theme/AppTheme";

const drawerWidthOpen = 240;
const drawerWidthClose = 64;

interface DashboardLayoutProps {
  appBar: {
    position: string;
    sx: {
      zIndex: (theme: { zIndex: { drawer: number } }) => number;
    };
    actions: React.ReactNode;
  };
  navigation: Array<{
    kind?: "header" | "divider" | "item";
    title?: string;
    segment?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  }>;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  appBar,
  navigation,
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const iconSize = isMobile ? "small" : "medium";
  const fontSize = isMobile ? "0.85rem" : "0.9rem";
  const itemPaddingY = isMobile ? 0.5 : 1;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Función unificada para el botón del menú
  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  // Cerrar el menú móvil al hacer clic en un item
  const handleItemClick = (segment?: string, onClick?: () => void) => {
    if (onClick) onClick();
    else if (segment) navigate(segment);

    if (isMobile) setMobileOpen(false);
  };

  const renderNavItem = (item: DashboardLayoutProps["navigation"][0]) => {
    if (item.kind === "header") {
      if (collapsed && !isMobile) return null;

      return (
        <Typography
          key={item.title}
          variant="overline"
          sx={{
            px: 3,
            py: 0.5,
            display: "block",
            color: "text.secondary",
            fontSize: isMobile ? "0.65rem" : "0.75rem",
          }}
        >
          {item.title}
        </Typography>
      );
    }

    if (item.kind === "divider") {
      if (collapsed && !isMobile) return null;
      return <Divider key={Math.random()} />;
    }

    const isSelected = location.pathname === item.segment;

    return (
      <ListItem key={item.title} disablePadding>
        <ListItemButton
          sx={{
            justifyContent: collapsed && !isMobile ? "center" : "flex-start",
            px: 2.5,
            py: itemPaddingY,
          }}
          selected={isSelected}
          onClick={() => handleItemClick(item.segment, item.onClick)}
        >
          {item.icon && (
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed && !isMobile ? 0 : 2,
                justifyContent: "center",
              }}
            >
              {React.isValidElement(item.icon)
                ? React.cloneElement(item.icon as React.ReactElement<any>, {
                    fontSize: iconSize,
                  })
                : item.icon}
            </ListItemIcon>
          )}

          {(isMobile || !collapsed) && (
            <ListItemText
              primary={item.title}
              slotProps={{
                primary: {
                  fontSize: fontSize,
                  fontWeight: isSelected ? 600 : 400,
                },
              }}
            />
          )}
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Economic Control
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {appBar.actions}
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isMobile
            ? 280
            : collapsed
            ? drawerWidthClose
            : drawerWidthOpen,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isMobile
              ? 280
              : collapsed
              ? drawerWidthClose
              : drawerWidthOpen,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {navigation.map((item: DashboardLayoutProps["navigation"][0]) =>
              renderNavItem(item)
            )}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: "100%" }}>
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

  type NavItem = {
    kind?: "header" | "divider" | "item";
    title?: string;
    segment?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  };

  const navigation: NavItem[] = useMemo(() => {
    if (isAuthenticated) {
      return [
        { kind: "header", title: "General" },
        { segment: "/dashboard", title: "Dashboard", icon: <Home /> },
        { kind: "header", title: "Operaciones" },
        { segment: "/cajas", title: "Cajas", icon: <AccountBalance /> },
        { segment: "/arqueo", title: "Arqueo", icon: <FindInPage /> },
        { segment: "/ingresos", title: "Ingresos", icon: <Euro /> },
        { segment: "/egresos", title: "Egresos", icon: <Payments /> },
        { kind: "divider" },
        { kind: "header", title: "Datos" },
        { segment: "/personas", title: "Personas", icon: <People /> },
        { kind: "divider" },
      ];
    } else {
      return [
        { kind: "header", title: "Acceso" },
        { segment: "/login", title: "Iniciar Sesión", icon: <Login /> },
      ];
    }
  }, [isAuthenticated]);

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <DashboardLayout
        navigation={navigation}
        appBar={{
          position: "sticky",
          sx: { zIndex: (theme) => theme.zIndex.drawer + 1 },
          actions: (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
            width: "100%",
            mx: "auto",
            minHeight: "80vh",
          }}
        >
          <Outlet />
        </Box>
      </DashboardLayout>
    </AppTheme>
  );
};

export default AppLayout;
