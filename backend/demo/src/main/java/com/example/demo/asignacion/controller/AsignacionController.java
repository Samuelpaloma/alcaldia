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
            log.info("=== INICIO ASIGNACIÓN ===");
            log.info("Request recibido: {}", request);
            log.info("Authentication: {}", authentication);
            log.info("Asignando ticket {} a técnico {}", request.getTicketId(), request.getTecnicoId());
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailAsignador = userDetails.getEmail();
            log.info("Email asignador: {}", emailAsignador);
            
            AsignacionResponseDTO asignacion = asignacionService.asignarTicket(request, emailAsignador);
            log.info("Asignación exitosa: {}", asignacion);
            
            return ResponseEntity.ok(asignacion);
        } catch (Exception e) {
            log.error("=== ERROR EN ASIGNACIÓN ===");
            log.error("Request que falló: {}", request);
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
            
            AsignacionResponseDTO asignacion = asignacionService.reasignarTicket(
                request.getTicketId(), 
                request.getTecnicoId(), 
                emailAsignador
            );
            
            return ResponseEntity.ok(asignacion);
        } catch (Exception e) {
            log.error("Error reasignando ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al reasignar ticket: " + e.getMessage())
            );
        }
    }
    
    /**
     * Escalar ticket a otro técnico (escalación por dificultad)
     * POST /api/asignaciones/escalar
     */
    @PostMapping("/escalar")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN', 'TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> escalarTicket(
            @Valid @RequestBody AsignarTicketRequestDTO request,
            Authentication authentication) {
        try {
            log.info("🚀 [CONTROLLER] ===== ESCALACIÓN INICIADA =====");
            log.info("🚀 [CONTROLLER] Ticket ID: {}", request.getTicketId());
            log.info("🚀 [CONTROLLER] Técnico ID: {}", request.getTecnicoId());
            log.info("🚀 [CONTROLLER] Comentario: {}", request.getComentario());
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailEscalador = userDetails.getEmail();
            
            log.info("🚀 [CONTROLLER] Email escalador: {}", emailEscalador);
            
            AsignacionResponseDTO asignacion = asignacionService.escalarTicket(
                request.getTicketId(), 
                request.getTecnicoId(), 
                emailEscalador, 
                request.getComentario()
            );
            
            return ResponseEntity.ok(asignacion);
        } catch (Exception e) {
            log.error("Error escalando ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al escalar ticket: " + e.getMessage())
            );
        }
    }
    
    /**
     * MÉTODO TEMPORAL: Corregir ticket escalado
     * POST /api/asignaciones/corregir-escalado/{ticketId}
     */
    @PostMapping("/corregir-escalado/{ticketId}")
    public ResponseEntity<?> corregirTicketEscalado(@PathVariable Long ticketId) {
        try {
            log.info("🔧 [CONTROLLER] Corrigiendo ticket escalado: {}", ticketId);
            asignacionService.corregirTicketEscalado(ticketId);
            return ResponseEntity.ok(ApiResponse.success("Ticket corregido exitosamente"));
        } catch (Exception e) {
            log.error("Error corrigiendo ticket escalado", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al corregir ticket: " + e.getMessage())
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
            
            asignacionService.desasignarTicket(ticketId, emailDesasignador);
            
            return ResponseEntity.ok(ApiResponse.success("Ticket desasignado correctamente"));
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
            List<AsignacionResponseDTO> tickets = asignacionService.obtenerAsignacionesActivasPorTecnico(tecnicoId);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error obteniendo tickets asignados", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener tickets asignados: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener asignaciones por ticket
     * GET /api/asignaciones/ticket/{ticketId}
     */
    @GetMapping("/ticket/{ticketId}")
    // @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERADMIN', 'TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerAsignacionesPorTicket(@PathVariable Long ticketId) {
        try {
            log.info("Obteniendo asignaciones del ticket {}", ticketId);
            List<AsignacionResponseDTO> asignaciones = asignacionService.obtenerAsignacionesPorTicket(ticketId);
            return ResponseEntity.ok(asignaciones);
        } catch (Exception e) {
            log.error("Error obteniendo asignaciones del ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener asignaciones del ticket: " + e.getMessage())
            );
        }
    }
    
    /**
     * Reabrir ticket cerrado
     * POST /api/asignaciones/reabrir/{ticketId}
     */
    @PostMapping("/reabrir/{ticketId}")
    // @PreAuthorize("hasAnyRole('CLIENTE', 'ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> reabrirTicket(
            @PathVariable Long ticketId,
            Authentication authentication) {
        try {
            log.info("Reabriendo ticket {}", ticketId);
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailReabridor = userDetails.getEmail();
            
            asignacionService.reabrirTicket(ticketId, emailReabridor);
            
            return ResponseEntity.ok(ApiResponse.success("Ticket reabierto correctamente"));
        } catch (Exception e) {
            log.error("Error reabriendo ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al reabrir ticket: " + e.getMessage())
            );
        }
    }
}

