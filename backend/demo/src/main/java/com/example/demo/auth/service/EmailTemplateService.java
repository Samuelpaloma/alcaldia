package com.example.demo.auth.service;

import com.example.demo.auth.model.PendingUser;
import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {
    
    public String generateVerificationEmail(String nombre, String codigo, PendingUser.VerificationType type) {
        String titulo = getTitulo(type);
        String mensaje = getMensaje(type);
        String color = getColor(type);
        
        return String.format("""
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>%s</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        line-height: 1.6;
                        color: #1f2937;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9fafb;
                    }
                    .container {
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                        overflow: hidden;
                        border: 1px solid #e5e7eb;
                    }
                    .header {
                        background: linear-gradient(135deg, %s 0%%, %s 100%%);
                        color: white;
                        padding: 32px 24px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: 600;
                        letter-spacing: -0.025em;
                    }
                    .content {
                        padding: 32px 24px;
                    }
                    .greeting {
                        font-size: 18px;
                        margin-bottom: 16px;
                        color: #374151;
                        font-weight: 500;
                    }
                    .message {
                        font-size: 16px;
                        margin-bottom: 24px;
                        line-height: 1.7;
                        color: #6b7280;
                    }
                    .code-container {
                        background: #f3f4f6;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        padding: 24px;
                        text-align: center;
                        margin: 24px 0;
                    }
                    .code-label {
                        margin-bottom: 12px;
                        color: #6b7280;
                        font-size: 14px;
                        font-weight: 500;
                    }
                    .code {
                        font-size: 28px;
                        font-weight: 700;
                        letter-spacing: 6px;
                        color: %s;
                        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                        background: white;
                        padding: 16px 24px;
                        border-radius: 6px;
                        display: inline-block;
                        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                        border: 1px solid #d1d5db;
                    }
                    .instructions {
                        background: #eff6ff;
                        border-left: 4px solid #3b82f6;
                        padding: 16px;
                        margin: 20px 0;
                        border-radius: 0 6px 6px 0;
                    }
                    .instructions h3 {
                        margin: 0 0 8px 0;
                        color: #1e40af;
                        font-size: 14px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    }
                    .instructions ul {
                        margin: 0;
                        padding-left: 16px;
                        font-size: 14px;
                        color: #4b5563;
                    }
                    .instructions li {
                        margin-bottom: 4px;
                    }
                    .footer {
                        background: #f9fafb;
                        padding: 20px 24px;
                        text-align: center;
                        font-size: 13px;
                        color: #6b7280;
                        border-top: 1px solid #e5e7eb;
                    }
                    .footer p {
                        margin: 4px 0;
                    }
                    .footer strong {
                        color: #374151;
                        font-weight: 600;
                    }
                    .warning {
                        background: #fef3c7;
                        border: 1px solid #f59e0b;
                        color: #92400e;
                        padding: 12px 16px;
                        border-radius: 6px;
                        margin: 20px 0;
                        font-size: 14px;
                    }
                    .warning strong {
                        font-weight: 600;
                    }
                    @media (max-width: 600px) {
                        body {
                            padding: 12px;
                        }
                        .header, .content, .footer {
                            padding: 20px 16px;
                        }
                        .code {
                            font-size: 24px;
                            letter-spacing: 4px;
                            padding: 12px 20px;
                        }
                        .header h1 {
                            font-size: 20px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s</h1>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Hola %s,
                        </div>
                        
                        <div class="message">
                            %s
                        </div>
                        
                        <div class="code-container">
                            <div class="code-label">
                                Tu código de verificación es:
                            </div>
                            <div class="code">%s</div>
                        </div>
                        
                        <div class="instructions">
                            <h3>Instrucciones</h3>
                            <ul>
                                <li>Ingresa este código en la aplicación para continuar</li>
                                <li>El código es válido por 15 minutos</li>
                                <li>No compartas este código con nadie</li>
                            </ul>
                        </div>
                        
                        <div class="warning">
                            <strong>Importante:</strong> Si no solicitaste este código, ignora este correo.
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>Sistema de Gestión de Tickets</strong></p>
                        <p>Este es un correo automático, por favor no respondas.</p>
                        <p>© 2025 Alcaldía - Todos los derechos reservados</p>
                    </div>
                </div>
            </body>
            </html>
            """, titulo, color, adjustColor(color, -20), color, titulo, nombre, mensaje, codigo);
    }
    
    private String getTitulo(PendingUser.VerificationType type) {
        return switch (type) {
            case REGISTRATION -> "Verificación de Cuenta";
            case LOGIN -> "Código de Inicio de Sesión";
            case PASSWORD_RESET -> "Recuperación de Contraseña";
        };
    }
    
    private String getMensaje(PendingUser.VerificationType type) {
        return switch (type) {
            case REGISTRATION -> "¡Bienvenido! Para completar tu registro y activar tu cuenta, necesitamos verificar tu dirección de correo electrónico.";
            case LOGIN -> "Se ha solicitado un código de verificación para iniciar sesión de forma segura en tu cuenta.";
            case PASSWORD_RESET -> "Has solicitado restablecer tu contraseña. Usa el código a continuación para continuar con el proceso.";
        };
    }
    
    private String getColor(PendingUser.VerificationType type) {
        return switch (type) {
            case REGISTRATION -> "#4caf50";
            case LOGIN -> "#2196f3";
            case PASSWORD_RESET -> "#ff9800";
        };
    }
    
    private String adjustColor(String color, int adjustment) {
        // Simple color adjustment for gradient
        return color;
    }
}
