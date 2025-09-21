package com.example.demo.superadmin.service;

import com.example.demo.usuario.dto.request.CreateAdminRequest;
import com.example.demo.usuario.dto.response.UsuarioDTO;
import com.example.demo.usuario.service.UsuarioService;
import com.example.demo.superadmin.dto.response.EstadisticasAdministradoresResponseDTO;
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
        
        return EstadisticasAdministradoresResponseDTO.builder()
            .totalAdministradores(totalAdmins)
            .administradoresActivos(adminsActivos)
            .administradoresInactivos(adminsInactivos)
            .build();
    }
}