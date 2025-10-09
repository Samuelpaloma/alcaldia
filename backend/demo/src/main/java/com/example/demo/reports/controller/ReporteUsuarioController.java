package com.example.demo.reports.controller;

import com.example.demo.reports.dto.request.GuardarReporteUsuarioRequestDTO;
import com.example.demo.reports.dto.response.ReporteUsuarioResponseDTO;
import com.example.demo.reports.service.ReporteUsuarioService;
import com.example.demo.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/reports/usuario")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ReporteUsuarioController {
    
    private final ReporteUsuarioService reporteUsuarioService;
    
    /**
     * Guardar un reporte generado por el usuario
     * POST /api/reports/usuario/guardar
     */
    @PostMapping("/guardar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN', 'TECNICO')")
    public ResponseEntity<?> guardarReporteUsuario(
            @Valid @RequestBody GuardarReporteUsuarioRequestDTO request,
            Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            log.info("🔍 [REPORTE-USUARIO-CONTROLLER] Guardando reporte para usuario: {}", emailUsuario);
            
            ReporteUsuarioResponseDTO reporte = reporteUsuarioService.guardarReporteUsuario(request, emailUsuario);
            
            log.info("🔍 [REPORTE-USUARIO-CONTROLLER] Reporte guardado exitosamente con ID: {}", reporte.getId());
            return ResponseEntity.ok(ApiResponse.success("Reporte guardado exitosamente", reporte));
            
        } catch (Exception e) {
            log.error("🔍 [REPORTE-USUARIO-CONTROLLER] Error guardando reporte", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al guardar el reporte: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener reportes del usuario
     * GET /api/reports/usuario/mis-reportes
     */
    @GetMapping("/mis-reportes")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN', 'TECNICO')")
    public ResponseEntity<?> obtenerMisReportes(
            @RequestParam(required = false) String tipoPeriodo,
            @RequestParam(required = false) String busqueda,
            Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            log.info("🔍 [REPORTE-USUARIO-CONTROLLER] Obteniendo reportes para usuario: {}", emailUsuario);
            
            List<ReporteUsuarioResponseDTO> reportes;
            
            if ((tipoPeriodo != null && !tipoPeriodo.trim().isEmpty()) || 
                (busqueda != null && !busqueda.trim().isEmpty())) {
                // Con filtros
                reportes = reporteUsuarioService.obtenerReportesUsuarioConFiltros(emailUsuario, tipoPeriodo, busqueda);
            } else {
                // Todos los reportes
                reportes = reporteUsuarioService.obtenerReportesUsuario(emailUsuario);
            }
            
            log.info("🔍 [REPORTE-USUARIO-CONTROLLER] Encontrados {} reportes", reportes.size());
            return ResponseEntity.ok(ApiResponse.success("Reportes obtenidos exitosamente", reportes));
            
        } catch (Exception e) {
            log.error("🔍 [REPORTE-USUARIO-CONTROLLER] Error obteniendo reportes", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener los reportes: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener un reporte específico
     * GET /api/reports/usuario/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN', 'TECNICO')")
    public ResponseEntity<?> obtenerReporteUsuario(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            log.info("🔍 [REPORTE-USUARIO-CONTROLLER] Obteniendo reporte {} para usuario: {}", id, emailUsuario);
            
            ReporteUsuarioResponseDTO reporte = reporteUsuarioService.obtenerReporteUsuario(id, emailUsuario);
            
            return ResponseEntity.ok(ApiResponse.success("Reporte obtenido exitosamente", reporte));
            
        } catch (Exception e) {
            log.error("🔍 [REPORTE-USUARIO-CONTROLLER] Error obteniendo reporte", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener el reporte: " + e.getMessage())
            );
        }
    }
    
    /**
     * Eliminar un reporte
     * DELETE /api/reports/usuario/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN', 'TECNICO')")
    public ResponseEntity<?> eliminarReporteUsuario(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            log.info("🔍 [REPORTE-USUARIO-CONTROLLER] Eliminando reporte {} para usuario: {}", id, emailUsuario);
            
            reporteUsuarioService.eliminarReporteUsuario(id, emailUsuario);
            
            return ResponseEntity.ok(ApiResponse.success("Reporte eliminado exitosamente"));
            
        } catch (Exception e) {
            log.error("🔍 [REPORTE-USUARIO-CONTROLLER] Error eliminando reporte", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al eliminar el reporte: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener estadísticas de reportes del usuario
     * GET /api/reports/usuario/estadisticas
     */
    @GetMapping("/estadisticas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN', 'TECNICO')")
    public ResponseEntity<?> obtenerEstadisticasUsuario(Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            log.info("🔍 [REPORTE-USUARIO-CONTROLLER] Obteniendo estadísticas para usuario: {}", emailUsuario);
            
            Object estadisticas = reporteUsuarioService.obtenerEstadisticasUsuario(emailUsuario);
            
            return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas exitosamente", estadisticas));
            
        } catch (Exception e) {
            log.error("🔍 [REPORTE-USUARIO-CONTROLLER] Error obteniendo estadísticas", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener las estadísticas: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener todos los reportes (solo para administradores)
     * GET /api/reports/usuario/todos
     */
    @GetMapping("/todos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> obtenerTodosLosReportes() {
        try {
            log.info("🔍 [REPORTE-USUARIO-CONTROLLER] Obteniendo todos los reportes");
            
            List<ReporteUsuarioResponseDTO> reportes = reporteUsuarioService.obtenerTodosLosReportes();
            
            return ResponseEntity.ok(ApiResponse.success("Todos los reportes obtenidos exitosamente", reportes));
            
        } catch (Exception e) {
            log.error("🔍 [REPORTE-USUARIO-CONTROLLER] Error obteniendo todos los reportes", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener todos los reportes: " + e.getMessage())
            );
        }
    }
}

