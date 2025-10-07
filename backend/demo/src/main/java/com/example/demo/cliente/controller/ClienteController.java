package com.example.demo.cliente.controller;

import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import com.example.demo.ticket.dto.response.TicketResponseDTO;
import com.example.demo.ticket.service.TicketService;
import com.example.demo.ticket.service.ComentarioService;
import com.example.demo.ticket.dto.request.ComentarioRequestDTO;
import com.example.demo.ticket.dto.response.ComentarioResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cliente")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ClienteController {

    private final TicketService ticketService;
    private final ComentarioService comentarioService;

    /**
     * Obtener tickets del cliente autenticado
     * GET /api/cliente/tickets
     */
    @GetMapping("/tickets")
    public ResponseEntity<?> obtenerTicketsCliente(Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            
            log.info("Obteniendo tickets para cliente: {}", emailUsuario);
            List<TicketResponseDTO> tickets = ticketService.obtenerTicketsPorUsuario(emailUsuario);
            
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error obteniendo tickets del cliente", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener tickets: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener seguimiento de un ticket específico del cliente
     * GET /api/cliente/tickets/seguimiento/{ticketId}
     */
    @GetMapping("/tickets/seguimiento/{ticketId}")
    public ResponseEntity<?> obtenerSeguimientoTicket(
            @PathVariable Long ticketId,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            
            log.info("Obteniendo seguimiento del ticket {} para cliente: {}", ticketId, emailUsuario);
            TicketResponseDTO ticket = ticketService.obtenerSeguimientoTicket(ticketId, emailUsuario);
            
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            log.error("Error obteniendo seguimiento del ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener seguimiento: " + e.getMessage())
            );
        }
    }

    /**
     * Responder a la resolución de un ticket (aceptar o rechazar)
     * POST /api/cliente/tickets/responder-resolucion
     */
    @PostMapping("/tickets/responder-resolucion")
    public ResponseEntity<?> responderResolucionTicket(
            @Valid @RequestBody ResponderResolucionRequest request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            
            log.info("Cliente {} respondiendo resolución del ticket {}: {}", 
                emailUsuario, request.getTicketId(), request.getAccion());
            
            ticketService.responderResolucionTicket(
                request.getTicketId(), 
                request.getAccion(), 
                request.getComentario(),
                emailUsuario
            );
            
            return ResponseEntity.ok(ApiResponse.success("Respuesta registrada exitosamente"));
        } catch (Exception e) {
            log.error("Error respondiendo resolución del ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al responder resolución: " + e.getMessage())
            );
        }
    }

    /**
     * Agregar comentario a un ticket
     * POST /api/cliente/tickets/{ticketId}/comentarios
     */
    @PostMapping("/tickets/{ticketId}/comentarios")
    public ResponseEntity<?> agregarComentario(
            @PathVariable Long ticketId,
            @Valid @RequestBody ComentarioRequestDTO request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            
            log.info("Cliente {} agregando comentario al ticket {}", emailUsuario, ticketId);
            
            ComentarioResponseDTO comentario = comentarioService.crearComentario(
                request, 
                emailUsuario
            );
            
            return ResponseEntity.ok(comentario);
        } catch (Exception e) {
            log.error("Error agregando comentario", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al agregar comentario: " + e.getMessage())
            );
        }
    }

    /**
     * DTO para la respuesta de resolución
     */
    public static class ResponderResolucionRequest {
        private Long ticketId;
        private String accion; // "CONFIRMAR" o "RECHAZAR"
        private String comentario;

        // Getters y setters
        public Long getTicketId() {
            return ticketId;
        }

        public void setTicketId(Long ticketId) {
            this.ticketId = ticketId;
        }

        public String getAccion() {
            return accion;
        }

        public void setAccion(String accion) {
            this.accion = accion;
        }

        public String getComentario() {
            return comentario;
        }

        public void setComentario(String comentario) {
            this.comentario = comentario;
        }
    }
}
