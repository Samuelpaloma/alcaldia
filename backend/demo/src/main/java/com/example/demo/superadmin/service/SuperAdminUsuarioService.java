package com.example.demo.superadmin.service;

import com.example.demo.usuario.dto.request.CreateAdminRequest;
import com.example.demo.usuario.dto.response.UsuarioDTO;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.example.demo.usuario.service.UsuarioService;
import com.example.demo.superadmin.dto.response.EstadisticasAdministradoresResponseDTO;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SuperAdminUsuarioService {
    
    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Crear administrador
     */
    public UsuarioDTO crearAdministrador(CreateAdminRequest request) {
        log.info("Creando administrador: {}", request.getEmail());
        // El ID del superadmin se obtendrá del contexto de seguridad
        // Por ahora usamos un ID fijo, pero en producción debería obtenerse del token
        Long superAdminId = 1L; // TODO: Obtener del contexto de seguridad
        return usuarioService.createAdmin(request, superAdminId);
    }
    
    /**
     * Obtener todos los administradores
     */
    @Transactional(readOnly = true)
    public List<UsuarioDTO> obtenerTodosLosAdministradores() {
        log.info("Obteniendo todos los administradores");
        // TODO: Implementar paginación si es necesario
        return List.of(); // Placeholder
    }
    
    /**
     * Obtener administrador por ID
     */
    @Transactional(readOnly = true)
    public UsuarioDTO obtenerAdministradorPorId(Long id) {
        log.info("Obteniendo administrador por ID: {}", id);
        return usuarioService.getUserById(id);
    }
    
    /**
     * Activar/desactivar administrador
     */
    public UsuarioDTO toggleEstadoAdministrador(Long id) {
        log.info("Cambiando estado del administrador: {}", id);
        // TODO: Obtener ID del usuario actual del contexto de seguridad
        Long currentUserId = 1L; // Placeholder
        usuarioService.toggleUserStatus(id, currentUserId);
        return usuarioService.getUserById(id);
    }
    
    /**
     * Obtener estadísticas de administradores
     */
    @Transactional(readOnly = true)
    public EstadisticasAdministradoresResponseDTO obtenerEstadisticasAdministradores() {
        log.info("Obteniendo estadísticas de administradores");
        
        long totalAdmins = usuarioService.getTotalUsersByType(com.example.demo.usuario.model.TipoUsuario.ADMINISTRADOR);
        long adminsActivos = usuarioService.getActiveUsersByType(com.example.demo.usuario.model.TipoUsuario.ADMINISTRADOR);
        long adminsInactivos = totalAdmins - adminsActivos;
        
        EstadisticasAdministradoresResponseDTO estadisticas = new EstadisticasAdministradoresResponseDTO();
        estadisticas.setTotalAdministradores(totalAdmins);
        estadisticas.setAdministradoresActivos(adminsActivos);
        estadisticas.setAdministradoresInactivos(adminsInactivos);
        return estadisticas;
    }
    
    /**
     * Cambiar contraseña de administrador
     */
    public UsuarioDTO cambiarPasswordAdministrador(Long adminId, String nuevaPassword) {
        log.info("Cambiando contraseña del administrador: {}", adminId);
        
        // 1. Buscar administrador
        Usuario admin = usuarioRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Administrador no encontrado"));
        
        // 2. Verificar que sea administrador
        if (!admin.getTipoUsuario().equals(com.example.demo.usuario.model.TipoUsuario.ADMINISTRADOR)) {
            throw new RuntimeException("El usuario no es un administrador");
        }
        
        // 3. Actualizar contraseña y verificar email
        admin.setPasswordHash(passwordEncoder.encode(nuevaPassword));
        admin.setPasswordTemporal(false); // Ya no es temporal
        admin.setEmailVerificado(true); // Verificar email automáticamente
        usuarioRepository.save(admin);
        
        log.info("Contraseña del administrador {} cambiada exitosamente", admin.getEmail());
        
        // 4. Retornar DTO actualizado
        return convertirUsuarioADTO(admin);
    }
    
    private UsuarioDTO convertirUsuarioADTO(Usuario usuario) {
        return UsuarioDTO.builder()
            .id(usuario.getIdUsuario())
            .email(usuario.getEmail())
            .nombre(usuario.getNombre())
            .apellido(usuario.getApellido())
            .nombreCompleto(usuario.getNombreCompleto())
            .telefono(usuario.getTelefono())
            .tipoUsuario(usuario.getTipoUsuario().toString())
            .activo(usuario.isActivo())
            .require2fa(usuario.getRequire2fa() != null ? usuario.getRequire2fa() : false)
            .ultimoAcceso(usuario.getUltimoAcceso())
            .fechaCreacion(usuario.getFechaCreacion())
            .build();
    }
}