package com.example.demo.superadmin.controller;

import com.example.demo.admin.dto.request.ChangeTecnicoPasswordRequest;
import com.example.demo.superadmin.dto.request.ConfiguracionRequestDTO;
import com.example.demo.superadmin.dto.response.ConfiguracionResponseDTO;
import com.example.demo.superadmin.service.ConfiguracionService;
import com.example.demo.superadmin.service.SuperAdminService;
import com.example.demo.superadmin.service.SuperAdminUsuarioService;
import com.example.demo.usuario.dto.request.CreateAdminRequest;
import com.example.demo.usuario.dto.response.UsuarioDTO;
import com.example.demo.superadmin.dto.response.EstadisticasAdministradoresResponseDTO;
import com.example.demo.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SuperAdminController {
    
    private final SuperAdminService superAdminService;
    private final ConfiguracionService configuracionService;
    private final SuperAdminUsuarioService superAdminUsuarioService;
    
    /**
     * Obtener estadísticas del sistema
     * GET /api/superadmin/estadisticas
     */
    @GetMapping("/estadisticas")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> obtenerEstadisticasSistema() {
        try {
            log.info("Obteniendo estadísticas del sistema");
            SuperAdminService.EstadisticasSistemaDTO estadisticas = superAdminService.obtenerEstadisticasSistema();
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas del sistema", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener las estadísticas: " + e.getMessage())
            );
        }
    }
    
    /**
     * Verificar si existe SUPERADMIN activo
     * GET /api/superadmin/existe-superadmin
     */
    @GetMapping("/existe-superadmin")
    public ResponseEntity<?> verificarSuperAdminActivo() {
        try {
            log.info("Verificando si existe SUPERADMIN activo");
            boolean existe = superAdminService.existeSuperAdminActivo();
            return ResponseEntity.ok(ApiResponse.success("SUPERADMIN " + (existe ? "existe" : "no existe")));
        } catch (Exception e) {
            log.error("Error verificando SUPERADMIN", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al verificar SUPERADMIN: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener información del SUPERADMIN por defecto
     * GET /api/superadmin/superadmin-por-defecto
     */
    @GetMapping("/superadmin-por-defecto")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> obtenerSuperAdminPorDefecto() {
        try {
            log.info("Obteniendo información del SUPERADMIN por defecto");
            var superAdmin = superAdminService.obtenerSuperAdminPorDefecto();
            
            if (superAdmin.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success("SUPERADMIN por defecto encontrado"));
            } else {
                return ResponseEntity.ok(ApiResponse.error("SUPERADMIN por defecto no encontrado"));
            }
        } catch (Exception e) {
            log.error("Error obteniendo SUPERADMIN por defecto", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener SUPERADMIN por defecto: " + e.getMessage())
            );
        }
    }
    
    // ========== ENDPOINTS DE CONFIGURACIÓN ==========
    
    /**
     * Obtener todas las configuraciones del sistema
     * GET /api/superadmin/configuraciones
     */
    @GetMapping("/configuraciones")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> obtenerConfiguraciones() {
        try {
            log.info("Obteniendo configuraciones del sistema");
            Map<String, Map<String, String>> configuraciones = configuracionService.obtenerConfiguracionesAgrupadas();
            return ResponseEntity.ok(configuraciones);
        } catch (Exception e) {
            log.error("Error obteniendo configuraciones", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener configuraciones: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener configuraciones por categoría
     * GET /api/superadmin/configuraciones/{categoria}
     */
    @GetMapping("/configuraciones/{categoria}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> obtenerConfiguracionesPorCategoria(@PathVariable String categoria) {
        try {
            log.info("Obteniendo configuraciones de categoría: {}", categoria);
            List<ConfiguracionResponseDTO> configuraciones = configuracionService.obtenerConfiguracionesPorCategoria(categoria);
            return ResponseEntity.ok(configuraciones);
        } catch (Exception e) {
            log.error("Error obteniendo configuraciones de categoría: {}", categoria, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener configuraciones: " + e.getMessage())
            );
        }
    }
    
    /**
     * Actualizar colores del sistema
     * PUT /api/superadmin/configuraciones/colores
     */
    @PutMapping("/configuraciones/colores")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> actualizarColores(@RequestBody ConfiguracionRequestDTO request) {
        try {
            log.info("Actualizando colores del sistema");
            configuracionService.actualizarColores(
                request.getColorPrimario(),
                request.getColorSecundario(),
                request.getColorFondo()
            );
            return ResponseEntity.ok(ApiResponse.success("Colores actualizados exitosamente"));
        } catch (Exception e) {
            log.error("Error actualizando colores", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al actualizar colores: " + e.getMessage())
            );
        }
    }
    
    /**
     * Actualizar logo del sistema
     * PUT /api/superadmin/configuraciones/logo
     */
    @PutMapping("/configuraciones/logo")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> actualizarLogo(@RequestBody ConfiguracionRequestDTO request) {
        try {
            log.info("Actualizando logo del sistema");
            configuracionService.actualizarLogo(
                request.getLogoUrl(),
                request.getNombreApp()
            );
            return ResponseEntity.ok(ApiResponse.success("Logo actualizado exitosamente"));
        } catch (Exception e) {
            log.error("Error actualizando logo", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al actualizar logo: " + e.getMessage())
            );
        }
    }
    
    /**
     * Crear o actualizar configuración específica
     * POST /api/superadmin/configuraciones
     */
    @PostMapping("/configuraciones")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> crearOActualizarConfiguracion(@RequestBody ConfiguracionRequestDTO request) {
        try {
            log.info("Creando/actualizando configuración: {}", request.getClave());
            ConfiguracionResponseDTO configuracion = configuracionService.crearOActualizarConfiguracion(request);
            return ResponseEntity.ok(configuracion);
        } catch (Exception e) {
            log.error("Error creando/actualizando configuración", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al crear/actualizar configuración: " + e.getMessage())
            );
        }
    }
    
    /**
     * Eliminar configuración
     * DELETE /api/superadmin/configuraciones/{clave}
     */
    @DeleteMapping("/configuraciones/{clave}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> eliminarConfiguracion(@PathVariable String clave) {
        try {
            log.info("Eliminando configuración: {}", clave);
            configuracionService.eliminarConfiguracion(clave);
            return ResponseEntity.ok(ApiResponse.success("Configuración eliminada exitosamente"));
        } catch (Exception e) {
            log.error("Error eliminando configuración: {}", clave, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al eliminar configuración: " + e.getMessage())
            );
        }
    }
    
    // ========== GESTIÓN DE ADMINISTRADORES ==========
    
    /**
     * Crear administrador
     * POST /api/superadmin/administradores
     */
    @PostMapping("/administradores")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> crearAdministrador(@Valid @RequestBody CreateAdminRequest request) {
        try {
            log.info("Creando administrador: {}", request.getEmail());
            UsuarioDTO administrador = superAdminUsuarioService.crearAdministrador(request);
            return ResponseEntity.ok(administrador);
        } catch (Exception e) {
            log.error("Error creando administrador", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al crear administrador: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener todos los administradores
     * GET /api/superadmin/administradores
     */
    @GetMapping("/administradores")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> obtenerTodosLosAdministradores() {
        try {
            log.info("Obteniendo todos los administradores");
            List<UsuarioDTO> administradores = superAdminUsuarioService.obtenerTodosLosAdministradores();
            return ResponseEntity.ok(administradores);
        } catch (Exception e) {
            log.error("Error obteniendo administradores", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener administradores: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener administrador por ID
     * GET /api/superadmin/administradores/{id}
     */
    @GetMapping("/administradores/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> obtenerAdministradorPorId(@PathVariable Long id) {
        try {
            log.info("Obteniendo administrador por ID: {}", id);
            UsuarioDTO administrador = superAdminUsuarioService.obtenerAdministradorPorId(id);
            return ResponseEntity.ok(administrador);
        } catch (Exception e) {
            log.error("Error obteniendo administrador", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener administrador: " + e.getMessage())
            );
        }
    }
    
    /**
     * Activar/desactivar administrador
     * PUT /api/superadmin/administradores/{id}/toggle-estado
     */
    @PutMapping("/administradores/{id}/toggle-estado")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> toggleEstadoAdministrador(@PathVariable Long id) {
        try {
            log.info("Cambiando estado del administrador: {}", id);
            UsuarioDTO administrador = superAdminUsuarioService.toggleEstadoAdministrador(id);
            return ResponseEntity.ok(administrador);
        } catch (Exception e) {
            log.error("Error cambiando estado del administrador", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al cambiar estado del administrador: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener estadísticas de administradores
     * GET /api/superadmin/administradores/estadisticas
     */
    @GetMapping("/administradores/estadisticas")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> obtenerEstadisticasAdministradores() {
        try {
            log.info("Obteniendo estadísticas de administradores");
            EstadisticasAdministradoresResponseDTO estadisticas = superAdminUsuarioService.obtenerEstadisticasAdministradores();
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas de administradores", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener estadísticas: " + e.getMessage())
            );
        }
    }
    
    /**
     * Cambiar contraseña de administrador
     * PUT /api/superadmin/administradores/{id}/cambiar-password
     */
    @PutMapping("/administradores/{id}/cambiar-password")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> cambiarPasswordAdministrador(
            @PathVariable Long id,
            @Valid @RequestBody ChangeTecnicoPasswordRequest request) {
        try {
            log.info("Cambiando contraseña del administrador: {}", id);
            
            // Validar que las contraseñas coincidan
            if (!request.isPasswordMatching()) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Las contraseñas no coinciden")
                );
            }
            
            UsuarioDTO administrador = superAdminUsuarioService.cambiarPasswordAdministrador(id, request.getNewPassword());
            return ResponseEntity.ok(administrador);
        } catch (Exception e) {
            log.error("Error cambiando contraseña del administrador", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al cambiar contraseña: " + e.getMessage())
            );
        }
    }
}
