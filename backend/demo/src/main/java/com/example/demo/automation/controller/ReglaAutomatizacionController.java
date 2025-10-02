package com.example.demo.automation.controller;

import com.example.demo.automation.dto.request.ReglaAutomatizacionRequestDTO;
import com.example.demo.automation.dto.response.ReglaAutomatizacionResponseDTO;
import com.example.demo.automation.service.ReglaAutomatizacionService;
import com.example.demo.shared.dto.ApiResponse;
import com.example.demo.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/automation-rules")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ReglaAutomatizacionController {
    
    private final ReglaAutomatizacionService reglaAutomatizacionService;
    
    /**
     * Obtener todas las reglas de automatización
     * GET /api/automation-rules
     */
    @GetMapping
    public ResponseEntity<ApiResponse> obtenerTodasLasReglas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "prioridad") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            log.info("Obteniendo todas las reglas de automatización");
            
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : 
                Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            PageResponse<ReglaAutomatizacionResponseDTO> reglas = reglaAutomatizacionService.obtenerReglasConPaginacion(pageable);
            
            return ResponseEntity.ok(ApiResponse.success("Reglas obtenidas exitosamente", reglas));
        } catch (Exception e) {
            log.error("Error obteniendo reglas de automatización", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener reglas: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener reglas activas
     * GET /api/automation-rules/activas
     */
    @GetMapping("/activas")
    public ResponseEntity<ApiResponse> obtenerReglasActivas() {
        try {
            log.info("Obteniendo reglas de automatización activas");
            List<ReglaAutomatizacionResponseDTO> reglas = reglaAutomatizacionService.obtenerReglasActivas();
            return ResponseEntity.ok(ApiResponse.success("Reglas activas obtenidas exitosamente", reglas));
        } catch (Exception e) {
            log.error("Error obteniendo reglas activas", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener reglas activas: " + e.getMessage())
            );
        }
    }
    
    /**
     * Crear nueva regla de automatización
     * POST /api/automation-rules
     */
    @PostMapping
    public ResponseEntity<ApiResponse> crearRegla(@Valid @RequestBody ReglaAutomatizacionRequestDTO request) {
        try {
            log.info("Creando regla de automatización: {}", request.getNombre());
            ReglaAutomatizacionResponseDTO regla = reglaAutomatizacionService.crearRegla(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Regla creada exitosamente", regla)
            );
        } catch (Exception e) {
            log.error("Error creando regla de automatización", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al crear regla: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener regla por ID
     * GET /api/automation-rules/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> obtenerReglaPorId(@PathVariable Long id) {
        try {
            log.info("Obteniendo regla de automatización ID: {}", id);
            ReglaAutomatizacionResponseDTO regla = reglaAutomatizacionService.obtenerReglaPorId(id);
            return ResponseEntity.ok(ApiResponse.success("Regla obtenida exitosamente", regla));
        } catch (Exception e) {
            log.error("Error obteniendo regla ID: {}", id, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener regla: " + e.getMessage())
            );
        }
    }
    
    /**
     * Actualizar regla de automatización
     * PUT /api/automation-rules/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> actualizarRegla(
            @PathVariable Long id,
            @Valid @RequestBody ReglaAutomatizacionRequestDTO request) {
        try {
            log.info("Actualizando regla de automatización ID: {}", id);
            ReglaAutomatizacionResponseDTO regla = reglaAutomatizacionService.actualizarRegla(id, request);
            return ResponseEntity.ok(ApiResponse.success("Regla actualizada exitosamente", regla));
        } catch (Exception e) {
            log.error("Error actualizando regla ID: {}", id, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al actualizar regla: " + e.getMessage())
            );
        }
    }
    
    /**
     * Actualizar regla de automatización (PATCH)
     * PATCH /api/automation-rules/{id}
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse> actualizarReglaPatch(
            @PathVariable Long id,
            @Valid @RequestBody ReglaAutomatizacionRequestDTO request) {
        try {
            log.info("Actualizando regla de automatización ID: {} (PATCH)", id);
            ReglaAutomatizacionResponseDTO regla = reglaAutomatizacionService.actualizarRegla(id, request);
            return ResponseEntity.ok(ApiResponse.success("Regla actualizada exitosamente", regla));
        } catch (Exception e) {
            log.error("Error actualizando regla ID: {} (PATCH)", id, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al actualizar regla: " + e.getMessage())
            );
        }
    }
    
    /**
     * Eliminar regla de automatización
     * DELETE /api/automation-rules/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> eliminarRegla(@PathVariable Long id) {
        try {
            log.info("Eliminando regla de automatización ID: {}", id);
            reglaAutomatizacionService.eliminarRegla(id);
            return ResponseEntity.ok(ApiResponse.success("Regla eliminada exitosamente"));
        } catch (Exception e) {
            log.error("Error eliminando regla ID: {}", id, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al eliminar regla: " + e.getMessage())
            );
        }
    }
    
    /**
     * Activar/Desactivar regla
     * PATCH /api/automation-rules/{id}/toggle
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse> toggleEstadoRegla(@PathVariable Long id) {
        try {
            log.info("Cambiando estado de regla ID: {}", id);
            ReglaAutomatizacionResponseDTO regla = reglaAutomatizacionService.toggleEstadoRegla(id);
            return ResponseEntity.ok(ApiResponse.success("Estado de regla cambiado exitosamente", regla));
        } catch (Exception e) {
            log.error("Error cambiando estado de regla ID: {}", id, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al cambiar estado de regla: " + e.getMessage())
            );
        }
    }
    
    /**
     * Buscar reglas con filtros
     * GET /api/automation-rules/buscar
     */
    @GetMapping("/buscar")
    public ResponseEntity<ApiResponse> buscarReglas(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Boolean activa,
            @RequestParam(required = false) Integer prioridad,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            log.info("Buscando reglas con filtros: nombre={}, activa={}, prioridad={}", nombre, activa, prioridad);
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("prioridad").descending().and(Sort.by("fechaCreacion").ascending()));
            PageResponse<ReglaAutomatizacionResponseDTO> reglas = reglaAutomatizacionService.buscarReglas(nombre, activa, prioridad, pageable);
            
            return ResponseEntity.ok(ApiResponse.success("Búsqueda realizada exitosamente", reglas));
        } catch (Exception e) {
            log.error("Error buscando reglas", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al buscar reglas: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener estadísticas de reglas
     * GET /api/automation-rules/estadisticas
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<ApiResponse> obtenerEstadisticas() {
        try {
            log.info("Obteniendo estadísticas de reglas de automatización");
            
            var estadisticas = new Object() {
                public final Long reglasActivas = reglaAutomatizacionService.contarReglasActivas();
                public final Long ejecucionesTotales = reglaAutomatizacionService.contarEjecucionesTotales();
                
                @Override
                public String toString() {
                    return "Estadisticas{reglasActivas=" + reglasActivas + ", ejecucionesTotales=" + ejecucionesTotales + "}";
                }
            };
            
            return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas exitosamente", estadisticas));
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener estadísticas: " + e.getMessage())
            );
        }
    }
    
    /**
     * Ejecutar todas las reglas activas
     * POST /api/automation-rules/ejecutar
     */
    @PostMapping("/ejecutar")
    public ResponseEntity<ApiResponse> ejecutarReglas() {
        try {
            log.info("Ejecutando todas las reglas de automatización activas");
            reglaAutomatizacionService.ejecutarReglas();
            return ResponseEntity.ok(ApiResponse.success("Reglas ejecutadas exitosamente"));
        } catch (Exception e) {
            log.error("Error ejecutando reglas", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al ejecutar reglas: " + e.getMessage())
            );
        }
    }
    
    /**
     * Ejecutar regla específica
     * POST /api/automation-rules/{id}/ejecutar
     */
    @PostMapping("/{id}/ejecutar")
    public ResponseEntity<ApiResponse> ejecutarRegla(@PathVariable Long id) {
        try {
            log.info("Ejecutando regla de automatización ID: {}", id);
            reglaAutomatizacionService.ejecutarRegla(id);
            return ResponseEntity.ok(ApiResponse.success("Regla ejecutada exitosamente"));
        } catch (Exception e) {
            log.error("Error ejecutando regla ID: {}", id, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al ejecutar regla: " + e.getMessage())
            );
        }
    }
}
