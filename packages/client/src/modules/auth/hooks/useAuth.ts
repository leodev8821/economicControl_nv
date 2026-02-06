import { useContext } from "react";
import { AuthContext } from "@modules/auth/context/auth.context";

// Hook para usar la autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
