import { Navigate, useLocation } from "react-router-dom";
import { getAuth } from "./auth";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const auth = getAuth();
  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
