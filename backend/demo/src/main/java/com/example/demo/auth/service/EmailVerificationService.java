package com.example.demo.auth.service;

import com.example.demo.auth.model.EmailVerificationToken;
import com.example.demo.auth.repository.EmailVerificationTokenRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class EmailVerificationService {
    
    private final EmailVerificationTokenRepository tokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;
    
    /**
     * Envía código de verificación de email al usuario
     */
    public void sendVerificationCode(Usuario usuario) {
        log.info("Enviando código de verificación a: {}", usuario.getEmail());
        
        // 1. Invalidar tokens anteriores del usuario
        tokenRepository.invalidateAllTokensByUsuario(usuario);
        
        // 2. Generar nuevo código de 6 dígitos
        String code = generateSixDigitCode();
        
        // 3. Crear token de verificación (válido por 15 minutos)
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
            .token(code)
            .usuario(usuario)
            .fechaExpiracion(LocalDateTime.now().plusMinutes(15))
            .usado(false)
            .build();
        
        tokenRepository.save(verificationToken);
        
        // 4. Enviar email con el código
        try {
            emailService.sendEmailVerificationCode(usuario, code);
            log.info("Código de verificación enviado a: {}", usuario.getEmail());
        } catch (Exception e) {
            log.error("Error enviando código de verificación a: {}", usuario.getEmail(), e);
            throw new RuntimeException("Error enviando el código de verificación. Intente nuevamente");
        }
    }
    
    /**
     * Verifica el código de verificación y activa la cuenta
     */
    public void verifyEmail(String code) {
        log.info("Verificando código de email: {}", code);
        
        // 1. Buscar token válido
        EmailVerificationToken verificationToken = tokenRepository
            .findByTokenAndUsadoFalseAndFechaExpiracionAfter(code, LocalDateTime.now())
            .orElseThrow(() -> new RuntimeException("Código inválido o expirado"));
        
        // 2. Marcar token como usado
        verificationToken.setUsado(true);
        tokenRepository.save(verificationToken);
        
        // 3. Activar cuenta del usuario
        Usuario usuario = verificationToken.getUsuario();
        usuario.setEmailVerificado(true);
        usuario.setActivo(true);
        usuarioRepository.save(usuario);
        
        log.info("Email verificado exitosamente para usuario: {}", usuario.getEmail());
    }
    
    /**
     * Reenvía código de verificación
     */
    public void resendVerificationCode(String email) {
        log.info("Reenviando código de verificación a: {}", email);
        
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Solo reenviar si el email no está verificado
        if (usuario.getEmailVerificado()) {
            throw new RuntimeException("El email ya está verificado");
        }
        
        sendVerificationCode(usuario);
    }
    
    /**
     * Limpieza automática de tokens expirados (cada hora)
     */
    @Scheduled(fixedRate = 3600000)
    public void cleanupExpiredTokens() {
        try {
            tokenRepository.deleteExpiredTokens(LocalDateTime.now());
            log.debug("Tokens de verificación expirados eliminados");
        } catch (Exception e) {
            log.error("Error limpiando tokens de verificación expirados", e);
        }
    }
    
    private String generateSixDigitCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // Entre 100000 y 999999
        return String.valueOf(code);
    }
}

