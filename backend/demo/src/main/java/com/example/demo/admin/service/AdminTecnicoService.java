package com.example.demo.admin.service;

import com.example.demo.usuario.dto.request.CreateTecnicoRequest;
import com.example.demo.usuario.dto.response.UsuarioDTO;
import com.example.demo.admin.dto.response.EstadisticasTecnicosResponseDTO;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.example.demo.usuario.service.UsuarioService;
import com.example.demo.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AdminTecnicoService {
    
    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Crear técnico (solo ADMIN puede hacer esto)
     */
    public UsuarioDTO crearTecnico(CreateTecnicoRequest request) {
        log.info("Creando técnico: {}", request.getEmail());
        
        // Obtener el ID del administrador autenticado
        Long adminId = getCurrentAdminId();
        
        // Crear usuario como técnico usando el servicio existente
        return usuarioService.createTechnician(request, adminId);
    }
    
    /**
     * Obtener todos los técnicos
     */
    @Transactional(readOnly = true)
    public List<UsuarioDTO> obtenerTodosLosTecnicos() {
        log.info("Obteniendo todos los técnicos");
        
        List<Usuario> tecnicos = usuarioRepository.findByTipoUsuario(TipoUsuario.TECNICO);
        
        return tecnicos.stream()
            .map(this::convertirUsuarioADTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtener técnico por ID
     */
    @Transactional(readOnly = true)
    public UsuarioDTO obtenerTecnicoPorId(Long id) {
        log.info("Obteniendo técnico por ID: {}", id);
        
        Usuario tecnico = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        if (!tecnico.isTecnico()) {
            throw new RuntimeException("El usuario no es un técnico");
        }
        
        return convertirUsuarioADTO(tecnico);
    }
    
    /**
     * Activar/desactivar técnico
     */
    public UsuarioDTO toggleEstadoTecnico(Long id) {
        log.info("Cambiando estado del técnico: {}", id);
        
        Usuario tecnico = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        if (!tecnico.isTecnico()) {
            throw new RuntimeException("El usuario no es un técnico");
        }
        
        // Cambiar estado
        tecnico.setActivo(!tecnico.isActivo());
        usuarioRepository.save(tecnico);
        
        log.info("Estado del técnico {} cambiado a: {}", id, tecnico.isActivo() ? "ACTIVO" : "INACTIVO");
        
        return convertirUsuarioADTO(tecnico);
    }
    
    /**
     * Obtener estadísticas de técnicos
     */
    @Transactional(readOnly = true)
    public EstadisticasTecnicosResponseDTO obtenerEstadisticasTecnicos() {
        log.info("Obteniendo estadísticas de técnicos");
        
        long totalTecnicos = usuarioRepository.countByTipoUsuario(TipoUsuario.TECNICO);
        long tecnicosActivos = usuarioRepository.findByTipoUsuario(TipoUsuario.TECNICO).stream()
            .filter(Usuario::isActivo)
            .count();
        long tecnicosInactivos = totalTecnicos - tecnicosActivos;
        
        EstadisticasTecnicosResponseDTO estadisticas = new EstadisticasTecnicosResponseDTO();
        estadisticas.setTotalTecnicos(totalTecnicos);
        estadisticas.setTecnicosActivos(tecnicosActivos);
        estadisticas.setTecnicosInactivos(tecnicosInactivos);
        return estadisticas;
    }
    
    /**
     * Cambiar contraseña de técnico
     */
    public UsuarioDTO cambiarPasswordTecnico(Long tecnicoId, String nuevaPassword) {
        log.info("Cambiando contraseña del técnico: {}", tecnicoId);
        
        // 1. Buscar técnico
        Usuario tecnico = usuarioRepository.findById(tecnicoId)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        // 2. Verificar que sea técnico
        if (!tecnico.isTecnico()) {
            throw new RuntimeException("El usuario no es un técnico");
        }
        
        // 3. Actualizar contraseña
        tecnico.setPasswordHash(passwordEncoder.encode(nuevaPassword));
        tecnico.setPasswordTemporal(false); // Ya no es temporal
        usuarioRepository.save(tecnico);
        
        log.info("Contraseña del técnico {} cambiada exitosamente", tecnico.getEmail());
        
        // 4. Retornar DTO actualizado
        return convertirUsuarioADTO(tecnico);
    }
    
    // ========== MÉTODOS AUXILIARES ==========
    
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
            .estadoTexto(usuario.isActivo() ? "Activo" : "Inactivo")
            .build();
    }
    
    /**
     * Obtener el ID del administrador autenticado
     */
    private Long getCurrentAdminId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || auth.getPrincipal() == null) {
            throw new IllegalArgumentException("Usuario no autenticado");
        }
        
        if (auth.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            return userDetails.getUserId();
        }
        
        throw new IllegalArgumentException("No se pudo obtener el ID del administrador autenticado");
    }
}
