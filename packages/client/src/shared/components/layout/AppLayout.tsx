import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  AppBar,
  Toolbar,
  Tooltip,
  tooltipClasses,
  type TooltipProps,
  styled,
  Typography,
  Drawer,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Logout,
  People,
  AccountBalance,
  Payments,
  Euro,
  HowToReg,
  Home,
  Menu as MenuIcon,
  PeopleAlt,
  //DateRange, // Para Semanas
  Handshake, // Para Consolidación
} from "@mui/icons-material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@modules/auth/hooks/useAuth";
import { APPS } from "@shared/constants/app";
import ColorModeSelect from "@core/theme/shared-theme/ColorModeSelect";
import AppTheme from "@core/theme/shared-theme/AppTheme";

// Ancho del Drawer
const drawerWidthOpen = 240;
const drawerWidthClose = 64;

// =================================================================
// TIPO DE DATO PARA LA NAVEGACIÓN
// =================================================================
type NavItem = {
  kind?: "header" | "divider";
  title?: string;
  segment?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
};

// =================================================================
// COMPONENTE INTERNO: SHELL DEL DASHBOARD (UI)
// =================================================================
interface DashboardShellProps {
  children: React.ReactNode;
  navigation: NavItem[];
  userRole?: string;
  onLogout: () => void;
}

// Estilo personalizado para el Tooltip
const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: theme.shadows[1],
    fontSize: 13,
    fontWeight: 500,
    padding: "8px 12px",
    "& .MuiTooltip-arrow": {
      color: theme.palette.primary.main,
    },
  },
}));

