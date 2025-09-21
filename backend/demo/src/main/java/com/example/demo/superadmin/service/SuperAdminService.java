package com.example.demo.superadmin.service;

import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SuperAdminService {
    
    private final UsuarioRepository usuarioRepository;
    
    /**
     * Verifica si existe al menos un SUPERADMIN activo
     */
    public boolean existeSuperAdminActivo() {
        return usuarioRepository.existsByTipoUsuario(com.example.demo.usuario.model.TipoUsuario.SUPERADMIN);
    }
    
    /**
     * Obtiene el SUPERADMIN por defecto
     */
    public Optional<Usuario> obtenerSuperAdminPorDefecto() {
        return usuarioRepository.findByEmail("superadmin@sena.edu.co");
    }
    
    /**
     * Verifica si un usuario es el SUPERADMIN por defecto
     */
    public boolean esSuperAdminPorDefecto(Usuario usuario) {
        return usuario.isSuperAdmin() && 
               "superadmin@sena.edu.co".equals(usuario.getEmail());
    }
    
    /**
     * Obtiene todos los SUPERADMINs
     */
    public List<Usuario> obtenerTodosLosSuperAdmins() {
        return usuarioRepository.findByTipoUsuario(com.example.demo.usuario.model.TipoUsuario.SUPERADMIN);
    }
    
    /**
     * Obtiene estadísticas del sistema
     */
    public EstadisticasSistemaDTO obtenerEstadisticasSistema() {
        long totalUsuarios = usuarioRepository.count();
        long totalSuperAdmins = usuarioRepository.countByTipoUsuario(com.example.demo.usuario.model.TipoUsuario.SUPERADMIN);
        long totalAdmins = usuarioRepository.countByTipoUsuario(com.example.demo.usuario.model.TipoUsuario.ADMINISTRADOR);
        long totalTecnicos = usuarioRepository.countByTipoUsuario(com.example.demo.usuario.model.TipoUsuario.TECNICO);
        long totalFuncionarios = usuarioRepository.countByTipoUsuario(com.example.demo.usuario.model.TipoUsuario.FUNCIONARIO);
        
        return new EstadisticasSistemaDTO(
            totalUsuarios,
            totalSuperAdmins,
            totalAdmins,
            totalTecnicos,
            totalFuncionarios
        );
    }
    
    /**
     * DTO para estadísticas del sistema
     */
    public static class EstadisticasSistemaDTO {
        public final long totalUsuarios;
        public final long totalSuperAdmins;
        public final long totalAdmins;
        public final long totalTecnicos;
        public final long totalFuncionarios;
        
        public EstadisticasSistemaDTO(long totalUsuarios, long totalSuperAdmins, long totalAdmins, 
                                    long totalTecnicos, long totalFuncionarios) {
            this.totalUsuarios = totalUsuarios;
            this.totalSuperAdmins = totalSuperAdmins;
            this.totalAdmins = totalAdmins;
            this.totalTecnicos = totalTecnicos;
            this.totalFuncionarios = totalFuncionarios;
        }
    }
}
