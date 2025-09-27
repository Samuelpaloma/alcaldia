package com.example.demo.auth.controller;

import com.example.demo.auth.dto.request.*;
import com.example.demo.auth.dto.response.ApiResponse;
import com.example.demo.usuario.dto.request.ChangePasswordRequest;
import com.example.demo.auth.dto.response.LoginResponse;
import com.example.demo.auth.model.PendingUser;
import com.example.demo.auth.repository.PendingUserRepository;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.example.demo.auth.service.AuthService;
import com.example.demo.auth.service.EmailService;
import com.example.demo.auth.service.PasswordResetService;
import com.example.demo.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final EmailService emailService;
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
     * Verificar email con código - Completa el registro
     */
    @PostMapping("/verify-email")
    public ResponseEntity<LoginResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        log.info("Verificación de email para: {}", request.getEmail());
        
        try {
            LoginResponse response = authService.verifyEmailAndCompleteRegistration(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error verificando email: {}", e.getMessage());
            throw e; // Re-lanzar para que el frontend maneje el error
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
    
    // ========== LOGIN ==========
    
    /**
     * Login directo - DESHABILITADO (usar validate-credentials + request-login-code + verify-login-code)
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Intento de login directo para email: {} - REDIRIGIENDO A FLUJO DE VERIFICACIÓN", request.getEmail());
        
        return ResponseEntity.badRequest().body(new ApiResponse(
            "El login directo no está disponible. Usa el flujo de verificación: validate-credentials → request-login-code → verify-login-code"
        ));
    }
    
    /**
     * Validar credenciales sin obtener token
     */
    @PostMapping("/validate-credentials")
    public ResponseEntity<ApiResponse> validateCredentials(@Valid @RequestBody LoginRequest request) {
        log.info("Validación de credenciales para email: {}", request.getEmail());
        
        try {
            authService.validateCredentials(request);
            return ResponseEntity.ok(new ApiResponse("Credenciales correctas"));
        } catch (Exception e) {
            log.error("Error validando credenciales: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
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
    public ResponseEntity<LoginResponse> verifyLoginCode(@Valid @RequestBody VerifyEmailRequest request) {
        log.info("Verificación de código de login para: {}", request.getEmail());
        
        try {
            LoginResponse response = authService.verifyLoginCode(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error verificando código de login: {}", e.getMessage());
            throw e; // Re-lanzar para que el frontend maneje el error
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
    
    // ========== MÉTODOS AUXILIARES ==========
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}