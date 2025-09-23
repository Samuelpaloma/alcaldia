package com.example.demo.auth.service;

import com.example.demo.auth.exception.InvalidTokenException;
import com.example.demo.auth.model.PasswordResetToken;
import com.example.demo.auth.repository.PasswordResetTokenRepository;
import com.example.demo.auth.exception.AuthException;
import com.example.demo.usuario.model.User;
import com.example.demo.usuario.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {
    
    private final UserRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    
    @Override
    public void sendResetToken(String email) {
        log.info("Solicitud de recuperación de contraseña para: {}", email);
        
        // 1. Buscar usuario por email
        User usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new AuthException("Usuario no encontrado"));
        
        // 2. Verificar que esté activo
        if (!usuario.getActivo()) {
            throw new InvalidTokenException("Usuario desactivado. Contacte al administrador");
        }
        
        // 3. Invalidar tokens anteriores del usuario
        tokenRepository.invalidateAllTokensByUsuario(usuario);
        
        // 4. Generar nuevo token de 6 dígitos
        String token = generateSixDigitCode();
        
        // 5. Crear registro del token (válido por 15 minutos)
        PasswordResetToken resetToken = PasswordResetToken.builder()
            .token(token)
            .usuario(usuario)
            .fechaExpiracion(LocalDateTime.now().plusMinutes(15))
            .usado(false)
            .build();
        
        tokenRepository.save(resetToken);
        
        // 6. Enviar email con el código
        try {
            emailService.sendPasswordResetEmail(usuario, token);
            log.info("Código de recuperación enviado a: {}", email);
        } catch (Exception e) {
            log.error("Error enviando email de recuperación a: {}", email, e);
            throw new RuntimeException("Error enviando el email. Intente nuevamente");
        }
    }
    
    @Override
    public void resetPassword(String token, String newPassword) {
        log.info("Intento de reset de contraseña con token: {}", token);
        
        // 1. Buscar token válido
        PasswordResetToken resetToken = tokenRepository
            .findByTokenAndUsadoFalseAndFechaExpiracionAfter(token, LocalDateTime.now())
            .orElseThrow(() -> new InvalidTokenException("Código inválido o expirado"));
        
        // 2. Marcar token como usado
        resetToken.setUsado(true);
        tokenRepository.save(resetToken);
        
        // 3. Actualizar contraseña del usuario
        User usuario = resetToken.getUsuario();
        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);
        
        // 4. Enviar email de confirmación
        try {
            emailService.sendPasswordChangedConfirmation(usuario);
        } catch (Exception e) {
            log.error("Error enviando confirmación de cambio de contraseña", e);
            // No fallar el proceso por error de email
        }
        
        log.info("Contraseña actualizada exitosamente para usuario: {}", usuario.getEmail());
    }
    
    // Limpieza automática de tokens expirados (cada hora)
    @Scheduled(fixedRate = 3600000)
    @Override
    public void cleanupExpiredTokens() {
        try {
            tokenRepository.deleteExpiredTokens(LocalDateTime.now());
            log.debug("Tokens expirados eliminados");
        } catch (Exception e) {
            log.error("Error limpiando tokens expirados", e);
        }
    }
    
    private String generateSixDigitCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // Entre 100000 y 999999
        return String.valueOf(code);
    }
}