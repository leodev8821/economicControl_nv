import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice'; // Importa el slice base

// Configura el store de Redux
export const store = configureStore({
  reducer: {
    // Añadir el reducer del slice de la API al store.
    [apiSlice.reducerPath]: apiSlice.reducer,
    // Puedes añadir otros reducers aquí (ej. authReducer, uiReducer)
  },
  // Añadir el middleware de la API para manejo de cacheo, polling, etc.
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(apiSlice.middleware),
  // Opcional: Deshabilita el devtools si estás en producción
  devTools: process.env.NODE_ENV !== 'production',
});

// Inferir los tipos `RootState` y `AppDispatch` del store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;