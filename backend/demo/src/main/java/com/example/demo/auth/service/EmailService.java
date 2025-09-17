package com.example.demo.auth.service;

import com.example.demo.usuario.model.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.mail.from:noreply@empresa.com}")
    private String fromEmail;
    
    @Value("${app.name:Sistema de Tickets}")
    private String appName;
    
    @Value("${app.url:http://localhost:3000}")
    private String appUrl;
    
    // ========== MÉTODOS DE BIENVENIDA ==========
    
    /**
     * Envía email de bienvenida a funcionarios registrados
     */
    public void sendWelcomeEmail(Usuario usuario) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(usuario.getEmail());
            message.setSubject("¡Bienvenido a " + appName + "!");
            
            String content = String.format(
                "Hola %s,\n\n" +
                "¡Bienvenido a %s!\n\n" +
                "Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión con:\n" +
                "Email: %s\n\n" +
                "Puedes acceder al sistema en: %s\n\n" +
                "Si tienes alguna pregunta, no dudes en contactarnos.\n\n" +
                "Saludos,\n" +
                "Equipo de %s",
                usuario.getNombre(),
                appName,
                usuario.getEmail(),
                appUrl,
                appName
            );
            
            message.setText(content);
            mailSender.send(message);
            
            log.info("Email de bienvenida enviado a: {}", usuario.getEmail());
        } catch (Exception e) {
            log.error("Error enviando email de bienvenida", e);
            throw e;
        }
    }
    
    /**
     * Envía email de bienvenida a un técnico creado por un admin
     */
    public void sendWelcomeEmailToTechnician(Usuario tecnico, String temporalPassword) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(tecnico.getEmail());
            message.setSubject("Bienvenido como Técnico - " + appName);
            
            String content = String.format(
                "Hola %s,\n\n" +
                "¡Bienvenido a %s como Técnico de Soporte!\n\n" +
                "Tu cuenta ha sido creada por un administrador. Aquí están tus credenciales de acceso:\n\n" +
                "Email: %s\n" +
                "Contraseña temporal: %s\n\n" +
                "IMPORTANTE: Por seguridad, te recomendamos cambiar tu contraseña temporal en tu primer acceso.\n\n" +
                "Puedes acceder al sistema en: %s\n\n" +
                "Como técnico, podrás:\n" +
                "• Ver tickets asignados a ti\n" +
                "• Actualizar el estado de tickets\n" +
                "• Subir evidencias del trabajo realizado\n" +
                "• Ver tu historial de tickets atendidos\n\n" +
                "Si tienes alguna pregunta sobre el sistema, contacta a tu administrador.\n\n" +
                "¡Bienvenido al equipo!\n\n" +
                "Saludos,\n" +
                "Equipo de %s",
                tecnico.getNombre(),
                appName,
                tecnico.getEmail(),
                temporalPassword,
                appUrl,
                appName
            );
            
            message.setText(content);
            mailSender.send(message);
            
            log.info("Email de bienvenida para técnico enviado a: {}", tecnico.getEmail());
        } catch (Exception e) {
            log.error("Error enviando email de bienvenida a técnico: {}", tecnico.getEmail(), e);
            throw e;
        }
    }
    
    /**
     * Envía email de bienvenida a un admin creado por un superadmin
     */
    public void sendWelcomeEmailToAdmin(Usuario admin, String temporalPassword) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(admin.getEmail());
            message.setSubject("Bienvenido como Administrador - " + appName);
            
            String content = String.format(
                "Hola %s,\n\n" +
                "¡Bienvenido a %s como Administrador del Sistema!\n\n" +
                "Tu cuenta ha sido creada por un super administrador. Aquí están tus credenciales de acceso:\n\n" +
                "Email: %s\n" +
                "Contraseña temporal: %s\n\n" +
                "IMPORTANTE: Por seguridad, te recomendamos cambiar tu contraseña temporal en tu primer acceso.\n\n" +
                "Puedes acceder al sistema en: %s\n\n" +
                "Como administrador, tendrás acceso a:\n" +
                "• Dashboard con métricas completas\n" +
                "• Gestión de todos los tickets del sistema\n" +
                "• Creación y gestión de técnicos\n" +
                "• Asignación manual de tickets\n" +
                "• Reportes y estadísticas\n" +
                "• Configuración de categorías y prioridades\n\n" +
                "Si tienes alguna pregunta sobre el sistema, contacta al super administrador.\n\n" +
                "¡Bienvenido al equipo de administración!\n\n" +
                "Saludos,\n" +
                "Equipo de %s",
                admin.getNombre(),
                appName,
                admin.getEmail(),
                temporalPassword,
                appUrl,
                appName
            );
            
            message.setText(content);
            mailSender.send(message);
            
            log.info("Email de bienvenida para admin enviado a: {}", admin.getEmail());
        } catch (Exception e) {
            log.error("Error enviando email de bienvenida a admin: {}", admin.getEmail(), e);
            throw e;
        }
    }
    
    // ========== MÉTODOS DE VERIFICACIÓN ==========
    
    /**
     * Envía código de verificación de email durante el registro
     */
    public void sendEmailVerificationCode(Usuario usuario, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(usuario.getEmail());
            message.setSubject("Verifica tu email - " + appName);
            
            String content = String.format(
                "Hola %s,\n\n" +
                "¡Gracias por registrarte en %s!\n\n" +
                "Para completar tu registro, necesitas verificar tu dirección de email.\n\n" +
                "Tu código de verificación es: %s\n\n" +
                "Este código es válido por 15 minutos.\n\n" +
                "Si no solicitaste este registro, puedes ignorar este email.\n\n" +
                "Una vez verificado tu email, podrás acceder al sistema en: %s\n\n" +
                "Saludos,\n" +
                "Equipo de %s",
                usuario.getNombre(),
                appName,
                code,
                appUrl,
                appName
            );
            
            message.setText(content);
            mailSender.send(message);
            
            log.info("Código de verificación de email enviado a: {}", usuario.getEmail());
        } catch (Exception e) {
            log.error("Error enviando código de verificación de email", e);
            throw e;
        }
    }
    
    // ========== MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA ==========
    
    /**
     * Envía código de recuperación de contraseña
     */
    public void sendPasswordResetEmail(Usuario usuario, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(usuario.getEmail());
            message.setSubject("Código de recuperación de contraseña - " + appName);
            
            String content = String.format(
                "Hola %s,\n\n" +
                "Has solicitado recuperar tu contraseña en %s.\n\n" +
                "Tu código de recuperación es: %s\n\n" +
                "Este código es válido por 15 minutos.\n\n" +
                "Si no solicitaste este cambio, puedes ignorar este email.\n\n" +
                "Saludos,\n" +
                "Equipo de %s",
                usuario.getNombre(),
                appName,
                token,
                appName
            );
            
            message.setText(content);
            mailSender.send(message);
            
            log.info("Email de recuperación enviado a: {}", usuario.getEmail());
        } catch (Exception e) {
            log.error("Error enviando email de recuperación", e);
            throw e;
        }
    }
    
    /**
     * Envía confirmación de cambio de contraseña
     */
    public void sendPasswordChangedConfirmation(Usuario usuario) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(usuario.getEmail());
            message.setSubject("Contraseña actualizada - " + appName);
            
            String content = String.format(
                "Hola %s,\n\n" +
                "Tu contraseña ha sido actualizada exitosamente en %s.\n\n" +
                "Si no realizaste este cambio, contacta inmediatamente al administrador.\n\n" +
                "Saludos,\n" +
                "Equipo de %s",
                usuario.getNombre(),
                appName,
                appName
            );
            
            message.setText(content);
            mailSender.send(message);
            
            log.info("Confirmación de cambio de contraseña enviada a: {}", usuario.getEmail());
        } catch (Exception e) {
            log.error("Error enviando confirmación de cambio de contraseña", e);
            throw e;
        }
    }
    
    // ========== MÉTODOS DE NOTIFICACIÓN ==========
    
    /**
     * Notifica cuando un usuario es desactivado
     */
    public void notifyAccountDeactivation(Usuario usuario) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(usuario.getEmail());
            message.setSubject("Cuenta desactivada - " + appName);
            
            String content = String.format(
                "Hola %s,\n\n" +
                "Te informamos que tu cuenta en %s ha sido desactivada por un administrador.\n\n" +
                "Si crees que esto es un error o necesitas reactivar tu cuenta, " +
                "por favor contacta al administrador del sistema.\n\n" +
                "Saludos,\n" +
                "Equipo de %s",
                usuario.getNombre(),
                appName,
                appName
            );
            
            message.setText(content);
            mailSender.send(message);
            
            log.info("Notificación de desactivación enviada a: {}", usuario.getEmail());
        } catch (Exception e) {
            log.error("Error enviando notificación de desactivación", e);
            // No fallar el proceso por error de email
        }
    }
    
    /**
     * Notifica cuando un usuario es reactivado
     */
    public void notifyAccountReactivation(Usuario usuario) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(usuario.getEmail());
            message.setSubject("Cuenta reactivada - " + appName);
            
            String content = String.format(
                "Hola %s,\n\n" +
                "¡Buenas noticias! Tu cuenta en %s ha sido reactivada.\n\n" +
                "Ya puedes acceder nuevamente al sistema con tus credenciales habituales.\n\n" +
                "Accede en: %s\n\n" +
                "Si tienes alguna pregunta, no dudes en contactarnos.\n\n" +
                "Saludos,\n" +
                "Equipo de %s",
                usuario.getNombre(),
                appName,
                appUrl,
                appName
            );
            
            message.setText(content);
            mailSender.send(message);
            
            log.info("Notificación de reactivación enviada a: {}", usuario.getEmail());
        } catch (Exception e) {
            log.error("Error enviando notificación de reactivación", e);
            // No fallar el proceso por error de email
        }
    }
}