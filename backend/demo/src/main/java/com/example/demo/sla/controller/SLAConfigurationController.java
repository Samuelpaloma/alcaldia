package com.example.demo.sla.controller;

import com.example.demo.sla.dto.SLAConfigurationDTO;
import com.example.demo.sla.service.SLAConfigurationService;
import com.example.demo.shared.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sla")
@CrossOrigin(origins = "*")
public class SLAConfigurationController {
    
    private static final Logger log = LoggerFactory.getLogger(SLAConfigurationController.class);
    
    @Autowired
    private SLAConfigurationService slaConfigurationService;
    
    /**
     * Obtener todas las configuraciones SLA
     * GET /api/sla
     */
    @GetMapping
    public ResponseEntity<List<SLAConfigurationDTO>> obtenerTodasLasConfiguraciones() {
        try {
            log.info("Solicitando todas las configuraciones SLA");
            List<SLAConfigurationDTO> configuraciones = slaConfigurationService.obtenerTodasLasConfiguraciones();
            return ResponseEntity.ok(configuraciones);
        } catch (Exception e) {
            log.error("Error al obtener configuraciones SLA", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtener configuración SLA por ID
     * GET /api/sla/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<SLAConfigurationDTO> obtenerConfiguracionPorId(@PathVariable Long id) {
        try {
            log.info("Solicitando configuración SLA con ID: {}", id);
            Optional<SLAConfigurationDTO> configuracion = slaConfigurationService.obtenerConfiguracionPorId(id);
            
            if (configuracion.isPresent()) {
                return ResponseEntity.ok(configuracion.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error al obtener configuración SLA con ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Crear nueva configuración SLA
     * POST /api/sla
     */
    @PostMapping
    public ResponseEntity<ApiResponse> crearConfiguracion(@RequestBody SLAConfigurationDTO dto) {
        try {
            log.info("Creando nueva configuración SLA: {}", dto.getNombre());
            SLAConfigurationDTO configuracionCreada = slaConfigurationService.crearConfiguracion(dto);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Configuración SLA creada exitosamente", configuracionCreada));
        } catch (Exception e) {
            log.error("Error al crear configuración SLA", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al crear configuración SLA: " + e.getMessage()));
        }
    }
    
    /**
     * Actualizar configuración SLA
     * PATCH /api/sla/{id}
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse> actualizarConfiguracion(
            @PathVariable Long id, 
            @RequestBody SLAConfigurationDTO dto) {
        try {
            log.info("Actualizando configuración SLA con ID: {}", id);
            SLAConfigurationDTO configuracionActualizada = slaConfigurationService.actualizarConfiguracion(id, dto);
            
            return ResponseEntity.ok(
                    ApiResponse.success("Configuración SLA actualizada exitosamente", configuracionActualizada));
        } catch (RuntimeException e) {
            log.error("Error al actualizar configuración SLA con ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error al actualizar configuración SLA con ID: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al actualizar configuración SLA: " + e.getMessage()));
        }
    }
    
    /**
     * Eliminar configuración SLA
     * DELETE /api/sla/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> eliminarConfiguracion(@PathVariable Long id) {
        try {
            log.info("Eliminando configuración SLA con ID: {}", id);
            slaConfigurationService.eliminarConfiguracion(id);
            
            return ResponseEntity.ok(
                    ApiResponse.success("Configuración SLA eliminada exitosamente", null));
        } catch (RuntimeException e) {
            log.error("Error al eliminar configuración SLA con ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error al eliminar configuración SLA con ID: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al eliminar configuración SLA: " + e.getMessage()));
        }
    }
    
    /**
     * Obtener configuraciones SLA activas
     * GET /api/sla/activas
     */
    @GetMapping("/activas")
    public ResponseEntity<List<SLAConfigurationDTO>> obtenerConfiguracionesActivas() {
        try {
            log.info("Solicitando configuraciones SLA activas");
            List<SLAConfigurationDTO> configuraciones = slaConfigurationService.obtenerConfiguracionesActivas();
            return ResponseEntity.ok(configuraciones);
        } catch (Exception e) {
            log.error("Error al obtener configuraciones SLA activas", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtener configuraciones SLA por prioridad
     * GET /api/sla/prioridad/{prioridad}
     */
    @GetMapping("/prioridad/{prioridad}")
    public ResponseEntity<List<SLAConfigurationDTO>> obtenerConfiguracionesPorPrioridad(@PathVariable String prioridad) {
        try {
            log.info("Solicitando configuraciones SLA por prioridad: {}", prioridad);
            List<SLAConfigurationDTO> configuraciones = slaConfigurationService.obtenerConfiguracionesPorPrioridad(prioridad);
            return ResponseEntity.ok(configuraciones);
        } catch (Exception e) {
            log.error("Error al obtener configuraciones SLA por prioridad: {}", prioridad, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtener configuraciones SLA por categoría
     * GET /api/sla/categoria/{categoriaId}
     */
    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<SLAConfigurationDTO>> obtenerConfiguracionesPorCategoria(@PathVariable Long categoriaId) {
        try {
            log.info("Solicitando configuraciones SLA por categoría ID: {}", categoriaId);
            List<SLAConfigurationDTO> configuraciones = slaConfigurationService.obtenerConfiguracionesPorCategoria(categoriaId);
            return ResponseEntity.ok(configuraciones);
        } catch (Exception e) {
            log.error("Error al obtener configuraciones SLA por categoría ID: {}", categoriaId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Buscar configuraciones SLA por nombre
     * GET /api/sla/buscar?nombre={nombre}
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<SLAConfigurationDTO>> buscarConfiguracionesPorNombre(@RequestParam String nombre) {
        try {
            log.info("Buscando configuraciones SLA por nombre: {}", nombre);
            List<SLAConfigurationDTO> configuraciones = slaConfigurationService.buscarConfiguracionesPorNombre(nombre);
            return ResponseEntity.ok(configuraciones);
        } catch (Exception e) {
            log.error("Error al buscar configuraciones SLA por nombre: {}", nombre, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtener configuración SLA específica por categoría y prioridad
     * GET /api/sla/categoria/{categoriaId}/prioridad/{prioridad}
     */
    @GetMapping("/categoria/{categoriaId}/prioridad/{prioridad}")
    public ResponseEntity<SLAConfigurationDTO> obtenerConfiguracionPorCategoriaYPrioridad(
            @PathVariable Long categoriaId, 
            @PathVariable String prioridad) {
        try {
            log.info("Solicitando configuración SLA por categoría ID: {} y prioridad: {}", categoriaId, prioridad);
            Optional<SLAConfigurationDTO> configuracion = slaConfigurationService.obtenerConfiguracionPorCategoriaYPrioridad(categoriaId, prioridad);
            
            if (configuracion.isPresent()) {
                return ResponseEntity.ok(configuracion.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error al obtener configuración SLA por categoría ID: {} y prioridad: {}", categoriaId, prioridad, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtener estadísticas de configuraciones SLA
     * GET /api/sla/estadisticas
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<ApiResponse> obtenerEstadisticas() {
        try {
            log.info("Solicitando estadísticas de configuraciones SLA");
            SLAConfigurationService.SLAStatsDTO estadisticas = slaConfigurationService.obtenerEstadisticas();
            return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas exitosamente", estadisticas));
        } catch (Exception e) {
            log.error("Error al obtener estadísticas de configuraciones SLA", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al obtener estadísticas: " + e.getMessage()));
        }
    }
}
