package com.example.demo.sla.controller;

import com.example.demo.sla.service.SLAMonitoringService;
import com.example.demo.sla.service.SLAAutomationService;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/sla/test")
@CrossOrigin(origins = "*")
public class SLATestController {

    @Autowired
    private SLAMonitoringService slaMonitoringService;

    @Autowired
    private SLAAutomationService slaAutomationService;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSLAStatus() {
        try {
            Map<String, Object> stats = slaMonitoringService.obtenerEstadisticasMonitoreo();
            return ResponseEntity.ok(Map.of(
                "status", "SLA System Active",
                "timestamp", java.time.LocalDateTime.now(),
                "stats", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "SLA System Error",
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    @PostMapping("/execute-monitoring")
    public ResponseEntity<Map<String, Object>> executeMonitoring() {
        try {
            System.out.println("🧪 [SLA Test] Ejecutando monitoreo manual...");
            slaMonitoringService.monitorearSLA();
            return ResponseEntity.ok(Map.of(
                "status", "Monitoring executed successfully",
                "timestamp", java.time.LocalDateTime.now()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "Monitoring execution failed",
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    @PostMapping("/test-ticket/{ticketId}")
    public ResponseEntity<Map<String, Object>> testTicketProcessing(@PathVariable Long ticketId) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
            
            System.out.println("🧪 [SLA Test] Procesando ticket " + ticketId + " con SLA y automatización...");
            slaAutomationService.procesarTicketCreado(ticket);
            
            return ResponseEntity.ok(Map.of(
                "status", "Ticket processed successfully",
                "ticketId", ticketId,
                "timestamp", java.time.LocalDateTime.now()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "Ticket processing failed",
                "ticketId", ticketId,
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    @GetMapping("/check-technicians")
    public ResponseEntity<Map<String, Object>> checkTechnicians() {
        try {
            List<com.example.demo.usuario.model.Usuario> tecnicosActivos = usuarioRepository.findActiveTechnicians();
            Optional<com.example.demo.usuario.model.Usuario> tecnicoMenorCarga = usuarioRepository.findTechnicianWithLeastActiveTickets();
            
            System.out.println("🧪 [SLA Test] Verificando técnicos disponibles...");
            System.out.println("🧪 [SLA Test] Técnicos activos encontrados: " + tecnicosActivos.size());
            
            if (!tecnicosActivos.isEmpty()) {
                System.out.println("🧪 [SLA Test] Lista de técnicos:");
                for (com.example.demo.usuario.model.Usuario tecnico : tecnicosActivos) {
                    System.out.println("  - ID: " + tecnico.getIdUsuario() + ", Email: " + tecnico.getEmail() + ", Nombre: " + tecnico.getNombreCompleto());
                }
            }
            
            if (tecnicoMenorCarga.isPresent()) {
                System.out.println("🧪 [SLA Test] Técnico con menor carga: " + tecnicoMenorCarga.get().getEmail());
            } else {
                System.out.println("🧪 [SLA Test] No se encontró técnico con menor carga");
            }
            
            return ResponseEntity.ok(Map.of(
                "status", "Technicians check completed",
                "totalActiveTechnicians", tecnicosActivos.size(),
                "technicians", tecnicosActivos.stream().map(t -> Map.of(
                    "id", t.getIdUsuario(),
                    "email", t.getEmail(),
                    "nombre", t.getNombreCompleto(),
                    "activo", t.getActivo()
                )).toList(),
                "technicianWithLeastLoad", tecnicoMenorCarga.map(t -> Map.of(
                    "id", t.getIdUsuario(),
                    "email", t.getEmail(),
                    "nombre", t.getNombreCompleto()
                )).orElse(null),
                "timestamp", java.time.LocalDateTime.now()
            ));
        } catch (Exception e) {
            System.out.println("❌ [SLA Test] Error verificando técnicos: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "Technicians check failed",
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }
}
