package com.example.demo.auth.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.auth.service.TwoFactorService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class TwoFactorController {

    @Autowired
    private TwoFactorService twoFactorService;

    /**
     * Enviar código de verificación por correo
     * POST /api/auth/send-verification-code
     */
    @PostMapping("/send-verification-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            System.out.println("📧 [2FA] Enviando código de verificación a: " + email);
            
            // Generar código de 6 dígitos
            String code = twoFactorService.generateVerificationCode();
            
            // Enviar por correo (simulado)
            boolean emailSent = twoFactorService.sendVerificationEmail(email, code);
            
            if (emailSent) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Código de verificación enviado a " + email);
                response.put("code", code); // Para desarrollo
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Error enviando código de verificación");
                
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.out.println("❌ [2FA] Error enviando código: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error enviando código de verificación: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Verificar código de verificación
     * POST /api/auth/verify-code
     */
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            
            System.out.println("🔍 [2FA] Verificando código para: " + email);
            System.out.println("🔍 [2FA] Código recibido: " + code);
            
            // Verificar código
            boolean isValid = twoFactorService.verifyCode(email, code);
            
            if (isValid) {
                // Generar token de autenticación
                String token = twoFactorService.generateAuthToken(email);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Código verificado correctamente");
                response.put("token", token);
                
                System.out.println("✅ [2FA] Código verificado exitosamente para: " + email);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Código de verificación incorrecto");
                
                System.out.println("❌ [2FA] Código incorrecto para: " + email);
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.out.println("❌ [2FA] Error verificando código: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error verificando código: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
}
