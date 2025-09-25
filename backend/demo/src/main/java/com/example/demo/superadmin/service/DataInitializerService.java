package com.example.demo.superadmin.service;

import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
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
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("🚀 Inicializando datos del sistema...");
        
        // 1. Crear superadmin por defecto si no existe
        crearSuperAdminPorDefecto();
        
        log.info("✅ Inicialización de datos completada");
    }
    
    /**
     * Crea el superadmin por defecto si no existe
     */
    private void crearSuperAdminPorDefecto() {
        String emailSuperAdmin = "rarodrigues.300@gmail.com";
        
        // Verificar si ya existe
        if (usuarioRepository.findByEmail(emailSuperAdmin).isPresent()) {
            log.info("✅ SuperAdmin por defecto ya existe: {}", emailSuperAdmin);
            return;
        }
        
        // Crear superadmin por defecto
        Usuario superAdmin = Usuario.builder()
            .email(emailSuperAdmin)
            .passwordHash(passwordEncoder.encode("SuperAdmin123")) // Contraseña por defecto
            .nombre("Super")
            .apellido("Administrador")
            .telefono("+57 300 000 0000")
            .tipoUsuario(TipoUsuario.SUPERADMIN)
            .activo(true)
            .emailVerificado(true) // Ya verificado por defecto
            .passwordTemporal(false) // No es temporal
            .require2fa(false)
            .build();
        
        Usuario savedSuperAdmin = usuarioRepository.save(superAdmin);
        
        log.info("🎉 SuperAdmin por defecto creado exitosamente:");
        log.info("   📧 Email: {}", savedSuperAdmin.getEmail());
        log.info("   🔑 Contraseña: SuperAdmin123");
        log.info("   ⚠️  IMPORTANTE: Cambia la contraseña en el primer acceso");
    }
}