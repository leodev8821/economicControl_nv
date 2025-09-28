import axios from 'axios';
import type { AxiosError, AxiosRequestHeaders, AxiosRequestConfig } from 'axios';

// Usamos el prefijo de la API que definimos en vite.config.ts
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/ec/api/v1';

const apiClient = axios.create({
  baseURL: API_PREFIX,
  headers: {
    'Content-Type': 'application/json',
  },
  // Permite que Axios envíe las cookies (incluyendo la HttpOnly Refresh Token)
  withCredentials: true, 
});

let isRefreshing = false;

// Tipado de la cola: resolve recibe token (string | null), reject recibe cualquier motivo
type QueueEntry = {
  resolve: (token: string | null) => void;
  reject: (reason?: unknown) => void;
};

let failedQueue: QueueEntry[] = [];

// Función para procesar la cola de peticiones fallidas
const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(prom => {
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
     const error = err as AxiosError & { config?: AxiosRequestConfig & { _retry?: boolean } };
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Si la respuesta es un 401 Y no estamos ya intentando renovar
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya hay una renovación en curso, ponemos la petición en cola
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then((token) => {
            // Solo añadir header si tenemos token válido
            if (token) {
              originalRequest.headers = originalRequest.headers || {};
              (originalRequest.headers as AxiosRequestHeaders)['Authorization'] = 'Bearer ' + token;
            }
            return apiClient(originalRequest);
          })
        .catch((err2) => {
            return Promise.reject(err2);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // LLAMADA AL ENDPOINT DE RENOVACIÓN DE TOKEN (Refresh Token Flow)
        // El Refresh Token se envía automáticamente vía cookie HttpOnly
        const refreshResponse = await apiClient.post<{ accessToken: string }>('/auth/refresh-token');
        const newAccessToken: string | undefined = refreshResponse.data?.accessToken;

        isRefreshing = false;
        
        // Almacenamos el nuevo Access Token en la memoria global (Context/Store)
        // Usaremos una función inyectada para actualizar el AuthProvider
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(
                new CustomEvent('authTokenRenewed', { detail: newAccessToken ?? null })
            );
        }

        // Procesar la cola con el nuevo token (si undefined -> null)
        processQueue(null, newAccessToken ?? null);

        // Reintentar la petición original con el nuevo Access Token
        if (newAccessToken) {
          originalRequest.headers = originalRequest.headers || {};
          (originalRequest.headers as AxiosRequestHeaders)['Authorization'] = 'Bearer ' + newAccessToken;
        }

        return apiClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        // Si la renovación falla (Refresh Token inválido/expirado), forzamos logout
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('authLogout'));
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);


// Interceptor de Peticiones: Añade el Access Token de la memoria
// NOTA: La variable 'accessToken' se actualizará por el AuthProvider.
let accessToken: string | null = null;
export const setGlobalAccessToken = (token: string | null) => {
    accessToken = token;
};

apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers = config.headers || {};
      (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default apiClient;