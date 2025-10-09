import { Navigate, Outlet } from "react-router-dom";
import { getAuth, isAuthenticated, detectRoleByToken, Role } from "./auth";

export default function RoleRoute({ role }: { role: Role }) {
  const auth = getAuth();
  
  // Verificar si existe autenticación básica
  if (!auth || !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Detectar rol desde el token JWT
  const userRole = detectRoleByToken();
  
  // Verificar rol específico
  if (userRole !== role) {
    const dest = userRole === "admin" ? "/admin" : "/client";
    return <Navigate to={dest} replace />;
  }
  
  return <Outlet />;
}