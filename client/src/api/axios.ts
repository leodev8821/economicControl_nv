/* eslint-disable no-async-promise-executor */
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

      // Intentar la renovación del token
      return new Promise(async (resolve, reject) => {
          try {
              // USO EXPLÍCITO DE LA RUTA COMPLETA PARA EL REFRESH (API_PREFIX + ENDPOINT)
              const refreshResponse = await apiClient.post<{ token: string }>(`${API_PREFIX}/auth/refresh-token`);
              const newAccessToken: string | undefined = refreshResponse.data?.token; 

              if (newAccessToken) {
                  // 1. Establecer el nuevo Access Token globalmente
                  setGlobalAccessToken(newAccessToken);
                  
                  // 2. Disparar evento para que AuthProvider actualice su estado
                  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                      window.dispatchEvent(
                          new CustomEvent('authTokenRenewed', { detail: newAccessToken })
                      );
                  }
                  
                  // 3. Procesar la cola y reintentar la petición original (incluida en la cola)
                  processQueue(null, newAccessToken);
                  
                  // 4. Configurar la petición original para que use el nuevo token y resolver
                  originalRequest.headers = originalRequest.headers || {};
                  (originalRequest.headers as AxiosRequestHeaders)['Authorization'] = 'Bearer ' + newAccessToken;
                  resolve(apiClient(originalRequest));
              } else {
                  throw new Error('No se recibió el nuevo Access Token.');
              }

          } catch (refreshError) {
              // 5. Si la renovación falla (401 del refresh), forzamos logout
              processQueue(refreshError, null);
              if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                  window.dispatchEvent(new CustomEvent('authLogout'));
              }
              reject(refreshError);
          } finally {
              isRefreshing = false;
          }
      });
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