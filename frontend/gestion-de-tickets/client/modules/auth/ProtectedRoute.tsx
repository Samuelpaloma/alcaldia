import { Navigate, useLocation } from "react-router-dom";
import { getAuth } from "./auth";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const auth = getAuth();
  
  // No ejecutar verificaciones en rutas públicas
  if (location.pathname === '/login' || location.pathname === '/register') {
    return children;
  }
  
  // Solo verificar si existe autenticación básica
  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}
