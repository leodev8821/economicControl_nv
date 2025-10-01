import { useContext } from 'react';
// Importa el contexto que creaste en el otro archivo
import { AuthContext } from '../providers/auth.context'; 
//import { AuthContextType } from '../providers/auth.context'; // Tendremos que exportar el tipo AuthContextType

// Hook personalizado para usar la autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};