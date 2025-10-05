package com.example.demo.cliente.controller;

import com.example.demo.shared.dto.ApiResponse;
import com.example.demo.ticket.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cliente")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ClienteController {

    private final TicketService ticketService;

    /**
     * Responder a una resolución de ticket
     * POST /api/cliente/tickets/responder-resolucion
     */
    @PostMapping("/tickets/responder-resolucion")
    public ResponseEntity<ApiResponse> responderResolucionTicket(
            @Valid @RequestBody ResponderResolucionRequest request) {
        try {
            log.info("Cliente respondiendo a resolución del ticket {} - Acción: {}", 
                request.getTicketId(), request.getAccion());
            
            ticketService.responderResolucionTicket(
                request.getTicketId(), 
                request.getAccion(), 
                request.getComentario()
            );
            
            String mensaje = request.getAccion().equals("CONFIRMAR") 
                ? "Ticket cerrado exitosamente" 
                : "Ticket reabierto para escalamiento";
            
            return ResponseEntity.ok(ApiResponse.success(mensaje));
            
        } catch (Exception e) {
            log.error("Error procesando respuesta del cliente para ticket {}: {}", 
                request.getTicketId(), e.getMessage());
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error procesando respuesta: " + e.getMessage())
            );
        }
    }

    /**
     * Request DTO para responder resolución
     */
    public static class ResponderResolucionRequest {
        private Long ticketId;
        private String accion; // "CONFIRMAR" o "RECHAZAR"
        private String comentario;

        // Getters y setters
        public Long getTicketId() { return ticketId; }
        public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
        
        public String getAccion() { return accion; }
        public void setAccion(String accion) { this.accion = accion; }
        
        public String getComentario() { return comentario; }
        public void setComentario(String comentario) { this.comentario = comentario; }
    }
}
