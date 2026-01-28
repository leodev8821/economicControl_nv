import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { User, LoginCredentials } from "../types/user.type";
import { login as apiLogin } from "../api/authApi";
import apiClient, { setGlobalAccessToken, refreshInstance } from "../api/axios";
import { AuthContext } from "./auth.context";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Estado para el Access Token (en memoria)
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // El token que se expone es el Access Token de la memoria
  const token = accessToken;

  /**
   * Función de Logout
   * - Limpia el estado de React (token y usuario)
   * - Limpia el token en el interceptor de Axios (global)
   * - Limpia solo el usuario de localStorage (el token ya no se guarda aquí)
   * - Opcional: Llama al endpoint de backend para invalidar el Refresh Token
   * - Usa useCallback para optimización y estabilidad
   */
  const logout = useCallback(() => {
    // 1. Limpia el estado de React
    setAccessToken(null);
    setUser(null);

    // 2. Limpia el token en el interceptor de Axios
    setGlobalAccessToken(null);

    // 3. Limpia solo el usuario de localStorage (el token ya no se guarda aquí)
    localStorage.removeItem("authUser");

    refreshInstance
      .post("/auth/logout")
      .catch((e) => console.error("Error al cerrar sesión en el servidor", e));
  }, []);

  /**
   * Inicialización de la sesión al cargar la aplicación
   * - Restaura el usuario desde localStorage (si existe)
   * - Intenta renovar el Access Token usando el Refresh Token (cookie HttpOnly)
   * - Actualiza el estado y el interceptor de Axios
   * - Maneja errores y cierra sesión si la renovación falla
   */
  const initializeAuth = useCallback(async () => {
    setIsLoading(true);

    // 1. Restaurar usuario desde localStorage
    const savedUser = localStorage.getItem("authUser");

    if (!savedUser) {
      // Si no hay usuario guardado, no hay sesión que restaurar
      setIsLoading(false);
      return;
    }

    // Hay datos de usuario, intentamos reestablecer la sesión
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // 2. Si hay usuario guardado, intentamos renovar el token.
    if (savedUser) {
      try {
        // * LLAMADA PROACTIVA AL REFRESH ENDPOINT.
        // Esto usa la cookie HttpOnly que nos da sesión
        const refreshResponse = await refreshInstance.post<{ token: string }>(
          `/auth/refresh-token`,
        );
        const newAccessToken: string | undefined = refreshResponse.data?.token;

        if (newAccessToken) {
          // Sincroniza el nuevo token en el estado de React y en Axios
          setAccessToken(newAccessToken);
          setGlobalAccessToken(newAccessToken);
        } else {
          // Fallo: Refresh 200, pero sin token. Debería ser un error
          // * Si el servidor falla al darnos el token, forzamos logout
          logout();
        }
      } catch (error) {
        // * Si el refresh falla (ej: 401 por cookie expirada), forzamos logout.
        console.error(
          "❌ Error al renovar el token en la carga, forzando logout.",
          error,
        );
        logout();
      }
    }
    // 3. Finalizar la carga
    setIsLoading(false);
  }, [logout]);

  /**
   * Función de Login
   * - Realiza la petición de login al backend
   * - Almacena el Access Token en el estado (memoria)
   * - Configura el interceptor de Axios con el nuevo token
   * - Obtiene y almacena el perfil del usuario
   * - Maneja errores y estados de carga
   * - Usa useCallback para optimización y estabilidad
   */
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        // 1. Petición de Login (Obtiene Access Token en el body y Refresh Token en la cookie HttpOnly)
        const { token: newAccessToken, message } = await apiLogin(credentials);

        // 2. Guarda el nuevo Access Token en el estado (memoria)
        setAccessToken(newAccessToken);

        // 3. Registra el token en el interceptor de Axios (global)
        setGlobalAccessToken(newAccessToken);

        // 4. Obtener el perfil del usuario (ya se usa el nuevo token gracias a setGlobalAccessToken)
        const userResponse = await apiClient.get<User>("/auth/profile");
        const newUser = userResponse.data;

        // 5. Almacenar el usuario (los datos, no el token)
        setUser(newUser);
        localStorage.setItem("authUser", JSON.stringify(newUser));

        console.log(message);
      } catch (error) {
        console.error("Login fallido:", error);
        logout(); // Forzar la limpieza si falla
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [logout],
  ); // Dependencia: Incluye 'logout'

  // Efecto de Inicialización y Suscripción a Eventos Globales (HMR y 401 handling)
  useEffect(() => {
    // 1. Llamar a la función de inicialización para restaurar la sesión
    initializeAuth();

    // 2. Suscripción a eventos de renovación y logout del interceptor de Axios
    const handleTokenRenewed = (event: CustomEventInit) => {
      const newToken = event.detail;
      setAccessToken(newToken);
      setGlobalAccessToken(newToken);
    };

    window.addEventListener(
      "authTokenRenewed",
      handleTokenRenewed as EventListener,
    );
    window.addEventListener("authLogout", logout);

    return () => {
      window.removeEventListener(
        "authTokenRenewed",
        handleTokenRenewed as EventListener,
      );
      window.removeEventListener("authLogout", logout);
    };
  }, [logout, initializeAuth]);

  // Determina si el usuario está autenticado
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
