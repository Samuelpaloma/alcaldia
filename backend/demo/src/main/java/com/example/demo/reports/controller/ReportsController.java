package com.example.demo.reports.controller;

import com.example.demo.reports.dto.request.GenerarReporteMensualRequestDTO;
import com.example.demo.reports.dto.response.EstadisticasReportesResponseDTO;
import com.example.demo.reports.dto.response.ReporteMensualResponseDTO;
import com.example.demo.reports.model.ConfiguracionReporteAutomatico;
import com.example.demo.reports.service.ReportsService;
import com.example.demo.reports.service.ReporteAutomaticoService;
import com.example.demo.reports.service.ReporteMensualService;
import com.example.demo.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ReportsController {
    
    private final ReportsService reportsService;
    private final ReporteAutomaticoService reporteAutomaticoService;
    private final ReporteMensualService reporteMensualService;
    
    /**
     * Obtener estadísticas generales de reportes
     * GET /api/reports/estadisticas
     */
    @GetMapping("/estadisticas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            log.info("🔍 [REPORTS-CONTROLLER] Iniciando petición de estadísticas");
            EstadisticasReportesResponseDTO estadisticas = reportsService.obtenerEstadisticas();
            log.info("🔍 [REPORTS-CONTROLLER] Estadísticas obtenidas exitosamente - Total tickets: {}", 
                    estadisticas.getTotalTickets());
            return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas exitosamente", estadisticas));
        } catch (Exception e) {
            log.error("🔍 [REPORTS-CONTROLLER] Error obteniendo estadísticas de reportes", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener estadísticas: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener reportes mensuales
     * GET /api/reports/mensuales
     */
    @GetMapping("/mensuales")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> obtenerReportesMensuales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("🔍 [REPORTS-CONTROLLER] Obteniendo reportes mensuales - página: {}, tamaño: {}", page, size);
            List<ReporteMensualResponseDTO> reportes = reporteMensualService.obtenerReportesMensuales(page, size);
            return ResponseEntity.ok(ApiResponse.success("Reportes mensuales obtenidos exitosamente", reportes));
        } catch (Exception e) {
            log.error("🔍 [REPORTS-CONTROLLER] Error obteniendo reportes mensuales", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener reportes mensuales: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener reporte mensual específico
     * GET /api/reports/mensuales/{id}
     */
    @GetMapping("/mensuales/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> obtenerReporteMensual(@PathVariable Long id) {
        try {
            log.info("Obteniendo reporte mensual con ID: {}", id);
            ReporteMensualResponseDTO reporte = reportsService.obtenerReporteMensual(id);
            return ResponseEntity.ok(ApiResponse.success("Reporte mensual obtenido exitosamente", reporte));
        } catch (Exception e) {
            log.error("Error obteniendo reporte mensual con ID: {}", id, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener reporte mensual: " + e.getMessage())
            );
        }
    }
    
    /**
     * Generar reporte mensual
     * POST /api/reports/mensuales/generar
     */
    @PostMapping("/mensuales/generar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> generarReporteMensual(
            @RequestParam int mes,
            @RequestParam int año) {
        try {
            log.info("Generando reporte mensual para {}/{}", mes, año);
            ReporteMensualResponseDTO reporte = reportsService.generarReporteMensual(mes, año);
            return ResponseEntity.ok(ApiResponse.success("Reporte mensual generado exitosamente", reporte));
        } catch (Exception e) {
            log.error("Error generando reporte mensual para {}/{}", mes, año, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al generar reporte mensual: " + e.getMessage())
            );
        }
    }
    
    /**
     * Descargar reporte mensual
     * GET /api/reports/mensuales/{id}/descargar
     */
    @GetMapping("/mensuales/{id}/descargar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<byte[]> descargarReporteMensual(@PathVariable Long id) {
        try {
            log.info("🔍 [REPORTS-CONTROLLER] Descargando reporte mensual ID: {}", id);
            byte[] contenido = reporteMensualService.descargarReporteMensual(id);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "reporte_mensual.pdf");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(contenido);
        } catch (Exception e) {
            log.error("🔍 [REPORTS-CONTROLLER] Error descargando reporte mensual", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Obtener tendencias de tickets por mes
     * GET /api/reports/tendencias
     */
    @GetMapping("/tendencias")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> obtenerTendencias(
            @RequestParam(defaultValue = "12") int meses) {
        try {
            log.info("Obteniendo tendencias de los últimos {} meses", meses);
            List<Object> tendencias = reportsService.obtenerTendencias(meses);
            return ResponseEntity.ok(ApiResponse.success("Tendencias obtenidas exitosamente", tendencias));
        } catch (Exception e) {
            log.error("Error obteniendo tendencias", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener tendencias: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener estadísticas básicas (más eficiente)
     * GET /api/reports/estadisticas-basicas
     */
    @GetMapping("/estadisticas-basicas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> obtenerEstadisticasBasicas() {
        try {
            log.info("🔍 [REPORTS-CONTROLLER] Obteniendo estadísticas básicas");
            Map<String, Object> estadisticas = reportsService.obtenerEstadisticasBasicas();
            log.info("🔍 [REPORTS-CONTROLLER] Estadísticas básicas obtenidas: {}", estadisticas);
            return ResponseEntity.ok(ApiResponse.success("Estadísticas básicas obtenidas exitosamente", estadisticas));
        } catch (Exception e) {
            log.error("🔍 [REPORTS-CONTROLLER] Error obteniendo estadísticas básicas", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener estadísticas básicas: " + e.getMessage())
            );
        }
    }
    
    // ==================== REPORTES AUTOMÁTICOS ====================
    
    /**
     * Configurar reporte automático
     * POST /api/reports/automaticos/configurar
     */
    @PostMapping("/automaticos/configurar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> configurarReporteAutomatico(
            @RequestBody Map<String, Object> request) {
        try {
            log.info("🔍 [REPORTS-CONTROLLER] Configurando reporte automático");
            
            String tipoReporte = (String) request.get("tipoReporte");
            Integer diaGeneracion = (Integer) request.get("diaGeneracion");
            String horaGeneracion = (String) request.get("horaGeneracion");
            String emailDestinatarios = (String) request.get("emailDestinatarios");
            String observaciones = (String) request.get("observaciones");
            
            ConfiguracionReporteAutomatico config = reporteAutomaticoService.configurarReporteAutomatico(
                    tipoReporte, diaGeneracion, horaGeneracion, emailDestinatarios, observaciones);
            
            return ResponseEntity.ok(ApiResponse.success("Configuración de reporte automático creada exitosamente", config));
        } catch (Exception e) {
            log.error("🔍 [REPORTS-CONTROLLER] Error configurando reporte automático", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error configurando reporte automático: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener configuraciones de reportes automáticos
     * GET /api/reports/automaticos/configuraciones
     */
    @GetMapping("/automaticos/configuraciones")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> obtenerConfiguracionesAutomaticas() {
        try {
            log.info("🔍 [REPORTS-CONTROLLER] Obteniendo configuraciones automáticas");
            List<ConfiguracionReporteAutomatico> configuraciones = reporteAutomaticoService.obtenerConfiguracionesActivas();
            return ResponseEntity.ok(ApiResponse.success("Configuraciones obtenidas exitosamente", configuraciones));
        } catch (Exception e) {
            log.error("🔍 [REPORTS-CONTROLLER] Error obteniendo configuraciones", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error obteniendo configuraciones: " + e.getMessage())
            );
        }
    }
    
    /**
     * Desactivar configuración de reporte automático
     * DELETE /api/reports/automaticos/configuraciones/{id}
     */
    @DeleteMapping("/automaticos/configuraciones/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> desactivarConfiguracion(@PathVariable Long id) {
        try {
            log.info("🔍 [REPORTS-CONTROLLER] Desactivando configuración ID: {}", id);
            reporteAutomaticoService.desactivarConfiguracion(id);
            return ResponseEntity.ok(ApiResponse.success("Configuración desactivada exitosamente"));
        } catch (Exception e) {
            log.error("🔍 [REPORTS-CONTROLLER] Error desactivando configuración", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error desactivando configuración: " + e.getMessage())
            );
        }
    }
    
    /**
     * Generar reporte manual
     * POST /api/reports/generar-manual
     */
    @PostMapping("/generar-manual")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> generarReporteManual(@RequestBody GenerarReporteMensualRequestDTO request) {
        try {
            log.info("🔍 [REPORTS-CONTROLLER] Generando reporte manual tipo: {} para {}/{}", 
                    request.getTipoReporte(), request.getMes(), request.getAño());
            
            reporteAutomaticoService.generarReporteManual(
                    request.getTipoReporte(), request.getMes(), request.getAño());
            
            return ResponseEntity.ok(ApiResponse.success("Reporte generado exitosamente"));
        } catch (Exception e) {
            log.error("🔍 [REPORTS-CONTROLLER] Error generando reporte manual", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error generando reporte manual: " + e.getMessage())
            );
        }
    }
    
}
