import "./Register.css";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/i18n";
import { setAuth, AuthState, isAuthenticated, detectRoleByToken } from "./auth";
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
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  nombre?: string;
  apellido?: string;
  general?: string;
}

// Validaciones mejoradas con mensajes específicos
const validateEmail = (email: string, checkCorporate: boolean = false): string | undefined => {
  if (!email) return "El email es requerido";
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "El formato del email no es válido (ejemplo: usuario@empresa.com)";
  
  if (checkCorporate && !isCorporateEmail(email)) {
    return "Debes usar un correo empresarial (no se permiten Gmail, Yahoo, Hotmail, etc.)";
  }
  
  return undefined;
};

const validatePassword = (password: string): { error?: string; requirements: { met: boolean; text: string }[] } => {
  const requirements = [
    { met: password.length >= 8, text: "Mínimo 8 caracteres" },
    { met: /[A-Z]/.test(password), text: "Al menos una letra mayúscula" },
    { met: /[a-z]/.test(password), text: "Al menos una letra minúscula" },
    { met: /\d/.test(password), text: "Al menos un número" }
  ];
  
  if (!password) {
    return { error: "La contraseña es requerida", requirements };
  }
  
  const allMet = requirements.every(req => req.met);
  if (!allMet) {
    return { error: "La contraseña no cumple con todos los requisitos", requirements };
  }
  
  return { requirements };
};

const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword) return "Debes confirmar tu contraseña";
  if (password !== confirmPassword) return "Las contraseñas no coinciden";
  return undefined;
};

const validateNombre = (nombre: string): string | undefined => {
  if (!nombre) return "El nombre es requerido";
  if (nombre.length < 2) return "El nombre debe tener al menos 2 caracteres";
  if (nombre.length > 50) return "El nombre no puede exceder 50 caracteres";
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) return "El nombre solo puede contener letras";
  return undefined;
};

const validateApellido = (apellido: string): string | undefined => {
  if (!apellido) return "El apellido es requerido";
  if (apellido.length < 2) return "El apellido debe tener al menos 2 caracteres";
  if (apellido.length > 50) return "El apellido no puede exceder 50 caracteres";
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido)) return "El apellido solo puede contener letras";
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
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    email: false,
    password: false,
    confirmPassword: false,
    nombre: false,
    apellido: false
  });
  const [passwordRequirements, setPasswordRequirements] = useState<{ met: boolean; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [step, setStep] = useState<"register" | "verification">("register");
  const [verificationCode, setVerificationCode] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verificar si ya hay sesión activa al montar el componente
  useEffect(() => {
    if (isAuthenticated()) {
      console.log("✅ Usuario ya autenticado, redirigiendo desde Register...");
      const userRole = detectRoleByToken();
      const redirectPath = userRole === "superadmin" ? "/superadmin" : userRole === "admin" ? "/admin" : "/client";
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  // Limpiar mensajes e inicializar requisitos de contraseña al montar
  useEffect(() => {
    setMessage(null);
    setErrors({});
    // Inicializar requisitos de contraseña
    const validation = validatePassword('');
    setPasswordRequirements(validation.requirements);
  }, []);

  // Manejar cambios en los inputs
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Actualizar requisitos de contraseña en tiempo real
    if (field === 'password') {
      const validation = validatePassword(value);
      setPasswordRequirements(validation.requirements);
    }
    
    // Si el campo ya fue tocado, validar en tiempo real
    if (touched[field]) {
      validateField(field, value);
    }
  };

  // Validar un campo específico
  const validateField = (field: keyof FormData, value?: string) => {
    const val = value !== undefined ? value : formData[field];
    let error: string | undefined;

    switch (field) {
      case 'email':
        error = validateEmail(val as string, true);
        break;
      case 'password':
        const passValidation = validatePassword(val as string);
        error = passValidation.error;
        setPasswordRequirements(passValidation.requirements);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.password, val as string);
        break;
      case 'nombre':
        error = validateNombre(val as string);
        break;
      case 'apellido':
        error = validateApellido(val as string);
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Manejar cuando el usuario sale del campo (blur)
  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Validar formulario completo
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const passwordValidation = validatePassword(formData.password);
    
    newErrors.email = validateEmail(formData.email, true);
    newErrors.password = passwordValidation.error;
    newErrors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
    newErrors.nombre = validateNombre(formData.nombre);
    newErrors.apellido = validateApellido(formData.apellido);
    
    setErrors(newErrors);
    
    // Marcar todos los campos como tocados
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      nombre: true,
      apellido: true
    });
    
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
                  onBlur={() => handleBlur("nombre")}
                  placeholder="Tu nombre"
                  className={touched.nombre && errors.nombre ? "border-red-500" : ""}
                />
                {touched.nombre && errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
              </div>

              {/* Apellido */}
              <div className="grid gap-1">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => handleInputChange("apellido", e.target.value)}
                  onBlur={() => handleBlur("apellido")}
                  placeholder="Tu apellido"
                  className={touched.apellido && errors.apellido ? "border-red-500" : ""}
                />
                {touched.apellido && errors.apellido && <p className="text-sm text-red-500">{errors.apellido}</p>}
              </div>

              {/* Email */}
              <div className="grid gap-1">
                <Label htmlFor="email">Email Empresarial *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="tu.email@alcaldia.gov.co"
                  className={touched.email && errors.email ? "border-red-500" : ""}
                />
                {touched.email && errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                {!errors.email && <p className="text-xs text-muted-foreground">No se permiten correos personales (Gmail, Yahoo, etc.)</p>}
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
                    onBlur={() => handleBlur("password")}
                    placeholder="Crea una contraseña segura"
                    className={touched.password && errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {touched.password && errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                
                {/* Requisitos de contraseña */}
                {(formData.password || touched.password) && (
                  <div className="mt-2 p-3 bg-muted rounded-md space-y-1">
                    <p className="text-xs font-medium text-foreground mb-2">Requisitos de contraseña:</p>
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                          {req.met ? '✓' : '○'}
                        </span>
                        <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-600'}`}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="grid gap-1">
                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="Repite tu contraseña"
                    className={touched.confirmPassword && errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
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
