package com.example.demo.auth.controller;

import com.example.demo.auth.dto.request.ForgotPasswordRequest;
import com.example.demo.auth.dto.request.LoginRequest;
import com.example.demo.auth.dto.request.RegisterRequest;
import com.example.demo.auth.dto.request.ResetPasswordRequest;
import com.example.demo.auth.dto.request.VerifyEmailRequest;
import com.example.demo.auth.dto.request.ResendVerificationRequest;
import com.example.demo.usuario.DTO.request.ChangePasswordRequest;
import com.example.demo.auth.dto.response.ApiResponse;
import com.example.demo.auth.dto.response.LoginResponse;
import com.example.demo.auth.service.AuthService;
import com.example.demo.auth.service.EmailService;
import com.example.demo.auth.service.EmailVerificationService;
import com.example.demo.auth.service.PasswordResetService;
import com.example.demo.usuario.model.User;
import com.example.demo.usuario.repository.UserRepository;
import com.example.demo.auth.exception.AuthException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final EmailVerificationService emailVerificationService;
    
    // 🔐 LOGIN - CORREGIDO para manejar excepciones apropiadamente
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
            
        } catch (AuthException e) {
            System.out.println("❌ AuthException capturada: " + e.getMessage());
            
            // NUEVO: Verificar si es error de email no verificado
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
            // NO incluir requireEmailVerification para otros errores
            
            HttpStatus status = determineHttpStatus(e.getMessage());
            System.out.println("Enviando error con status: " + status + " y mensaje: " + e.getMessage());
            
            return ResponseEntity.status(status).body(errorResponse);
            
        } catch (Exception e) {
            System.out.println("❌ Exception general capturada: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error interno del servidor. Intente nuevamente");
            errorResponse.put("timestamp", java.time.LocalDateTime.now().toString());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
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
    
    // 🔐 VERIFICAR CÓDIGO 2FA
    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2FA(@RequestBody Map<String, Object> request) {
        try {
            int userId = (Integer) request.get("userId");
            String code = (String) request.get("code");
            
            System.out.println("=== VERIFY 2FA REQUEST ===");
            System.out.println("User ID: " + userId);
            System.out.println("Code: " + code);
            
            LoginResponse response = authService.verify2FAAndCompleteLogin(userId, code);
            
            System.out.println("✅ 2FA verificado exitosamente");
            return ResponseEntity.ok(response);
            
        } catch (AuthException e) {
            System.out.println("❌ Error en verificación 2FA: " + e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", java.time.LocalDateTime.now().toString());
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            
        } catch (Exception e) {
            System.out.println("❌ Error general en 2FA: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error verificando código. Intente nuevamente");
            errorResponse.put("timestamp", java.time.LocalDateTime.now().toString());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    // 👤 REGISTRO - Solo para funcionarios (público)
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Solicitud de registro para email: {}", request.getEmail());
        
        try {
            authService.registerFuncionario(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta con el código enviado."));
        } catch (Exception e) {
            log.error("Error en registro", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse("Error en el registro: " + e.getMessage()));
        }
    }
    
    // ✅ VERIFICAR EMAIL CON CÓDIGO
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        log.info("Solicitud de verificación de email con código: {}", request.getCode());
        
        try {
            authService.verifyEmail(request);
            return ResponseEntity.ok(
                new ApiResponse("Email verificado exitosamente. Ya puedes iniciar sesión.")
            );
        } catch (Exception e) {
            log.error("Error verificando email", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse("Error verificando email: " + e.getMessage()));
        }
    }

    // Reenviar código 2FA
    @PostMapping("/resend-2fa-code")
    public ResponseEntity<?> resend2FACode(@RequestBody Map<String, Object> request) {
        try {
            int userId = (Integer) request.get("userId");
            
            System.out.println("=== RESEND 2FA CODE REQUEST ===");
            System.out.println("User ID: " + userId);
            
            User usuario = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("Usuario no encontrado"));
            
            // Reenviar código 2FA usando EmailVerificationService
            emailVerificationService.send2FACode(usuario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Código 2FA reenviado exitosamente");
            
            System.out.println("✅ Código 2FA reenviado a: " + usuario.getEmail());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Error reenviando código 2FA: " + e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error reenviando código");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // 🔄 REENVIAR CÓDIGO DE VERIFICACIÓN
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        log.info("Solicitud de reenvío de código de verificación para: {}", request.getEmail());
        
        try {
            authService.resendVerificationCode(request);
            return ResponseEntity.ok(
                new ApiResponse("Código de verificación reenviado. Revisa tu bandeja de entrada.")
            );
        } catch (Exception e) {
            log.error("Error reenviando código", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse("Error reenviando código: " + e.getMessage()));
        }
    }

    // Enviar código de verificación de email
    @PostMapping("/send-email-verification")
    public ResponseEntity<?> sendEmailVerification(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            System.out.println("=== SEND EMAIL VERIFICATION REQUEST ===");
            System.out.println("Email: " + email);
            
            User usuario = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("Usuario no encontrado"));
            
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
    
    // 🧪 ENDPOINT DE PRUEBA - ENVIAR EMAIL DE PRUEBA
    @PostMapping("/test-email")
    public ResponseEntity<ApiResponse> testEmail(@RequestParam String email) {
        log.info("Enviando email de prueba a: {}", email);
        
        try {
            User testUser = new User();
            testUser.setEmail(email);
            testUser.setNombre("Test");
            testUser.setApellido("Usuario");
            
            emailService.sendEmailVerificationCode(testUser, "123456");
            return ResponseEntity.ok(
                new ApiResponse("Email de prueba enviado exitosamente a: " + email)
            );
        } catch (Exception e) {
            log.error("Error enviando email de prueba", e);
            return ResponseEntity.status(500)
                .body(new ApiResponse("Error enviando email: " + e.getMessage()));
        }
    }
    
    // 🔑 SOLICITAR CÓDIGO DE RECUPERACIÓN
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Solicitud de recuperación de contraseña para: {}", request.getEmail());
        
        try {
            passwordResetService.sendResetToken(request.getEmail());
            return ResponseEntity.ok(
                new ApiResponse("Se ha enviado un código de recuperación a tu email. Revisa tu bandeja de entrada.")
            );
        } catch (Exception e) {
            log.error("Error en forgot password", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse("Error: " + e.getMessage()));
        }
    }
    
    // 🔑 RESETEAR CONTRASEÑA CON CÓDIGO
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Solicitud de reset de contraseña con código: {}", request.getToken());
        
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(
                new ApiResponse("Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.")
            );
        } catch (Exception e) {
            log.error("Error reseteando contraseña", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse("Error: " + e.getMessage()));
        }
    }
    
    // 🚪 LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(HttpServletRequest request) {
        log.info("🚪 [LOGOUT] Solicitud de logout recibida");
        String token = extractTokenFromRequest(request);
        log.info("🚪 [LOGOUT] Token extraído: {}", token != null ? token.substring(0, 20) + "..." : "null");
        
        if (token != null) {
            authService.logout(token);
            log.info("✅ [LOGOUT] Logout procesado exitosamente");
        } else {
            log.warn("⚠️ [LOGOUT] No se encontró token en la petición");
        }
        
        return ResponseEntity.ok(new ApiResponse("Sesión cerrada exitosamente"));
    }
    
    // 🔍 VERIFICAR TOKEN
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse> verifyToken() {
        return ResponseEntity.ok(new ApiResponse("Token válido"));
    }
    
    // 🔑 CAMBIAR CONTRASEÑA
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request, HttpServletRequest httpRequest) {
        log.info("Solicitud de cambio de contraseña");
        log.info("Request data - currentPassword: {}, newPassword: {}, confirmPassword: {}", 
                request.getCurrentPassword() != null ? "[PROVIDED]" : "[NULL]",
                request.getNewPassword() != null ? "[PROVIDED]" : "[NULL]",
                request.getConfirmPassword() != null ? "[PROVIDED]" : "[NULL]");
        
        try {
            String token = extractTokenFromRequest(httpRequest);
            if (token == null) {
                log.error("Token de autorización no encontrado en la petición");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse("Token de autorización requerido"));
            }
            
            log.info("Token extraído correctamente: {}", token.substring(0, 10) + "...");
            authService.changePassword(token, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(
                new ApiResponse("Contraseña cambiada exitosamente")
            );
        } catch (AuthException e) {
            log.error("Error cambiando contraseña: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado cambiando contraseña", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse("Error interno del servidor"));
        }
    }
    
    // 📊 OBTENER ESTADO 2FA
    @GetMapping("/user/{userId}/2fa-status")
    public ResponseEntity<Map<String, Object>> get2FAStatus(@PathVariable int userId) {
        try {
            User usuario = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("enabled", usuario.getRequire2fa());
            response.put("message", "Estado 2FA obtenido correctamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("enabled", false);
            response.put("message", "Error obteniendo estado 2FA");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}