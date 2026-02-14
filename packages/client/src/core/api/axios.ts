/* eslint-disable no-async-promise-executor */
import axios from "axios";
import type {
  AxiosError,
  AxiosRequestHeaders,
  AxiosRequestConfig,
} from "axios";
import { API_ROUTES_PATH } from "./appsApiRoute";

const isProd = import.meta.env.PROD;

// 2. Definimos la URL base:
// Si es PROD: usamos la URL completa del .env.production
// Si es DEV: usamos solo el prefijo para que el proxy de Vite lo capture
// Limpia posibles barras duplicadas o faltantes
const cleanURL = (url: string) => url.replace(/\/+$/, ""); // Quita barras al final
const cleanPrefix = (prefix: string) =>
  prefix.startsWith("/") ? prefix : `/${prefix}`; // Asegura barra al inicio

const BASE_URL = isProd
  ? `${cleanURL(import.meta.env.VITE_API_URL)}${cleanPrefix(
      import.meta.env.VITE_API_PREFIX || "/ec/api/v1",
    )}`
  : cleanPrefix(import.meta.env.VITE_API_PREFIX || "/ec/api/v1");

const refreshInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;

type QueueEntry = {
  resolve: (token: string | null) => void;
  reject: (reason?: unknown) => void;
};

let failedQueue: QueueEntry[] = [];

// Función para procesar la cola de peticiones fallidas
const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de Respuestas: Manejo de 401 (Token Expirado)
apiClient.interceptors.response.use(
  (response) => response,
  async (err) => {
    const error = err as AxiosError & {
      config?: AxiosRequestConfig & { _retry?: boolean };
    };
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthEndpoint =
      originalRequest.url?.includes(API_ROUTES_PATH.AUTH + "/login") ||
      originalRequest.url?.includes(API_ROUTES_PATH.AUTH + "/refresh-token") ||
      originalRequest.url?.includes(API_ROUTES_PATH.AUTH + "/logout");

    // Si la respuesta es un 401 Y no estamos ya intentando renovar
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        // Si ya hay una renovación en curso, ponemos la petición en cola
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // Solo añadir header si tenemos token válido
            if (token) {
              originalRequest.headers = originalRequest.headers || {};
              const tokenWithBearer = token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`;
              (originalRequest.headers as AxiosRequestHeaders)[
                "Authorization"
              ] = tokenWithBearer;
            }
            return apiClient(originalRequest);
          })
          .catch((err2) => {
            return Promise.reject(err2);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Intentar la renovación del token
      return new Promise(async (resolve, reject) => {
        try {
          // USO EXPLÍCITO DE LA RUTA COMPLETA PARA EL REFRESH (ENDPOINT)
          const refreshResponse = await refreshInstance.post<{ token: string }>(
            `${API_ROUTES_PATH.AUTH}/refresh-token`,
          );
          const newAccessToken: string | undefined =
            refreshResponse.data?.token;

          if (newAccessToken) {
            // 1. Establecer el nuevo Access Token globalmente
            setGlobalAccessToken(newAccessToken);

            // 2. Disparar evento para que AuthProvider actualice su estado
            if (
              typeof window !== "undefined" &&
              typeof window.dispatchEvent === "function"
            ) {
              window.dispatchEvent(
                new CustomEvent("authTokenRenewed", { detail: newAccessToken }),
              );
            }

            // 3. Procesar la cola y reintentar la petición original (incluida en la cola)
            isRefreshing = false;
            processQueue(null, newAccessToken ?? null);

            // 4. Configurar la petición original para que use el nuevo token y resolver
            originalRequest.headers = originalRequest.headers || {};
            const newTokenWithBearer = newAccessToken.startsWith("Bearer ")
              ? newAccessToken
              : `Bearer ${newAccessToken}`;
            (originalRequest.headers as AxiosRequestHeaders)["Authorization"] =
              newTokenWithBearer;

            return resolve(apiClient(originalRequest));
          } else {
            throw new Error("No se recibió el nuevo Access Token.");
          }
        } catch (refreshError) {
          // 5. Si la renovación falla (401 del refresh), forzamos logout
          processQueue(refreshError, null);
          if (
            typeof window !== "undefined" &&
            typeof window.dispatchEvent === "function"
          ) {
            window.dispatchEvent(new CustomEvent("authLogout"));
          }
          reject(refreshError);
        }
      });
    }
    return Promise.reject(error);
  },
);

// Interceptor de Peticiones: Añade el Access Token de la memoria
// NOTA: La variable 'accessToken' se actualizará por el AuthProvider.
let accessToken: string | null = null;
export const setGlobalAccessToken = (token: string | null) => {
  accessToken = token;
};

apiClient.interceptors.request.use(
  (config) => {
    if (accessToken === null || accessToken === undefined) {
      return config; // No hay token, no hacemos nada
    }

    // Añadir el token solo si existe y no es una cadena vacía
    const tokenValue: string = accessToken.trim();
    // * Aseguramos que el token exista Y que no sea solo una cadena vacía después de trim()
    if (tokenValue) {
      config.headers = config.headers || {};
      const finalToken = tokenValue.startsWith("Bearer ")
        ? tokenValue
        : `Bearer ${tokenValue}`;
      (config.headers as AxiosRequestHeaders).Authorization = finalToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export { refreshInstance };
export default apiClient;
