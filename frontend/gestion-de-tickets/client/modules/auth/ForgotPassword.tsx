import "./Login.css";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate, Link } from "react-router-dom";
import { api, ForgotPasswordRequest } from "@shared/api";
import { isAuthenticated, detectRoleByToken } from "./auth";

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Verificar si ya hay sesión activa al montar el componente
  useEffect(() => {
    if (isAuthenticated()) {
      console.log("✅ Usuario ya autenticado, redirigiendo desde ForgotPassword...");
      const userRole = detectRoleByToken();
      const redirectPath = userRole === "superadmin" ? "/superadmin" : userRole === "admin" ? "/admin" : "/client";
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  // Validación de email
  const validateEmail = (email: string): string | undefined => {
    if (!email) return "El email es requerido";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "El email debe tener un formato válido";
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    // Validar email
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      setMessage({ type: "error", text: error });
      return;
    }

    setIsLoading(true);
    
    try {
      const data: ForgotPasswordRequest = {
        email: email.trim()
      };

      const response = await api.forgotPassword(data);
      
      setMessage({ 
        type: "success", 
        text: response.message || "Se ha enviado un código de verificación a tu correo" 
      });

      // Navegar a la pantalla de reset después de un breve delay
      setTimeout(() => {
        navigate("/reset-password", { state: { email: email.trim() } });
      }, 1500);
      
    } catch (error) {
      console.error("Error al solicitar recuperación de contraseña:", error);
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "No se pudo enviar el correo de recuperación" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section auth-center">
      <Card className="auth-card">
        <CardHeader>
          <CardTitle className="text-center">Recuperar Contraseña</CardTitle>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña
          </p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="grid gap-1">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="tu.email@alcaldia.gov.co"
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
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
              {isLoading ? "Enviando..." : "Enviar código de recuperación"}
            </Button>

            {/* Enlace para volver al login */}
            <p className="auth-links text-center">
              <Link to="/login" className="underline text-sm">
                Volver al inicio de sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

