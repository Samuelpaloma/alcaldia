import "./Login.css";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/i18n";
import { setAuth, AuthState, getAuth, isAuthenticated, getUserInfo } from "./auth";
import { useNavigate, Link } from "react-router-dom";
import { api, LoginRequest, LoginResponse, VerifyEmailRequest } from "@shared/api";

// Tipos para el estado del formulario
interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// Validaciones
const validateEmail = (email: string): string | undefined => {
  if (!email) return "El email es requerido";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "El email debe tener un formato válido";
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password) return "La contraseña es requerida";
  if (password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
  return undefined;
};

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

export default function Login() {
  const { t } = useI18n();
  const navigate = useNavigate();
  
  // Estados del formulario
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [step, setStep] = useState<"credentials" | "verification">("credentials");
  const [verificationCode, setVerificationCode] = useState("");
  const [tempCredentials, setTempCredentials] = useState<FormData | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Verificar si ya hay sesión activa al montar el componente
  useEffect(() => {
    if (isAuthenticated()) {
      const auth = getAuth();
      console.log("✅ Usuario ya autenticado, redirigiendo...");
      
      // Detectar rol y redirigir
      const userRole = auth?.user?.role || getRoleFromTipoUsuario(
        getUserInfo()?.tipoUsuario || "FUNCIONARIO"
      );
      
      let redirectPath = "/client";
      switch (userRole) {
        case "superadmin":
          redirectPath = "/superadmin/administradores";
          break;
        case "admin":
          redirectPath = "/admin";
          break;
        case "client":
        default:
          redirectPath = "/client";
          break;
      }
      
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  // Limpiar mensajes al montar el componente
  useEffect(() => {
    setMessage(null);
    setErrors({});
  }, []);

  // Manejar cambios en los inputs
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validar formulario completo
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  // Manejar envío de credenciales (Paso 1)
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!validateForm()) {
      setMessage({ type: "error", text: "Por favor corrige los errores en el formulario" });
      return;
    }

    setIsLoading(true);
    
    try {
      // Validar credenciales con el backend
      const loginData: LoginRequest = {
        email: formData.email,
        password: formData.password,
      };

      console.log('🔐 Validando credenciales...', loginData);
      console.log('🌐 URL del backend:', 'http://localhost:8080/api');
      
      const validateResult = await api.validateCredentials(loginData);
      console.log('✅ Resultado de validación:', validateResult);
      
      console.log('📧 Solicitando código de verificación...');
      const codeResult = await api.requestLoginCode(loginData);
      console.log('✅ Resultado de solicitud de código:', codeResult);
      
      // Guardar credenciales temporalmente
      setTempCredentials({ ...formData });
      
      // Cambiar al paso de verificación
      setStep("verification");
      setMessage({ 
        type: "success", 
        text: "El código fue enviado a tu correo" 
      });
      
    } catch (error) {
      console.error("❌ Error en validación de credenciales:", error);
      console.error("❌ Tipo de error:", typeof error);
      console.error("❌ Mensaje de error:", error instanceof Error ? error.message : 'Error desconocido');
      
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "El correo o la contraseña son incorrectos" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar verificación de código (Paso 2)
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!verificationCode) {
      setMessage({ type: "error", text: "Por favor ingresa el código de verificación" });
      return;
    }

    if (!tempCredentials) {
      setMessage({ type: "error", text: "Error: credenciales no encontradas" });
      return;
    }

    setIsLoading(true);
    
    try {
      // Verificar código de login
      const verifyData: VerifyEmailRequest = {
        email: tempCredentials.email,
        code: verificationCode,
      };
      
      const response: LoginResponse = await api.verifyLoginCode(verifyData);
      
      // Configurar autenticación con solo token JWT (datos sensibles no se almacenan)
      setAuth({ 
        token: response.accessToken
      });
      
      // Actualizar token en ApiClient inmediatamente
      api.setToken(response.accessToken);
      
      setMessage({ 
        type: "success", 
        text: `Bienvenido` 
      });
      
      // Determinar la ruta de redirección basada en el tipo de usuario
      const userRole = getRoleFromTipoUsuario(response.tipoUsuario || "FUNCIONARIO");
      let redirectPath = "/client"; // Default
      
      switch (userRole) {
        case "superadmin":
          redirectPath = "/superadmin/administradores";
          break;
        case "admin":
          redirectPath = "/admin";
          break;
        case "client":
        default:
          redirectPath = "/client";
          break;
      }
      
      console.log(`🎯 Redirigiendo a: ${redirectPath} (rol: ${userRole})`);
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1500);
      
    } catch (error) {
      console.error("Error en verificación de código:", error);
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "El código es incorrecto o ha expirado" 
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="section auth-center">
      <Card className="auth-card">
        <CardHeader>
          <CardTitle className="text-center">
            {step === "credentials" ? "Iniciar Sesión" : "Verificación de Código"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === "credentials" ? (
            <form className="grid gap-4" onSubmit={handleCredentials}>
              {/* Email */}
              <div className="grid gap-1">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="tu.email@alcaldia.gov.co"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Contraseña */}
              <div className="grid gap-1">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
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
                {isLoading ? "Validando credenciales..." : "Continuar"}
              </Button>

              {/* Enlace a recuperar contraseña */}
              <div className="text-center mt-4">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Enlace a registro */}
              <p className="auth-links text-center">
                <span>¿No tienes cuenta? </span>
                <Link to="/register" className="underline">Regístrate aquí</Link>
              </p>
            </form>
          ) : (
            <form className="grid gap-4" onSubmit={handleVerification}>
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Hemos enviado un código de verificación de 6 dígitos a:
                </p>
                <p className="font-medium">{tempCredentials?.email}</p>
              </div>

              {/* Código de verificación */}
              <div className="grid gap-1">
                <Label htmlFor="verificationCode">Código de Verificación *</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              {/* Mensaje de estado */}
              {message && (
                <Alert className={message.type === "error" ? "border-red-500" : "border-green-500"}>
                  <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {/* Botón de verificación */}
              <Button 
                type="submit" 
                className="btn-contrast w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Verificando..." : "Verificar Código"}
              </Button>

              {/* Botón para volver a credenciales */}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setStep("credentials");
                  setMessage(null);
                  setVerificationCode("");
                }}
                disabled={isLoading}
              >
                Volver a Credenciales
              </Button>

              {/* Enlace a recuperar contraseña */}
              <div className="text-center mt-4">
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}