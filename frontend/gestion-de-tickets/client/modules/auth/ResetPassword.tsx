import "./Login.css";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api, ResetPasswordRequest, ResetPasswordResponse } from "@shared/api";
import { setAuth, isAuthenticated, detectRoleByToken } from "./auth";

interface FormData {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  code?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Función para determinar el rol basado en el tipo de usuario del backend
const getRoleFromTipoUsuario = (tipoUsuario: string): "admin" | "client" | "superadmin" => {
  switch (tipoUsuario?.toUpperCase()) {
    case "SUPERADMIN":
      return "superadmin";
    case "ADMINISTRADOR":
      return "admin";
    case "FUNCIONARIO":
    case "TECNICO":
    default:
      return "client";
  }
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email;

  const [formData, setFormData] = useState<FormData>({
    code: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verificar si ya hay sesión activa al montar el componente
  useEffect(() => {
    if (isAuthenticated()) {
      console.log("✅ Usuario ya autenticado, redirigiendo desde ResetPassword...");
      const userRole = detectRoleByToken();
      const redirectPath = userRole === "superadmin" ? "/superadmin" : userRole === "admin" ? "/admin" : "/client";
      navigate(redirectPath, { replace: true });
      return;
    }
  }, [navigate]);

  // Redirigir si no hay email
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  // Validaciones
  const validateCode = (code: string): string | undefined => {
    if (!code) return "El código es requerido";
    if (code.length < 6) return "El código debe tener al menos 6 caracteres";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "La contraseña es requerida";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (!/(?=.*[a-z])/.test(password)) return "Debe contener al menos una letra minúscula";
    if (!/(?=.*[A-Z])/.test(password)) return "Debe contener al menos una letra mayúscula";
    if (!/(?=.*\d)/.test(password)) return "Debe contener al menos un número";
    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) return "Debes confirmar la contraseña";
    if (confirmPassword !== password) return "Las contraseñas no coinciden";
    return undefined;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    newErrors.code = validateCode(formData.code);
    newErrors.newPassword = validatePassword(formData.newPassword);
    newErrors.confirmPassword = validateConfirmPassword(formData.confirmPassword, formData.newPassword);
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!validateForm()) {
      setMessage({ type: "error", text: "Por favor corrige los errores en el formulario" });
      return;
    }

    setIsLoading(true);
    
    try {
      const data: ResetPasswordRequest = {
        email: email,
        token: formData.code.trim(),
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      };

      const response: ResetPasswordResponse = await api.resetPassword(data);
      
      setMessage({ 
        type: "success", 
        text: "Contraseña actualizada exitosamente. Redirigiendo..." 
      });

      // Si el backend retorna un token JWT, hacer auto-login
      if (response.accessToken) {
        // Configurar autenticación
        setAuth({ 
          token: response.accessToken
        });
        
        // Actualizar token en ApiClient
        api.setToken(response.accessToken);
        
        // Determinar ruta de redirección según el tipo de usuario
        const userRole = getRoleFromTipoUsuario(response.tipoUsuario || "");
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
        
        // Redirigir después de un breve delay
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1500);
      } else {
        // Si no hay auto-login, redirigir al login
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      }
      
    } catch (error) {
      console.error("Error al resetear contraseña:", error);
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "No se pudo actualizar la contraseña" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="section auth-center">
      <Card className="auth-card">
        <CardHeader>
          <CardTitle className="text-center">Nueva Contraseña</CardTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Ingresa el código que recibiste por email y tu nueva contraseña
          </p>
          <p className="text-sm font-medium text-center mt-1">{email}</p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            {/* Código de recuperación */}
            <div className="grid gap-1">
              <Label htmlFor="code">Código de recuperación *</Label>
              <Input
                id="code"
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="123456"
                maxLength={10}
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
            </div>

            {/* Nueva contraseña */}
            <div className="grid gap-1">
              <Label htmlFor="newPassword">Nueva contraseña *</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  placeholder="••••••••"
                  className={errors.newPassword ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
              <p className="text-xs text-muted-foreground">
                Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número
              </p>
            </div>

            {/* Confirmar contraseña */}
            <div className="grid gap-1">
              <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Mensaje de estado */}
            {message && (
              <Alert className={message.type === "error" ? "border-red-500" : "border-green-500"}>
                <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {/* Botón de envío */}
            <Button 
              type="submit" 
              className="btn-contrast w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Actualizando..." : "Actualizar contraseña"}
            </Button>

            {/* Enlaces */}
            <div className="flex flex-col gap-2 items-center">
              <Link to="/forgot-password" className="text-sm underline">
                Solicitar nuevo código
              </Link>
              <Link to="/login" className="text-sm underline">
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

