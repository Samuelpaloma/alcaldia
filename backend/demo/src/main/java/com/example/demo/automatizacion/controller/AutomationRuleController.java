package com.example.demo.automatizacion.controller;

import com.example.demo.automatizacion.dto.AutomationRuleDTO;
import com.example.demo.automatizacion.dto.AutomationStatsDTO;
import com.example.demo.automatizacion.service.AutomationRuleService;
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
@RequestMapping("/api/automation-rules")
public class AutomationRuleController {
    
    private static final Logger log = LoggerFactory.getLogger(AutomationRuleController.class);
    
    @Autowired
    private AutomationRuleService automationRuleService;
    
    /**
     * Obtener todas las reglas de automatización
     * GET /api/automation-rules
     */
    @GetMapping
    public ResponseEntity<List<AutomationRuleDTO>> obtenerTodasLasReglas() {
        try {
            log.info("Solicitando todas las reglas de automatización");
            List<AutomationRuleDTO> reglas = automationRuleService.obtenerTodasLasReglas();
            return ResponseEntity.ok(reglas);
        } catch (Exception e) {
            log.error("Error al obtener reglas de automatización", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtener regla de automatización por ID
     * GET /api/automation-rules/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<AutomationRuleDTO> obtenerReglaPorId(@PathVariable Long id) {
        try {
            log.info("Solicitando regla de automatización con ID: {}", id);
            Optional<AutomationRuleDTO> regla = automationRuleService.obtenerReglaPorId(id);
            
            if (regla.isPresent()) {
                return ResponseEntity.ok(regla.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error al obtener regla de automatización con ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Crear nueva regla de automatización
     * POST /api/automation-rules
     */
    @PostMapping
    public ResponseEntity<ApiResponse> crearRegla(@RequestBody AutomationRuleDTO dto) {
        try {
            log.info("Creando nueva regla de automatización: {}", dto.getNombre());
            AutomationRuleDTO reglaCreada = automationRuleService.crearRegla(dto);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Regla de automatización creada exitosamente", reglaCreada));
        } catch (Exception e) {
            log.error("Error al crear regla de automatización", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al crear regla de automatización: " + e.getMessage()));
        }
    }
    
    /**
     * Actualizar regla de automatización
     * PATCH /api/automation-rules/{id}
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse> actualizarRegla(
            @PathVariable Long id, 
            @RequestBody AutomationRuleDTO dto) {
        try {
            log.info("Actualizando regla de automatización con ID: {}", id);
            AutomationRuleDTO reglaActualizada = automationRuleService.actualizarRegla(id, dto);
            
            return ResponseEntity.ok(
                    ApiResponse.success("Regla de automatización actualizada exitosamente", reglaActualizada));
        } catch (RuntimeException e) {
            log.error("Error al actualizar regla de automatización con ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error al actualizar regla de automatización con ID: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al actualizar regla de automatización: " + e.getMessage()));
        }
    }
    
    /**
     * Eliminar regla de automatización
     * DELETE /api/automation-rules/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> eliminarRegla(@PathVariable Long id) {
        try {
            log.info("Eliminando regla de automatización con ID: {}", id);
            automationRuleService.eliminarRegla(id);
            
            return ResponseEntity.ok(
                    ApiResponse.success("Regla de automatización eliminada exitosamente", null));
        } catch (RuntimeException e) {
            log.error("Error al eliminar regla de automatización con ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error al eliminar regla de automatización con ID: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al eliminar regla de automatización: " + e.getMessage()));
        }
    }
    
    /**
     * Obtener reglas de automatización activas
     * GET /api/automation-rules/activas
     */
    @GetMapping("/activas")
    public ResponseEntity<List<AutomationRuleDTO>> obtenerReglasActivas() {
        try {
            log.info("Solicitando reglas de automatización activas");
            List<AutomationRuleDTO> reglas = automationRuleService.obtenerReglasActivas();
            return ResponseEntity.ok(reglas);
        } catch (Exception e) {
            log.error("Error al obtener reglas de automatización activas", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Activar/desactivar regla de automatización
     * PATCH /api/automation-rules/{id}/toggle
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse> toggleRegla(@PathVariable Long id) {
        try {
            log.info("Cambiando estado de regla de automatización con ID: {}", id);
            AutomationRuleDTO reglaActualizada = automationRuleService.toggleRegla(id);
            
            return ResponseEntity.ok(
                    ApiResponse.success("Estado de regla actualizado exitosamente", reglaActualizada));
        } catch (RuntimeException e) {
            log.error("Error al cambiar estado de regla con ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            log.error("Error al cambiar estado de regla con ID: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al cambiar estado de regla: " + e.getMessage()));
        }
    }
    
    /**
     * Buscar reglas de automatización por nombre
     * GET /api/automation-rules/buscar?nombre={nombre}
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<AutomationRuleDTO>> buscarReglasPorNombre(@RequestParam String nombre) {
        try {
            log.info("Buscando reglas de automatización por nombre: {}", nombre);
            List<AutomationRuleDTO> reglas = automationRuleService.buscarReglasPorNombre(nombre);
            return ResponseEntity.ok(reglas);
        } catch (Exception e) {
            log.error("Error al buscar reglas de automatización por nombre: {}", nombre, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Obtener estadísticas de reglas de automatización
     * GET /api/automation-rules/estadisticas
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<ApiResponse> obtenerEstadisticas() {
        try {
            log.info("Solicitando estadísticas de reglas de automatización");
            AutomationStatsDTO estadisticas = automationRuleService.obtenerEstadisticas();
            return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas exitosamente", estadisticas));
        } catch (Exception e) {
            log.error("Error al obtener estadísticas de reglas de automatización", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al obtener estadísticas: " + e.getMessage()));
        }
    }
}