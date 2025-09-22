package com.example.demo.asignacion.controller;

import com.example.demo.asignacion.dto.request.AsignarTicketRequestDTO;
import com.example.demo.asignacion.dto.response.AsignacionResponseDTO;
import com.example.demo.asignacion.service.AsignacionService;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asignaciones")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AsignacionController {
    
    private final AsignacionService asignacionService;
    
    /**
     * Asignar ticket a técnico
     * POST /api/asignaciones/asignar
     */
    @PostMapping("/asignar")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> asignarTicket(
            @Valid @RequestBody AsignarTicketRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Asignando ticket {} a técnico {}", request.getTicketId(), request.getTecnicoId());
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailAsignador = userDetails.getEmail();
            
            AsignacionResponseDTO asignacion = asignacionService.asignarTicket(request, emailAsignador);
            
            return ResponseEntity.ok(asignacion);
        } catch (Exception e) {
            log.error("Error asignando ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al asignar ticket: " + e.getMessage())
            );
        }
    }
    
    /**
     * Reasignar ticket a otro técnico
     * PUT /api/asignaciones/reasignar
     */
    @PutMapping("/reasignar")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> reasignarTicket(
            @Valid @RequestBody AsignarTicketRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Reasignando ticket {} a técnico {}", request.getTicketId(), request.getTecnicoId());
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailAsignador = userDetails.getEmail();
            
            AsignacionResponseDTO asignacion = asignacionService.reasignarTicket(request, emailAsignador);
            
            return ResponseEntity.ok(asignacion);
        } catch (Exception e) {
            log.error("Error reasignando ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al reasignar ticket: " + e.getMessage())
            );
        }
    }
    
    /**
     * Desasignar ticket
     * DELETE /api/asignaciones/desasignar/{ticketId}
     */
    @DeleteMapping("/desasignar/{ticketId}")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> desasignarTicket(
            @PathVariable Long ticketId,
            Authentication authentication) {
        try {
            log.info("Desasignando ticket {}", ticketId);
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailDesasignador = userDetails.getEmail();
            
            AsignacionResponseDTO asignacion = asignacionService.desasignarTicket(ticketId, emailDesasignador);
            
            return ResponseEntity.ok(asignacion);
        } catch (Exception e) {
            log.error("Error desasignando ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al desasignar ticket: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener tickets asignados a un técnico
     * GET /api/asignaciones/tecnico/{tecnicoId}
     */
    @GetMapping("/tecnico/{tecnicoId}")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN', 'TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerTicketsAsignados(@PathVariable Long tecnicoId) {
        try {
            log.info("Obteniendo tickets asignados al técnico {}", tecnicoId);
            List<AsignacionResponseDTO> tickets = asignacionService.obtenerTicketsAsignados(tecnicoId);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error obteniendo tickets asignados", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener tickets asignados: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener tickets sin asignar
     * GET /api/asignaciones/sin-asignar
     */
    @GetMapping("/sin-asignar")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerTicketsSinAsignar() {
        try {
            log.info("Obteniendo tickets sin asignar");
            List<AsignacionResponseDTO> tickets = asignacionService.obtenerTicketsSinAsignar();
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error obteniendo tickets sin asignar", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener tickets sin asignar: " + e.getMessage())
            );
        }
    }
}


