package com.example.demo.automation.controller;

import com.example.demo.automation.dto.request.ReglaAutomatizacionRequestDTO;
import com.example.demo.automation.dto.response.ReglaAutomatizacionResponseDTO;
import com.example.demo.automation.service.AutomationService;
import com.example.demo.shared.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/automation")
@CrossOrigin(origins = "*")
public class AutomationController {

    @Autowired
    private AutomationService automationService;

    /**
     * Obtener todas las reglas de automatización
     */
    @GetMapping("/rules")
    public ResponseEntity<ApiResponse> obtenerReglasAutomatizacion() {
        try {
            List<ReglaAutomatizacionResponseDTO> reglas = automationService.obtenerTodasLasReglas();
            return ResponseEntity.ok(ApiResponse.success("Reglas obtenidas exitosamente", reglas));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener reglas: " + e.getMessage())
            );
        }
    }

    /**
     * Crear nueva regla de automatización
     */
    @PostMapping("/rules")
    public ResponseEntity<ApiResponse> crearReglaAutomatizacion(
            @RequestBody ReglaAutomatizacionRequestDTO request,
            Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            ReglaAutomatizacionResponseDTO regla = automationService.crearRegla(request, emailUsuario);
            return ResponseEntity.ok(ApiResponse.success("Regla creada exitosamente", regla));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al crear regla: " + e.getMessage())
            );
        }
    }

    /**
     * Actualizar regla de automatización
     */
    @PutMapping("/rules/{ruleId}")
    public ResponseEntity<ApiResponse> actualizarReglaAutomatizacion(
            @PathVariable Long ruleId,
            @RequestBody ReglaAutomatizacionRequestDTO request,
            Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            ReglaAutomatizacionResponseDTO regla = automationService.actualizarRegla(ruleId, request, emailUsuario);
            return ResponseEntity.ok(ApiResponse.success("Regla actualizada exitosamente", regla));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al actualizar regla: " + e.getMessage())
            );
        }
    }

    /**
     * Eliminar regla de automatización
     */
    @DeleteMapping("/rules/{ruleId}")
    public ResponseEntity<ApiResponse> eliminarReglaAutomatizacion(
            @PathVariable Long ruleId,
            Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            automationService.eliminarRegla(ruleId, emailUsuario);
            return ResponseEntity.ok(ApiResponse.success("Regla eliminada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al eliminar regla: " + e.getMessage())
            );
        }
    }

    /**
     * Activar/Desactivar regla
     */
    @PutMapping("/rules/{ruleId}/toggle")
    public ResponseEntity<ApiResponse> toggleRegla(
            @PathVariable Long ruleId,
            @RequestParam Boolean activa,
            Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            automationService.toggleRegla(ruleId, activa, emailUsuario);
            return ResponseEntity.ok(ApiResponse.success("Estado de regla actualizado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al cambiar estado de regla: " + e.getMessage())
            );
        }
    }

    /**
     * Ejecutar reglas manualmente
     */
    @PostMapping("/execute")
    public ResponseEntity<ApiResponse> ejecutarReglas() {
        try {
            int reglasEjecutadas = automationService.ejecutarReglasActivas();
            return ResponseEntity.ok(ApiResponse.success("Reglas ejecutadas exitosamente", 
                "Se ejecutaron " + reglasEjecutadas + " reglas"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al ejecutar reglas: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener estadísticas de automatización
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<ApiResponse> obtenerEstadisticasAutomatizacion() {
        try {
            var estadisticas = automationService.obtenerEstadisticas();
            return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas exitosamente", estadisticas));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener estadísticas: " + e.getMessage())
            );
        }
    }
}






