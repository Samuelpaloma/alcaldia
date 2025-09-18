import "./Register.css";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useI18n } from "@/i18n";
import { setAuth, AuthState } from "./auth";
import { useNavigate, Link } from "react-router-dom";
import { api, RegisterRequest, VerifyEmailRequest, LoginResponse } from "@shared/api";

function isCorporateEmail(email: string) {
  const publicDomains = /(gmail|yahoo|hotmail|outlook|icloud|proton)\.com$/i;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) return false;
  if (publicDomains.test(domain)) return false;
  return /.+@.+/.test(email);
}

// Tipos para el estado del formulario
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  apellido: string;
  telefono?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
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

const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) return "Confirma tu contraseña";
  if (password !== confirmPassword) return "Las contraseñas no coinciden";
  return undefined;
};

const validateNombre = (nombre: string): string | undefined => {
  if (!nombre) return "El nombre es requerido";
  if (nombre.length < 2) return "El nombre debe tener al menos 2 caracteres";
  return undefined;
};

const validateApellido = (apellido: string): string | undefined => {
  if (!apellido) return "El apellido es requerido";
  if (apellido.length < 2) return "El apellido debe tener al menos 2 caracteres";
  return undefined;
};

export default function Register() {
  const { t } = useI18n();
  const navigate = useNavigate();
  
  // Estados del formulario
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellido: "",
    telefono: "",
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [step, setStep] = useState<"register" | "verification">("register");
  const [verificationCode, setVerificationCode] = useState("");
  const [tempEmail, setTempEmail] = useState("");

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
    newErrors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
    newErrors.nombre = validateNombre(formData.nombre);
    newErrors.apellido = validateApellido(formData.apellido);
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  // Manejar registro (Paso 1)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!validateForm()) {
      setMessage({ type: "error", text: "Por favor corrige los errores en el formulario" });
      return;
    }

    setIsLoading(true);
    
    try {
      // Registrar usuario con el backend
      const registerData: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono || undefined,
      };

      console.log('📝 Registrando usuario...', registerData);
      
      const result = await api.register(registerData);
      console.log('✅ Resultado de registro:', result);
      
      // Guardar email temporalmente
      setTempEmail(formData.email);
      
      // Cambiar al paso de verificación
      setStep("verification");
      setMessage({ 
        type: "success", 
        text: "El código fue enviado a tu correo" 
      });
      
    } catch (error) {
      console.error("❌ Error en registro:", error);
      
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Error al registrar usuario" 
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

    setIsLoading(true);
    
    try {
      // Verificar código de email
      const verifyData: VerifyEmailRequest = {
        email: tempEmail,
        code: verificationCode,
      };
      
      console.log('🔐 Verificando código...', verifyData);
      
      const response: LoginResponse = await api.verifyEmail(verifyData);
      console.log('✅ Resultado de verificación:', response);
      
      // Configurar autenticación con solo token JWT (datos sensibles no se almacenan)
      setAuth({ 
        token: response.accessToken
      });
      
      setMessage({ 
        type: "success", 
        text: `Cuenta verificada exitosamente. Bienvenido` 
      });
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate("/client", { replace: true });
      }, 2000);
      
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
            {step === "register" ? "Crear Cuenta" : "Verificación de Email"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === "register" ? (
            <form className="grid gap-4" onSubmit={handleRegister}>
              {/* Nombre */}
              <div className="grid gap-1">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Tu nombre"
                  className={errors.nombre ? "border-red-500" : ""}
                />
                {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
              </div>

              {/* Apellido */}
              <div className="grid gap-1">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => handleInputChange("apellido", e.target.value)}
                  placeholder="Tu apellido"
                  className={errors.apellido ? "border-red-500" : ""}
                />
                {errors.apellido && <p className="text-sm text-red-500">{errors.apellido}</p>}
              </div>

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

              {/* Teléfono */}
              <div className="grid gap-1">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  placeholder="(Opcional)"
                />
              </div>

              {/* Contraseña */}
              <div className="grid gap-1">
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              {/* Confirmar Contraseña */}
              <div className="grid gap-1">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Repite tu contraseña"
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
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
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>

              {/* Enlace a login */}
              <p className="auth-links text-center">
                <span>¿Ya tienes cuenta? </span>
                <Link to="/login" className="underline">Inicia sesión aquí</Link>
              </p>
            </form>
          ) : (
            <form className="grid gap-4" onSubmit={handleVerification}>
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Hemos enviado un código de verificación de 6 dígitos a:
                </p>
                <p className="font-medium">{tempEmail}</p>
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

              {/* Botón para volver a registro */}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setStep("register");
                  setMessage(null);
                  setVerificationCode("");
                }}
                disabled={isLoading}
              >
                Volver a Registro
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
