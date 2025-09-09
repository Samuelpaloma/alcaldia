import { Navigate, Outlet } from "react-router-dom";
import { getAuth, Role } from "./auth";

export default function RoleRoute({ role }: { role: Role }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (auth.role !== role) {
    const dest = auth.role === "admin" ? "/admin" : "/client";
    return <Navigate to={dest} replace />;
  }
  return <Outlet />;
}
