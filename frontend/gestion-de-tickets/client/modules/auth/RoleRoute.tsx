import { Navigate, Outlet } from "react-router-dom";
import { getAuth, Role } from "./auth";

export default function RoleRoute({ role }: { role: Role }) {
  const auth = getAuth();
  
  // Solo verificar si existe autenticación básica
  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  
  // Verificar rol específico
  if (auth.role !== role) {
    const dest = auth.role === "admin" ? "/admin" : "/client";
    return <Navigate to={dest} replace />;
  }
  
  return <Outlet />;
}
