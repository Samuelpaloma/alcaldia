import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, detectRoleByToken } from "./auth";

/**
 * Componente que redirige al dashboard correspondiente si hay sesión activa,
 * o al login si no hay sesión.
 * Se usa en la ruta raíz "/" para manejar la redirección inicial.
 */
export default function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si hay sesión activa
    if (isAuthenticated()) {
      // Detectar el rol del usuario desde el token
      const userRole = detectRoleByToken();
      
      // Redirigir al dashboard correspondiente
      let redirectPath = "/client";
      
      switch (userRole) {
        case "superadmin":
          redirectPath = "/superadmin";
          break;
        case "admin":
          redirectPath = "/admin";
          break;
        case "client":
        default:
          redirectPath = "/client";
          break;
      }
      
      console.log(`✅ Sesión activa detectada, redirigiendo a: ${redirectPath}`);
      navigate(redirectPath, { replace: true });
    } else {
      // No hay sesión, redirigir al login
      console.log("❌ No hay sesión activa, redirigiendo a login");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Mostrar un loader mientras se verifica la sesión
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Cargando...
          </span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Verificando sesión...</p>
      </div>
    </div>
  );
}

