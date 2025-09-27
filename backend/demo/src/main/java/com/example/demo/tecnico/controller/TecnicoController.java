package com.example.demo.tecnico.controller;

import com.example.demo.tecnico.dto.request.CambiarEstadoTicketRequestDTO;
import com.example.demo.tecnico.dto.request.SubirEvidenciaRequestDTO;
import com.example.demo.tecnico.dto.response.TicketTecnicoResponseDTO;
import com.example.demo.tecnico.dto.response.EstadisticasTecnicoResponseDTO;
import com.example.demo.ticket.dto.response.EvidenciaResponseDTO;
import com.example.demo.tecnico.service.TecnicoService;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tecnico")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TecnicoController {
    
    private final TecnicoService tecnicoService;
    
    /**
     * Obtener tickets asignados al técnico
     * GET /api/tecnico/tickets
     */
    @GetMapping("/tickets")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerTicketsAsignados(Authentication authentication) {
        try {
            log.info("Obteniendo tickets asignados para técnico");
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            List<TicketTecnicoResponseDTO> tickets = tecnicoService.obtenerTicketsAsignados(emailTecnico);
            
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error obteniendo tickets asignados", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener tickets: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener ticket detallado con evidencias e historial
     * GET /api/tecnico/tickets/{ticketId}
     */
    @GetMapping("/tickets/{ticketId}")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerTicketDetallado(
            @PathVariable Long ticketId,
            Authentication authentication) {
        try {
            log.info("Obteniendo ticket detallado {} para técnico", ticketId);
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            TicketTecnicoResponseDTO ticket = tecnicoService.obtenerTicketDetallado(ticketId, emailTecnico);
            
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            log.error("Error obteniendo ticket detallado", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener ticket: " + e.getMessage())
            );
        }
    }
    
    /**
     * Cambiar estado de un ticket
     * PUT /api/tecnico/tickets/cambiar-estado
     */
    @PutMapping("/tickets/cambiar-estado")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> cambiarEstadoTicket(
            @Valid @RequestBody CambiarEstadoTicketRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Cambiando estado del ticket {} a {}", request.getTicketId(), request.getNuevoEstado());
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            TicketTecnicoResponseDTO ticket = tecnicoService.cambiarEstadoTicket(request, emailTecnico);
            
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            log.error("Error cambiando estado del ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al cambiar estado: " + e.getMessage())
            );
        }
    }
    
    /**
     * Subir evidencia a un ticket
     * POST /api/tecnico/tickets/subir-evidencia
     */
    @PostMapping("/tickets/subir-evidencia")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> subirEvidencia(
            @Valid @RequestBody SubirEvidenciaRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Subiendo evidencia al ticket {}", request.getTicketId());
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            EvidenciaResponseDTO evidencia = tecnicoService.subirEvidencia(request, emailTecnico);
            
            return ResponseEntity.ok(evidencia);
        } catch (Exception e) {
            log.error("Error subiendo evidencia", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al subir evidencia: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener historial de tickets del técnico
     * GET /api/tecnico/historial
     */
    @GetMapping("/historial")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerHistorialTickets(Authentication authentication) {
        try {
            log.info("Obteniendo historial de tickets para técnico");
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            List<TicketTecnicoResponseDTO> tickets = tecnicoService.obtenerHistorialTickets(emailTecnico);
            
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error obteniendo historial de tickets", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener historial: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener estadísticas del técnico
     * GET /api/tecnico/estadisticas
     */
    @GetMapping("/estadisticas")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerEstadisticas(Authentication authentication) {
        try {
            log.info("Obteniendo estadísticas para técnico");
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            EstadisticasTecnicoResponseDTO estadisticas = tecnicoService.obtenerEstadisticasTecnico(emailTecnico);
            
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener estadísticas: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener dashboard del técnico (alias para estadísticas)
     * GET /api/tecnico/dashboard
     */
    @GetMapping("/dashboard")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerDashboard(Authentication authentication) {
        try {
            log.info("Obteniendo dashboard para técnico");
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            EstadisticasTecnicoResponseDTO estadisticas = tecnicoService.obtenerEstadisticasTecnico(emailTecnico);
            
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            log.error("Error obteniendo dashboard", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener dashboard: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener evidencias del técnico
     * GET /api/tecnico/evidencias
     */
    @GetMapping("/evidencias")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerEvidencias(Authentication authentication) {
        try {
            log.info("Obteniendo evidencias para técnico");
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            // Por ahora retornamos una lista vacía hasta implementar el servicio
            List<Object> evidencias = List.of();
            
            return ResponseEntity.ok(ApiResponse.success("Evidencias obtenidas", evidencias));
        } catch (Exception e) {
            log.error("Error obteniendo evidencias", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener evidencias: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener notificaciones del técnico
     * GET /api/tecnico/notificaciones
     */
    @GetMapping("/notificaciones")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerNotificaciones(Authentication authentication) {
        try {
            log.info("Obteniendo notificaciones para técnico");
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            // Por ahora retornamos una lista vacía hasta implementar el servicio
            List<Object> notificaciones = List.of();
            
            return ResponseEntity.ok(ApiResponse.success("Notificaciones obtenidas", notificaciones));
        } catch (Exception e) {
            log.error("Error obteniendo notificaciones", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener notificaciones: " + e.getMessage())
            );
        }
    }
}
