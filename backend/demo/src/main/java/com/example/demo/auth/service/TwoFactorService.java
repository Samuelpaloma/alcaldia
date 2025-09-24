package com.example.demo.auth.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class TwoFactorService {

    // Almacenar códigos temporalmente (en producción usar Redis)
    private final Map<String, CodeInfo> verificationCodes = new ConcurrentHashMap<>();
    
    // Clase para almacenar información del código
    private static class CodeInfo {
        private final String code;
        private final LocalDateTime createdAt;
        private final int attempts;
        
        public CodeInfo(String code) {
            this.code = code;
            this.createdAt = LocalDateTime.now();
            this.attempts = 0;
        }
        
        public String getCode() { return code; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public int getAttempts() { return attempts; }
        public boolean isExpired() {
            return ChronoUnit.MINUTES.between(createdAt, LocalDateTime.now()) > 5; // 5 minutos
        }
    }

    /**
     * Generar código de verificación de 6 dígitos
     */
    public String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 100000-999999
        return String.valueOf(code);
    }

    /**
     * Enviar código de verificación por correo (simulado)
     */
    public boolean sendVerificationEmail(String email, String code) {
        try {
            System.out.println("📧 [2FA_SERVICE] Enviando código por correo:");
            System.out.println("  - Email: " + email);
            System.out.println("  - Código: " + code);
            System.out.println("  - Fecha: " + LocalDateTime.now());
            
            // Almacenar código temporalmente
            verificationCodes.put(email, new CodeInfo(code));
            
            // Simular envío de correo
            System.out.println("✅ [2FA_SERVICE] Código enviado exitosamente");
            return true;
            
        } catch (Exception e) {
            System.out.println("❌ [2FA_SERVICE] Error enviando correo: " + e.getMessage());
            return false;
        }
    }

    /**
     * Verificar código de verificación
     */
    public boolean verifyCode(String email, String inputCode) {
        try {
            System.out.println("🔍 [2FA_SERVICE] Verificando código:");
            System.out.println("  - Email: " + email);
            System.out.println("  - Código ingresado: " + inputCode);
            
            CodeInfo codeInfo = verificationCodes.get(email);
            
            if (codeInfo == null) {
                System.out.println("❌ [2FA_SERVICE] No hay código para este email");
                return false;
            }
            
            if (codeInfo.isExpired()) {
                System.out.println("❌ [2FA_SERVICE] Código expirado");
                verificationCodes.remove(email);
                return false;
            }
            
            if (codeInfo.getAttempts() >= 3) {
                System.out.println("❌ [2FA_SERVICE] Demasiados intentos fallidos");
                verificationCodes.remove(email);
                return false;
            }
            
            boolean isValid = codeInfo.getCode().equals(inputCode);
            
            if (isValid) {
                System.out.println("✅ [2FA_SERVICE] Código verificado correctamente");
                verificationCodes.remove(email);
                return true;
            } else {
                System.out.println("❌ [2FA_SERVICE] Código incorrecto");
                return false;
            }
            
        } catch (Exception e) {
            System.out.println("❌ [2FA_SERVICE] Error verificando código: " + e.getMessage());
            return false;
        }
    }

    /**
     * Generar token de autenticación después de verificar 2FA
     */
    public String generateAuthToken(String email) {
        try {
            System.out.println("🔑 [2FA_SERVICE] Generando token de autenticación para: " + email);
            
            // Simular generación de token JWT
            String token = "jwt_token_" + System.currentTimeMillis() + "_" + email.hashCode();
            
            System.out.println("✅ [2FA_SERVICE] Token generado: " + token.substring(0, 20) + "...");
            return token;
            
        } catch (Exception e) {
            System.out.println("❌ [2FA_SERVICE] Error generando token: " + e.getMessage());
            return null;
        }
    }

    /**
     * Verificar si un usuario tiene 2FA habilitado
     */
    public boolean isTwoFactorEnabled(String email) {
        // En producción, consultar base de datos
        // Por ahora, simular que algunos usuarios tienen 2FA habilitado
        return email.contains("tecnico") || email.contains("admin");
    }
}
