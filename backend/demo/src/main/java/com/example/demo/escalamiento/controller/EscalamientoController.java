package com.example.demo.escalamiento.controller;

import com.example.demo.asignacion.dto.response.AsignacionResponseDTO;
import com.example.demo.escalamiento.dto.EscalamientoStatsDTO;
import com.example.demo.escalamiento.service.EscalamientoService;
import com.example.demo.shared.dto.ApiResponse;
import com.example.demo.usuario.model.NivelTecnico;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/escalamiento")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class EscalamientoController {
    
    private final EscalamientoService escalamientoService;
    
    /**
     * Escalar ticket automáticamente al siguiente nivel
     * POST /api/escalamiento/escalar/{ticketId}
     */
    @PostMapping("/escalar/{ticketId}")
    @PreAuthorize("hasAnyRole('TECNICO', 'ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> escalarTicket(
            @PathVariable Long ticketId,
            @RequestParam String motivo) {
        try {
            log.info("Escalando ticket {} - Motivo: {}", ticketId, motivo);
            
            AsignacionResponseDTO resultado = escalamientoService.escalarTicket(ticketId, motivo);
            
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Error escalando ticket {}", ticketId, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al escalar ticket: " + e.getMessage())
            );
        }
    }
    
    /**
     * Escalar ticket manualmente a un nivel específico
     * POST /api/escalamiento/escalar/{ticketId}/nivel/{nivel}
     */
    @PostMapping("/escalar/{ticketId}/nivel/{nivel}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> escalarTicketANivel(
            @PathVariable Long ticketId,
            @PathVariable String nivel,
            @RequestParam String motivo) {
        try {
            log.info("Escalando ticket {} al nivel {} - Motivo: {}", ticketId, nivel, motivo);
            
            NivelTecnico nivelTecnico = NivelTecnico.fromDescripcion(nivel);
            AsignacionResponseDTO resultado = escalamientoService.escalarTicketANivel(ticketId, nivelTecnico, motivo);
            
            return ResponseEntity.ok(resultado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Nivel de técnico inválido. Use: BAJO, MEDIO, ALTO")
            );
        } catch (Exception e) {
            log.error("Error escalando ticket {} al nivel {}", ticketId, nivel, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al escalar ticket: " + e.getMessage())
            );
        }
    }
    
    /**
     * Verificar si un ticket puede ser escalado
     * GET /api/escalamiento/puede-escalar/{ticketId}
     */
    @GetMapping("/puede-escalar/{ticketId}")
    @PreAuthorize("hasAnyRole('TECNICO', 'ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> puedeEscalarTicket(@PathVariable Long ticketId) {
        try {
            boolean puedeEscalar = escalamientoService.puedeEscalarTicket(ticketId);
            
            return ResponseEntity.ok(new EscalamientoCheckDTO(ticketId, puedeEscalar));
        } catch (Exception e) {
            log.error("Error verificando escalamiento del ticket {}", ticketId, e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al verificar escalamiento: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener estadísticas de escalamiento
     * GET /api/escalamiento/estadisticas
     */
    @GetMapping("/estadisticas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')")
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            EscalamientoStatsDTO estadisticas = escalamientoService.obtenerEstadisticasEscalamiento();
            
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas de escalamiento", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener estadísticas: " + e.getMessage())
            );
        }
    }
    
    /**
     * DTO interno para verificación de escalamiento
     */
    public static class EscalamientoCheckDTO {
        private Long ticketId;
        private boolean puedeEscalar;
        
        public EscalamientoCheckDTO(Long ticketId, boolean puedeEscalar) {
            this.ticketId = ticketId;
            this.puedeEscalar = puedeEscalar;
        }
        
        // Getters
        public Long getTicketId() { return ticketId; }
        public boolean isPuedeEscalar() { return puedeEscalar; }
    }
}