const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  navigation,
  onLogout,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Toggle del menú
  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  // Click en un item del menú
  const handleItemClick = (segment?: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
    } else if (segment) {
      navigate(segment);
    }
    if (isMobile) setMobileOpen(false);
  };

  // Renderizado de cada item de la lista
  const renderNavItem = (item: NavItem, index: number) => {
    // Render: Header de sección
    if (item.kind === "header") {
      if (collapsed && !isMobile) return null;
      return (
        <Typography
          key={`header-${index}`}
          variant="overline"
          sx={{
            px: 3,
            mt: 2,
            mb: 0.5,
            display: "block",
            color: "text.secondary",
            fontWeight: "bold",
            fontSize: "0.75rem",
          }}
        >
          {item.title}
        </Typography>
      );
    }

    // Render: Separador
    if (item.kind === "divider") {
      return <Divider key={`div-${index}`} sx={{ my: 1 }} />;
    }

    // Render: Item navegable
    const isSelected = item.segment
      ? location.pathname.startsWith(item.segment)
      : false;

    const showTooltip = collapsed && !isMobile;

    return (
      <ListItem
        key={item.title || index}
        disablePadding
        sx={{ display: "block", overflow: "hidden" }}
      >
        {/* Agregamos el Tooltip aquí */}
        <StyledTooltip
          title={showTooltip ? item.title : ""}
          placement="right"
          arrow
          disableHoverListener={!showTooltip}
        >
          <ListItemButton
            selected={isSelected}
            onClick={() => handleItemClick(item.segment, item.onClick)}
            sx={{
              minHeight: 48,
              justifyContent: collapsed && !isMobile ? "center" : "initial",
              px: 2.5,
              transition: theme.transitions.create("padding", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.shorter,
              }),
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed && !isMobile ? 0 : 2,
                justifyContent: "center",
                color: isSelected ? "primary.main" : "inherit",
              }}
            >
              {item.icon}
            </ListItemIcon>

            {/* Ocultamos físicamente el texto cuando está colapsado */}
            {(!collapsed || isMobile) && (
              <ListItemText
                primary={item.title}
                slotProps={{
                  primary: {
                    fontSize: "0.9rem",
                    fontWeight: isSelected ? 600 : 400,
                    noWrap: true,
                  },
                }}
              />
            )}
          </ListItemButton>
        </StyledTooltip>
      </ListItem>
    );
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* APP BAR SUPERIOR */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: 1,
        }}
        color="default"
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            NV Control
          </Typography>

          {/* ACCIONES DEL HEADER (Dark Mode + Logout) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ColorModeSelect />
            <IconButton onClick={onLogout} color="error" title="Cerrar Sesión">
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* DRAWER (Menú Lateral) */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: collapsed ? drawerWidthClose : drawerWidthOpen,
          flexShrink: 0,
          whiteSpace: "nowrap",
          "& .MuiDrawer-paper": {
            width: collapsed ? drawerWidthClose : drawerWidthOpen,
            boxSizing: "border-box",
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Toolbar /> {/* Espaciador para no tapar con el AppBar */}
        <Box sx={{ overflow: "auto", py: 1 }}>
          <List>
            {navigation.map((item, index) => renderNavItem(item, index))}
          </List>
        </Box>
      </Drawer>

      {/* CONTENIDO PRINCIPAL */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: "100%",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Toolbar /> {/* Espaciador superior */}
        {children}
      </Box>
    </Box>
  );
};

// =================================================================
// COMPONENTE PRINCIPAL: APPLAYOUT
// =================================================================
const AppLayout: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  // Redirección de seguridad si se pierde la sesión estando dentro del layout
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 1. Verificamos accesos basándonos en los permisos que vienen del backend
  const hasFinanceAccess = useMemo(
    () =>
      user?.permissions?.some(
        (p) =>
          p.application_id === APPS.FINANCE || p.application_id === APPS.ALL,
      ),
    [user],
  );

  const hasConsolidationAccess = useMemo(
    () =>
      user?.permissions?.some(
        (p) =>
          p.application_id === APPS.CONSOLIDATION ||
          p.application_id === APPS.ALL,
      ),
    [user],
  );

  const isAdmin =
    user?.role_name === "Administrador" || user?.role_name === "SuperUser";

  // 2. Construcción dinámica del menú
  const navigation = useMemo(() => {
    const menu: NavItem[] = [];

    // --- SECCIÓN FINANZAS ---
    if (hasFinanceAccess) {
      menu.push(
        { kind: "header", title: "Finanzas" },
        { title: "Dashboard", segment: "/finance/dashboard", icon: <Home /> },
        {
          title: "Cajas",
          segment: "/finance/cashes",
          icon: <AccountBalance />,
        },
        { title: "Ingresos", segment: "/finance/incomes", icon: <Euro /> },
        { title: "Egresos", segment: "/finance/outcomes", icon: <Payments /> },
        /*{ title: "Semanas", segment: "/finance/weeks", icon: <DateRange /> },*/
        { kind: "divider" },
        { kind: "header", title: "Gestión" },
        { title: "Personas", segment: "/finance/persons", icon: <People /> },
      );
    }

    // --- SECCIÓN CONSOLIDACIÓN ---
    if (hasConsolidationAccess) {
      if (menu.length > 0) menu.push({ kind: "divider" });
      menu.push(
        { kind: "header", title: "Módulos" },
        {
          title: "Consolidación",
          segment: "/consolidation",
          icon: <Handshake />,
        },
        {
          title: "Miembros",
          segment: "/consolidation/members",
          icon: <HowToReg />,
        },
      );
    }

    // --- SECCIÓN ADMIN (Usuarios) ---
    if (isAdmin) {
      menu.push(
        { kind: "divider" },
        { kind: "header", title: "Sistema" },
        { title: "Usuarios", segment: "/admin/users", icon: <PeopleAlt /> },
      );
    }

    return menu;
  }, [hasFinanceAccess, hasConsolidationAccess, isAdmin]);

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <DashboardShell navigation={navigation} onLogout={logout}>
        <Outlet />
      </DashboardShell>
    </AppTheme>
  );
};

export default AppLayout;
