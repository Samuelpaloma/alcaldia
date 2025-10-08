package com.example.demo.admin.controller;

import com.example.demo.admin.service.AdminService;
import com.example.demo.admin.dto.response.EstadisticasAdminResponseDTO;
import com.example.demo.ticket.dto.response.TicketResponseDTO;
import com.example.demo.shared.dto.ApiResponse;
import com.example.demo.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdminController {
    
    private final AdminService adminService;
    
    /**
     * Obtener todos los tickets con evidencias e historial
     * GET /api/admin/tickets
     */
    @GetMapping("/tickets")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerTodosLosTickets() {
        try {
            log.info("Obteniendo todos los tickets para admin");
            List<TicketResponseDTO> tickets = adminService.obtenerTodosLosTickets();
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error obteniendo todos los tickets", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener tickets: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener ticket detallado con evidencias e historial
     * GET /api/admin/tickets/{ticketId}
     */
    @GetMapping("/tickets/{ticketId}")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerTicketDetallado(@PathVariable Long ticketId) {
        try {
            log.info("Obteniendo ticket detallado {} para admin", ticketId);
            TicketResponseDTO ticket = adminService.obtenerTicketDetallado(ticketId);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            log.error("Error obteniendo ticket detallado", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener ticket: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener tickets por estado
     * GET /api/admin/tickets/estado/{estado}
     */
    @GetMapping("/tickets/estado/{estado}")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerTicketsPorEstado(@PathVariable String estado) {
        try {
            log.info("Obteniendo tickets por estado: {}", estado);
            List<TicketResponseDTO> tickets = adminService.obtenerTicketsPorEstado(estado);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error obteniendo tickets por estado", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener tickets: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener tickets sin asignar
     * GET /api/admin/tickets/sin-asignar
     */
    @GetMapping("/tickets/sin-asignar")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") 
    public ResponseEntity<?> obtenerTicketsSinAsignar() {
        try {
            log.info("Obteniendo tickets sin asignar");
            List<TicketResponseDTO> tickets = adminService.obtenerTicketsSinAsignar();
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error obteniendo tickets sin asignar", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener tickets sin asignar: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener tickets por técnico
     * GET /api/admin/tickets/tecnico/{tecnicoId}
     */
    @GetMapping("/tickets/tecnico/{tecnicoId}")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerTicketsPorTecnico(@PathVariable Long tecnicoId) {
        try {
            log.info("Obteniendo tickets del técnico: {}", tecnicoId);
            List<TicketResponseDTO> tickets = adminService.obtenerTicketsPorTecnico(tecnicoId);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error obteniendo tickets del técnico", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener tickets del técnico: " + e.getMessage())
            );
        }
    }
    
    /**
     * Cerrar ticket desde administrador
     * PUT /api/admin/tickets/{ticketId}/cerrar
     */
    @PutMapping("/tickets/{ticketId}/cerrar")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> cerrarTicket(
            @PathVariable Long ticketId,
            @RequestParam(value = "comentario", required = false) String comentario,
            Authentication authentication) {
        try {
            log.info("🔒 [ADMIN] Cerrando ticket {} desde administrador", ticketId);
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailAdmin = userDetails.getEmail();
            
            TicketResponseDTO ticket = adminService.cerrarTicket(ticketId, emailAdmin, comentario);
            
            return ResponseEntity.ok(ApiResponse.success("Ticket cerrado exitosamente desde administrador", ticket));
        } catch (Exception e) {
            log.error("Error cerrando ticket desde admin", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al cerrar ticket: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener estadísticas generales
     * GET /api/admin/estadisticas
     */
    @GetMapping("/estadisticas")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerEstadisticasGenerales() {
        try {
            log.info("Obteniendo estadísticas generales");
            EstadisticasAdminResponseDTO estadisticas = adminService.obtenerEstadisticasGenerales();
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener estadísticas: " + e.getMessage())
            );
        }
    }
}
