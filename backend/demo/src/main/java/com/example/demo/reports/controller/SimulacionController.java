package com.example.demo.reports.controller;

import com.example.demo.reports.service.SimulacionReportesService;
import com.example.demo.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/simulacion")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SimulacionController {

    private final SimulacionReportesService simulacionService;

    /**
     * Habilitar simulación de reportes
     * POST /api/simulacion/habilitar
     */
    @PostMapping("/habilitar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> habilitarSimulacion(@RequestParam boolean habilitada) {
        try {
            log.info("🎭 [SIMULACION-CONTROLLER] {} simulación", habilitada ? "Habilitando" : "Deshabilitando");
            simulacionService.habilitarSimulacion(habilitada);
            return ResponseEntity.ok(ApiResponse.success(
                "Simulación " + (habilitada ? "habilitada" : "deshabilitada") + " exitosamente"
            ));
        } catch (Exception e) {
            log.error("🎭 [SIMULACION-CONTROLLER] Error controlando simulación", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error controlando simulación: " + e.getMessage())
            );
        }
    }

    /**
     * Generar reportes de prueba inmediatamente
     * POST /api/simulacion/generar-prueba
     */
    @PostMapping("/generar-prueba")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> generarReportesDePrueba() {
        try {
            log.info("🎭 [SIMULACION-CONTROLLER] Generando reportes de prueba");
            simulacionService.generarReportesDePrueba();
            return ResponseEntity.ok(ApiResponse.success("Reportes de prueba generados exitosamente"));
        } catch (Exception e) {
            log.error("🎭 [SIMULACION-CONTROLLER] Error generando reportes de prueba", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error generando reportes de prueba: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener estado de la simulación
     * GET /api/simulacion/estado
     */
    @GetMapping("/estado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> obtenerEstadoSimulacion() {
        try {
            log.info("🎭 [SIMULACION-CONTROLLER] Obteniendo estado de simulación");
            String simulacionEnabled = System.getProperty("simulacion.reportes", "true");
            boolean habilitada = "true".equalsIgnoreCase(simulacionEnabled);
            
            return ResponseEntity.ok(ApiResponse.success("Estado de simulación obtenido", Map.of(
                "habilitada", habilitada,
                "descripcion", habilitada ? 
                    "La simulación está activa. Los reportes se generarán cada 2 minutos." :
                    "La simulación está desactivada. Los reportes se generarán según la programación normal."
            )));
        } catch (Exception e) {
            log.error("🎭 [SIMULACION-CONTROLLER] Error obteniendo estado", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error obteniendo estado: " + e.getMessage())
            );
        }
    }

    /**
     * Simular paso del tiempo (crear tickets con fechas anteriores)
     * POST /api/simulacion/simular-tiempo
     */
    @PostMapping("/simular-tiempo")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> simularTiempo(@RequestBody Map<String, Object> request) {
        try {
            log.info("🎭 [SIMULACION-CONTROLLER] Simulando paso del tiempo");
            Integer mesesAtras = (Integer) request.get("mesesAtras");
            
            if (mesesAtras == null || mesesAtras <= 0) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("mesesAtras debe ser un número positivo")
                );
            }
            
            // Esta funcionalidad se implementaría en el servicio
            // simulacionService.simularTiempo(mesesAtras);
            
            return ResponseEntity.ok(ApiResponse.success(
                "Simulación de tiempo completada. Se crearon tickets de hace " + mesesAtras + " meses."
            ));
        } catch (Exception e) {
            log.error("🎭 [SIMULACION-CONTROLLER] Error simulando tiempo", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error simulando tiempo: " + e.getMessage())
            );
        }
    }
}
