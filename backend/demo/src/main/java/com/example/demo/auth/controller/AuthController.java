package com.example.demo.auth.controller;

import com.example.demo.auth.dto.request.*;
import com.example.demo.auth.dto.response.ApiResponse;
import com.example.demo.usuario.dto.request.ChangePasswordRequest;
import com.example.demo.auth.dto.response.LoginResponse;
import com.example.demo.auth.model.PendingUser;
import com.example.demo.auth.repository.PendingUserRepository;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.auth.service.AuthService;
import com.example.demo.auth.service.EmailService;
import com.example.demo.auth.service.EmailVerificationService;
import com.example.demo.auth.service.PasswordResetService;
import com.example.demo.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final EmailService emailService;
    private final EmailVerificationService emailVerificationService;
    private final PendingUserRepository pendingUserRepository;
    private final UsuarioRepository usuarioRepository;
    private final JwtTokenProvider jwtTokenProvider;
    
    // ========== REGISTRO ==========
    
    /**
     * Registro inicial - Solo crea usuario pendiente de verificación
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Solicitud de registro para email: {}", request.getEmail());
        
        PendingUser pendingUser = authService.createPendingUser(request);
        emailService.sendVerificationEmailHtml(pendingUser);
        
        return ResponseEntity.ok(new ApiResponse(
            "El código fue enviado a tu correo"
        ));
    }

    /**
     * Verificar email de registro y completar la creación del usuario
     */
    @PostMapping("/verify-registration")
    public ResponseEntity<LoginResponse> verifyRegistration(@Valid @RequestBody VerifyEmailRequest request) {
        log.info("Verificación de registro para email: {}", request.getEmail());
        LoginResponse response = authService.verifyEmailAndCompleteRegistration(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Verificar email con código - Para usuarios existentes
     */
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        log.info("Verificación de email para: {}", request.getEmail());
        
        try {
            authService.verifyExistingUserEmail(request.getEmail(), request.getCode());
            
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Email verificado exitosamente. Ya puedes iniciar sesión.");
            
            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            log.error("Error verificando email: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("timestamp", java.time.LocalDateTime.now().toString());
            
            // Determinar mensaje específico según el error
            String errorMessage = e.getMessage();
            if (errorMessage.contains("incorrecto") || errorMessage.contains("inválido")) {
                errorResponse.put("message", "El código ingresado es incorrecto");
            } else if (errorMessage.contains("expirado")) {
                errorResponse.put("message", "El código ha expirado. Por favor solicita uno nuevo");
            } else {
                errorResponse.put("message", "Error al verificar el código: " + errorMessage);
            }
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Reenviar código de verificación
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        log.info("Reenvío de código de verificación para: {}", request.getEmail());
        
        try {
            PendingUser pendingUser = authService.resendVerificationCode(request.getEmail());
            emailService.sendVerificationEmailHtml(pendingUser);
            
            return ResponseEntity.ok(new ApiResponse(
                "El código fue enviado a tu correo"
            ));
        } catch (Exception e) {
            log.error("Error reenviando código: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }
    
    /**
     * Enviar código de verificación de email
     */
    @PostMapping("/send-email-verification")
    public ResponseEntity<?> sendEmailVerification(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            System.out.println("=== SEND EMAIL VERIFICATION REQUEST ===");
            System.out.println("Email: " + email);
            
            Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // Enviar código de verificación de email
            emailVerificationService.sendVerificationCode(usuario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Código de verificación enviado exitosamente");
            
            System.out.println("✅ Código de verificación enviado a: " + email);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Error enviando código de verificación: " + e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error enviando código de verificación");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // ========== LOGIN ==========
    
    /**
     * Login directo - Maneja tanto login directo como 2FA
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody LoginRequest request) {
        log.info("🎯 LOGIN ENDPOINT HIT - Email: {}", request.getEmail());
        System.out.println("=== LOGIN REQUEST RECEIVED ===");
        System.out.println("Email: " + request.getEmail());
        System.out.println("Solicitud de login para email: " + request.getEmail());
        
        try {
            // Llamar al AuthService - él maneja toda la lógica
            LoginResponse response = authService.authenticate(request);
            
            System.out.println("✅ Autenticación exitosa");
            System.out.println("Require 2FA: " + response.getRequire2fa());
            System.out.println("Access Token presente: " + (response.getAccessToken() != null));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Exception capturada: " + e.getMessage());
            
            // Verificar si es error de email no verificado
            if (e.getMessage().contains("verificar tu email")) {
                System.out.println("🔍 Error de email no verificado - redirigiendo a verificación");
                
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", e.getMessage());
                errorResponse.put("requireEmailVerification", true); // Solo para este caso
                errorResponse.put("email", request.getEmail());
                errorResponse.put("timestamp", java.time.LocalDateTime.now().toString());
                
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }
            
            // Para otros errores (credenciales inválidas, usuario inactivo, etc.)
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", java.time.LocalDateTime.now().toString());
            
            HttpStatus status = determineHttpStatus(e.getMessage());
            System.out.println("Enviando error con status: " + status + " y mensaje: " + e.getMessage());
            
            return ResponseEntity.status(status).body(errorResponse);
        }
    }
    
    /**
     * Determina el código HTTP apropiado según el mensaje de error
     */
    private HttpStatus determineHttpStatus(String errorMessage) {
        if (errorMessage.contains("Credenciales inválidas")) {
            return HttpStatus.UNAUTHORIZED; // 401
        } else if (errorMessage.contains("verificar tu email")) {
            return HttpStatus.FORBIDDEN; // 403 - Usuario existe pero no puede acceder
        } else if (errorMessage.contains("desactivado") || errorMessage.contains("inactivo")) {
            return HttpStatus.FORBIDDEN; // 403 - Usuario desactivado
        } else if (errorMessage.contains("2FA") || errorMessage.contains("verificación")) {
            return HttpStatus.BAD_REQUEST; // 400 - Requiere acción adicional
        } else {
            return HttpStatus.UNAUTHORIZED; // 401 - Por defecto
        }
    }
    
    /**
     * Validar credenciales sin obtener token
     */
    @PostMapping("/validate-credentials")
    public ResponseEntity<Map<String, Object>> validateCredentials(@Valid @RequestBody LoginRequest request) {
        log.info("Validación de credenciales para email: {}", request.getEmail());
        
        try {
            authService.validateCredentials(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Credenciales correctas");
            response.put("data", null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error validando credenciales: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("data", null);
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Solicitar código de verificación para login
     */
    @PostMapping("/request-login-code")
    public ResponseEntity<ApiResponse> requestLoginCode(@Valid @RequestBody LoginRequest request) {
        log.info("Solicitud de código de login para: {}", request.getEmail());
        
        try {
            PendingUser pendingUser = authService.createLoginVerification(request);
            emailService.sendVerificationEmailHtml(pendingUser);
            
            return ResponseEntity.ok(new ApiResponse(
                "El código fue enviado a tu correo"
            ));
        } catch (Exception e) {
            log.error("Error solicitando código de login: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }
    
    /**
     * Verificar código de login
     */
    @PostMapping("/verify-login-code")
    public ResponseEntity<?> verifyLoginCode(@Valid @RequestBody VerifyEmailRequest request) {
        log.info("Verificación de código de login para: {}", request.getEmail());
        
        try {
            LoginResponse response = authService.verifyLoginCode(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error verificando código de login: {}", e.getMessage());
            
            // Preparar respuesta de error
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("timestamp", java.time.LocalDateTime.now().toString());
            
            // Determinar mensaje y código de error específico
            String errorMessage = e.getMessage();
            HttpStatus status;
            
            if (errorMessage.contains("incorrecto") || errorMessage.contains("no existe")) {
                errorResponse.put("message", "El código ingresado es incorrecto");
                status = HttpStatus.BAD_REQUEST; // 400
            } else if (errorMessage.contains("expirado")) {
                errorResponse.put("message", "El código ha expirado. Por favor solicita uno nuevo");
                status = HttpStatus.BAD_REQUEST; // 400
            } else if (errorMessage.contains("inválido")) {
                errorResponse.put("message", "Código de verificación inválido");
                status = HttpStatus.BAD_REQUEST; // 400
            } else {
                errorResponse.put("message", "Error al verificar el código. Por favor intenta nuevamente");
                status = HttpStatus.BAD_REQUEST; // 400
            }
            
            return ResponseEntity.status(status).body(errorResponse);
        }
    }
    
    // ========== RECUPERACIÓN DE CONTRASEÑA ==========
    
    /**
     * Solicitar recuperación de contraseña
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Solicitud de recuperación de contraseña para: {}", request.getEmail());
        
        try {
            PendingUser pendingUser = authService.createPasswordResetVerification(request.getEmail());
            emailService.sendVerificationEmailHtml(pendingUser);
            
            return ResponseEntity.ok(new ApiResponse(
                "El código fue enviado a tu correo"
            ));
        } catch (Exception e) {
            log.error("Error en forgot-password: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ApiResponse(
                "Error interno del servidor: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Resetear contraseña con código
     */
    @PostMapping("/reset-password")
    public ResponseEntity<LoginResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Reset de contraseña con código para: {}", request.getEmail());
        
        LoginResponse loginResponse = authService.resetPasswordWithCode(request);
        return ResponseEntity.ok(loginResponse);
    }
    
    // ========== LOGOUT ==========
    
    /**
     * Cerrar sesión
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token != null) {
            authService.logout(token);
        }
        return ResponseEntity.ok(new ApiResponse("Sesión cerrada"));
    }
    
    // ========== CAMBIO DE CONTRASEÑA ==========
    
    /**
     * Cambiar contraseña del usuario autenticado
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request, HttpServletRequest httpRequest) {
        log.info("Solicitud de cambio de contraseña");
        
        try {
            String token = extractTokenFromRequest(httpRequest);
            if (token == null) {
                return ResponseEntity.badRequest().body(new ApiResponse("Token no proporcionado"));
            }
            
            authService.changePassword(token, request);
            return ResponseEntity.ok(new ApiResponse("Contraseña actualizada exitosamente"));
        } catch (Exception e) {
            log.error("Error cambiando contraseña: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }
    
    // ========== VERIFICACIÓN DE TOKEN ==========
    
    /**
     * Verificar token JWT
     */
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse> verifyToken(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token != null) {
            authService.verifyToken(token);
            return ResponseEntity.ok(new ApiResponse("Sesión válida"));
        }
        return ResponseEntity.badRequest().body(new ApiResponse("Sesión no válida"));
    }
    
    // ========== CONFIGURACIÓN 2FA ==========
    
    /**
     * Obtener estado actual de 2FA del usuario
     */
    @GetMapping("/2fa/status")
    public ResponseEntity<?> get2FAStatus(HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("Token no proporcionado"));
            }
            
            String email = jwtTokenProvider.getEmailFromJWT(token);
            Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("enabled", usuario.getRequire2fa());
            response.put("email", usuario.getEmail());
            
            return ResponseEntity.ok(ApiResponse.success("Estado de 2FA obtenido", response));
            
        } catch (Exception e) {
            log.error("Error obteniendo estado de 2FA", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error obteniendo estado de 2FA: " + e.getMessage()));
        }
    }
    
    /**
     * Activar/Desactivar 2FA
     */
    @PostMapping("/2fa/toggle")
    public ResponseEntity<?> toggle2FA(@RequestBody Map<String, Boolean> request, HttpServletRequest httpRequest) {
        try {
            String token = extractTokenFromRequest(httpRequest);
            if (token == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("Token no proporcionado"));
            }
            
            String email = jwtTokenProvider.getEmailFromJWT(token);
            Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            Boolean enable2FA = request.get("enabled");
            if (enable2FA == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Parámetro 'enabled' requerido"));
            }
            
            usuario.setRequire2fa(enable2FA);
            usuarioRepository.save(usuario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("enabled", enable2FA);
            response.put("message", enable2FA ? "2FA activado exitosamente" : "2FA desactivado exitosamente");
            
            log.info("2FA {} para usuario: {}", enable2FA ? "activado" : "desactivado", email);
            
            return ResponseEntity.ok(ApiResponse.success("Configuración de 2FA actualizada", response));
            
        } catch (Exception e) {
            log.error("Error actualizando configuración de 2FA", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Error actualizando configuración de 2FA: " + e.getMessage()));
        }
    }
    
    // ========== VERIFICACIÓN 2FA ==========
    
    /**
     * Verificar código 2FA y completar login
     */
    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2FA(@RequestBody Map<String, Object> request) {
        System.out.println("=== VERIFY 2FA CONTROLLER ===");
        System.out.println("Request completo: " + request);
        
        try {
            // 1. Validar request
            if (request == null || request.isEmpty()) {
                System.out.println("❌ Request vacío o null");
                return ResponseEntity.badRequest().body(ApiResponse.error("Datos de verificación requeridos"));
            }
            
            // 2. Extraer datos
            Object userIdObj = request.get("userId");
            Object codeObj = request.get("code");
            
            System.out.println("3. UserId extraído: " + userIdObj + " (tipo: " + (userIdObj != null ? userIdObj.getClass().getSimpleName() : "null") + ")");
            System.out.println("4. Code extraído: " + codeObj + " (tipo: " + (codeObj != null ? codeObj.getClass().getSimpleName() : "null") + ")");
            
            if (userIdObj == null || codeObj == null) {
                System.out.println("❌ Faltan datos requeridos");
                return ResponseEntity.badRequest().body(ApiResponse.error("userId y code son requeridos"));
            }
            
            // 3. Convertir tipos
            Long userId;
            if (userIdObj instanceof Number) {
                userId = ((Number) userIdObj).longValue();
            } else if (userIdObj instanceof String) {
                try {
                    userId = Long.parseLong((String) userIdObj);
                } catch (NumberFormatException e) {
                    System.out.println("❌ Error parseando userId: " + e.getMessage());
                    return ResponseEntity.badRequest().body(ApiResponse.error("userId debe ser un número válido"));
                }
            } else {
                System.out.println("❌ Tipo de userId no soportado: " + userIdObj.getClass().getSimpleName());
                return ResponseEntity.badRequest().body(ApiResponse.error("userId debe ser un número"));
            }
            
            String code = codeObj.toString().trim();
            
            System.out.println("Datos extraídos - UserId: " + userId + ", Code: '" + code + "'");
            
            // 4. Llamar al servicio
            LoginResponse response = authService.verify2FAAndCompleteLogin(userId, code);
            
            System.out.println("✅ Controller: 2FA verificado exitosamente");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Controller Error: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().toString());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        } finally {
            System.out.println("=== END VERIFY 2FA CONTROLLER ===");
        }
    }
    
    // ========== MÉTODOS DE DEBUG ==========
    
    @GetMapping("/debug/user/{email}")
    public ResponseEntity<?> debugUser(@PathVariable String email) {
        try {
            Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", usuario.getId());
            response.put("email", usuario.getEmail());
            response.put("emailVerificado", usuario.getEmailVerified());
            response.put("activo", usuario.getActive());
            response.put("require2fa", usuario.getRequire2fa());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/debug/set-email-verification/{email}")
    public ResponseEntity<?> setEmailVerification(@PathVariable String email, @RequestParam boolean verified) {
        try {
            Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            usuario.setEmailVerified(verified);
            usuarioRepository.save(usuario);
            
            return ResponseEntity.ok(Map.of(
                "message", "Email verification updated",
                "email", email,
                "emailVerificado", verified
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ========== DEBUG ENDPOINTS ==========
    
    @GetMapping("/debug/pending-users")
    public ResponseEntity<?> getPendingUsers() {
        log.info("🔍 [DEBUG] Consultando usuarios pendientes...");
        try {
            List<PendingUser> pendingUsers = pendingUserRepository.findAll();
            log.info("🔍 [DEBUG] Usuarios pendientes encontrados: {}", pendingUsers.size());
            
            List<Map<String, Object>> response = pendingUsers.stream()
                .map(pu -> {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("id", pu.getId());
                    userInfo.put("email", pu.getEmail());
                    userInfo.put("nombre", pu.getNombre());
                    userInfo.put("apellido", pu.getApellido());
                    userInfo.put("verificationCode", pu.getVerificationCode());
                    userInfo.put("codeExpiration", pu.getCodeExpiration());
                    userInfo.put("createdAt", pu.getCreatedAt());
                    userInfo.put("verified", pu.isVerified());
                    userInfo.put("verificationType", pu.getVerificationType());
                    return userInfo;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", pendingUsers.size(),
                "users", response
            ));
        } catch (Exception e) {
            log.error("❌ [DEBUG] Error consultando usuarios pendientes:", e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
    
    // ========== MÉTODOS AUXILIARES ==========
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
