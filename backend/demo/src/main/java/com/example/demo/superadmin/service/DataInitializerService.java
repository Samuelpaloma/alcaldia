package com.example.demo.superadmin.service;

import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.example.demo.notificacion.model.PreferenciasNotificacion;
import com.example.demo.notificacion.repository.PreferenciasNotificacionRepository;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializerService implements CommandLineRunner {
    
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final PreferenciasNotificacionRepository preferenciasNotificacionRepository;
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("🚀 Inicializando datos del sistema...");
        
        // 1. Crear superadmin por defecto si no existe
        crearSuperAdminPorDefecto();
        
        // 2. Crear técnico de prueba si no existe
        crearTecnicoDePrueba();
        
        log.info("✅ Inicialización de datos completada");
    }
    
    /**
     * Crea el superadmin por defecto si no existe
     */
    private void crearSuperAdminPorDefecto() {
        String emailSuperAdmin = "samupaloma30@gmail.com";
        
        // Verificar si ya existe
        if (usuarioRepository.findByEmail(emailSuperAdmin).isPresent()) {
            log.info("✅ SuperAdmin por defecto ya existe: {}", emailSuperAdmin);
            return;
        }
        
        // Crear superadmin por defecto
        Usuario superAdmin = Usuario.builder()
            .email(emailSuperAdmin)
            .password(passwordEncoder.encode("SuperAdmin123")) // Contraseña por defecto
            .firstName("Super")
            .lastName("Administrador")
            .userType(TipoUsuario.SUPERADMIN)
            .active(true)
            .emailVerified(true) // Ya verificado por defecto
            .temporaryPassword(false) // No es temporal
            .require2fa(false)
            .build();
        
        Usuario savedSuperAdmin = usuarioRepository.save(superAdmin);
        
        log.info("🎉 SuperAdmin por defecto creado exitosamente:");
        log.info("   📧 Email: {}", savedSuperAdmin.getEmail());
        log.info("   🔑 Contraseña: SuperAdmin123");
        log.info("   ⚠️  IMPORTANTE: Cambia la contraseña en el primer acceso");
    }
    
    /**
     * Crea un técnico de prueba si no existe
     */
    private void crearTecnicoDePrueba() {
        String emailTecnico = "tecnico@alcaldianevila.gov.co";
        
        // Verificar si ya existe
        if (usuarioRepository.findByEmail(emailTecnico).isPresent()) {
            log.info("✅ Técnico de prueba ya existe: {}", emailTecnico);
            // Crear preferencias de notificación si no existen
            Usuario tecnicoExistente = usuarioRepository.findByEmail(emailTecnico).get();
            crearPreferenciasNotificacion(tecnicoExistente.getId());
            return;
        }
        
        // Crear técnico de prueba
        Usuario tecnico = Usuario.builder()
            .email(emailTecnico)
            .password(passwordEncoder.encode("Julio066")) // Contraseña que mencionaste
            .firstName("Técnico")
            .lastName("Prueba")
            .userType(TipoUsuario.TECNICO)
            .active(true)
            .emailVerified(true) // Ya verificado por defecto
            .temporaryPassword(false) // No es temporal
            .require2fa(false)
            .deviceToken("test-device-token-12345") // Token de prueba para notificaciones
            .build();
        
        Usuario savedTecnico = usuarioRepository.save(tecnico);
        
        log.info("🎉 Técnico de prueba creado exitosamente:");
        log.info("   📧 Email: {}", savedTecnico.getEmail());
        log.info("   🔑 Contraseña: Julio066");
        log.info("   👤 Tipo: TÉCNICO");
        
        // Crear preferencias de notificación para el técnico
        crearPreferenciasNotificacion(savedTecnico.getId());
    }
    
    private void crearPreferenciasNotificacion(Long usuarioId) {
        try {
            // Verificar si ya existen preferencias
            if (preferenciasNotificacionRepository.findByUsuarioId(usuarioId).isPresent()) {
                log.info("✅ Preferencias de notificación ya existen para usuario {}", usuarioId);
                return;
            }
            
            // Crear preferencias por defecto
            PreferenciasNotificacion preferencias = new PreferenciasNotificacion();
            preferencias.setUsuarioId(usuarioId);
            preferencias.setPushActivo(true);  // Push activo por defecto
            preferencias.setEmailActivo(true); // Email activo por defecto
            preferencias.setNotificacionesTicketAsignado(true);
            preferencias.setNotificacionesTicketEnProceso(true);
            preferencias.setNotificacionesTicketResuelto(true);
            preferencias.setNotificacionesComentarios(true);
            preferencias.setNotificacionesEvidencias(true);
            preferencias.setNotificacionesSla(true);
            preferencias.setNotificacionesSistema(true);
            preferencias.setFrecuenciaEmail("INMEDIATA");
            preferencias.setFechaCreacion(LocalDateTime.now());
            preferencias.setFechaActualizacion(LocalDateTime.now());
            
            preferenciasNotificacionRepository.save(preferencias);
            
            log.info("🎉 Preferencias de notificación creadas para usuario {}:", usuarioId);
            log.info("   📱 Push activo: {}", preferencias.getPushActivo());
            log.info("   📧 Email activo: {}", preferencias.getEmailActivo());
            
        } catch (Exception e) {
            log.error("Error creando preferencias de notificación para usuario {}", usuarioId, e);
        }
    }
}
