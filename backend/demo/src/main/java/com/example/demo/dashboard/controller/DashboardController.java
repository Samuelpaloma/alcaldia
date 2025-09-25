package com.example.demo.dashboard.controller;

import com.example.demo.dashboard.dto.response.DashboardMetricsResponseDTO;
import com.example.demo.dashboard.service.DashboardService;
import com.example.demo.shared.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    /**
     * Obtener métricas del dashboard
     */
    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse> obtenerMetricasDashboard(
            @RequestParam(defaultValue = "7d") String range) {
        try {
            DashboardMetricsResponseDTO metrics = dashboardService.obtenerMetricas(range);
            return ResponseEntity.ok(ApiResponse.success("Métricas obtenidas exitosamente", metrics));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener métricas: " + e.getMessage())
            );
        }
    }

    /**
     * Exportar reporte del dashboard
     */
    @PostMapping("/export")
    public ResponseEntity<ApiResponse> exportarReporteDashboard(
            @RequestParam String range,
            @RequestParam String format) {
        try {
            String reporteUrl = dashboardService.exportarReporte(range, format);
            return ResponseEntity.ok(ApiResponse.success("Reporte generado exitosamente", 
                "URL del reporte: " + reporteUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al exportar reporte: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener métricas en tiempo real
     */
    @GetMapping("/realtime")
    public ResponseEntity<ApiResponse> obtenerMetricasTiempoReal() {
        try {
            var metrics = dashboardService.obtenerMetricasTiempoReal();
            return ResponseEntity.ok(ApiResponse.success("Métricas en tiempo real obtenidas", metrics));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener métricas en tiempo real: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener tendencias por período
     */
    @GetMapping("/tendencias")
    public ResponseEntity<ApiResponse> obtenerTendencias(
            @RequestParam(defaultValue = "30d") String periodo) {
        try {
            var tendencias = dashboardService.obtenerTendencias(periodo);
            return ResponseEntity.ok(ApiResponse.success("Tendencias obtenidas exitosamente", tendencias));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener tendencias: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener rendimiento de técnicos
     */
    @GetMapping("/rendimiento-tecnicos")
    public ResponseEntity<ApiResponse> obtenerRendimientoTecnicos() {
        try {
            var rendimiento = dashboardService.obtenerRendimientoTecnicos();
            return ResponseEntity.ok(ApiResponse.success("Rendimiento de técnicos obtenido", rendimiento));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener rendimiento: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener análisis de SLA
     */
    @GetMapping("/sla-analysis")
    public ResponseEntity<ApiResponse> obtenerAnalisisSLA() {
        try {
            var analisis = dashboardService.obtenerAnalisisSLA();
            return ResponseEntity.ok(ApiResponse.success("Análisis de SLA obtenido", analisis));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener análisis de SLA: " + e.getMessage())
            );
        }
    }
}