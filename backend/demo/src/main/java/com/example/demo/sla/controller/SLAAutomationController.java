package com.example.demo.sla.controller;

import com.example.demo.sla.service.SLAMonitoringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sla/monitoring")
@CrossOrigin(origins = "*")
public class SLAAutomationController {

    @Autowired
    private SLAMonitoringService slaMonitoringService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSLAMonitoringStats() {
        try {
            Map<String, Object> stats = slaMonitoringService.obtenerEstadisticasMonitoreo();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> executeSLAMonitoringCheck() {
        try {
            Map<String, Object> result = slaMonitoringService.ejecutarVerificacionManual();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/expired")
    public ResponseEntity<Map<String, Object>> getSLATicketsExpired() {
        try {
            Map<String, Object> result = Map.of("data", slaMonitoringService.obtenerTicketsVencidos());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/expiring")
    public ResponseEntity<Map<String, Object>> getSLATicketsExpiring() {
        try {
            Map<String, Object> result = Map.of("data", slaMonitoringService.obtenerTicketsProximosVencer());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
