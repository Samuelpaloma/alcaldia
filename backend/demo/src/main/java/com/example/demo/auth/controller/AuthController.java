package com.example.demo.auth.controller;

import com.example.demo.auth.dto.request.ForgotPasswordRequest;
import com.example.demo.auth.dto.request.LoginRequest;
import com.example.demo.auth.dto.request.RegisterRequest;
import com.example.demo.auth.dto.request.ResetPasswordRequest;
import com.example.demo.auth.dto.request.VerifyEmailRequest;
import com.example.demo.auth.dto.request.ResendVerificationRequest;
import com.example.demo.auth.dto.response.ApiResponse;
import com.example.demo.auth.dto.response.LoginResponse;
import com.example.demo.auth.service.AuthService;
import com.example.demo.auth.service.EmailService;
import com.example.demo.auth.service.PasswordResetService;
import com.example.demo.usuario.model.Usuario;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // Configurar según necesidades
public class AuthController {
    
    private final AuthService authService;
    private final PasswordResetService passwordResetService;
    private final EmailService emailService;
    
    // 🔐 LOGIN - Para todos los tipos de usuario
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Solicitud de login para email: {}", request.getEmail());
        
        LoginResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }
    
    // 👤 REGISTRO - Solo para funcionarios (público)
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Solicitud de registro para email: {}", request.getEmail());
        
        authService.registerFuncionario(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse("Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta con el código enviado."));
    }
    
    // ✅ VERIFICAR EMAIL CON CÓDIGO
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        log.info("Solicitud de verificación de email con código: {}", request.getCode());
        
        authService.verifyEmail(request);
        return ResponseEntity.ok(
            new ApiResponse("Email verificado exitosamente. Ya puedes iniciar sesión.")
        );
    }
    
    // 🔄 REENVIAR CÓDIGO DE VERIFICACIÓN
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        log.info("Solicitud de reenvío de código de verificación para: {}", request.getEmail());
        
        authService.resendVerificationCode(request);
        return ResponseEntity.ok(
            new ApiResponse("Código de verificación reenviado. Revisa tu bandeja de entrada.")
        );
    }
    
    // 🧪 ENDPOINT DE PRUEBA - ENVIAR EMAIL DE PRUEBA
    @PostMapping("/test-email")
    public ResponseEntity<ApiResponse> testEmail(@RequestParam String email) {
        log.info("Enviando email de prueba a: {}", email);
        
        try {
            // Crear un usuario temporal para la prueba
            Usuario testUser = Usuario.builder()
                .email(email)
                .nombre("Test")
                .apellido("Usuario")
                .build();
            
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
        
        passwordResetService.sendResetToken(request.getEmail());
        return ResponseEntity.ok(
            new ApiResponse("Se ha enviado un código de recuperación a tu email. Revisa tu bandeja de entrada.")
        );
    }
    
    // 🔑 RESETEAR CONTRASEÑA CON CÓDIGO
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Solicitud de reset de contraseña con código: {}", request.getToken());
        
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(
            new ApiResponse("Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.")
        );
    }
    
    // 🚪 LOGOUT
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token != null) {
            authService.logout(token);
        }
        
        return ResponseEntity.ok(new ApiResponse("Sesión cerrada exitosamente"));
    }
    
    // 🔍 VERIFICAR TOKEN (útil para frontend)
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse> verifyToken() {
        // Si llega aquí, el token es válido (verificado por Security)
        return ResponseEntity.ok(new ApiResponse("Token válido"));
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}