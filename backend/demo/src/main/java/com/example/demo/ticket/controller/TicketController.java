package com.example.demo.ticket.controller;

import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import com.example.demo.ticket.dto.request.TicketRequestDTO;
import com.example.demo.ticket.dto.response.HistorialTicketResponseDTO;
import com.example.demo.ticket.dto.response.TicketResponseDTO;
import com.example.demo.ticket.dto.request.ComentarioRequestDTO;
import com.example.demo.ticket.dto.response.ComentarioResponseDTO;
import com.example.demo.ticket.service.TicketService;
import com.example.demo.ticket.service.ComentarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    @Autowired
    private TicketService ticketService;
    
    @Autowired
    private ComentarioService comentarioService;

    /**
     * Crear un nuevo ticket desde el formulario de funcionarios
     * POST /api/tickets/crear
     */
    @PostMapping("/crear")
    public ResponseEntity<?> crearTicket(
            @Valid @RequestBody TicketRequestDTO request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            TicketResponseDTO ticket = ticketService.crearTicket(request, emailUsuario);
            
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al crear el ticket: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener seguimiento de un ticket específico
     * GET /api/tickets/seguimiento/{ticketId}
     */
    @GetMapping("/seguimiento/{ticketId}")
    public ResponseEntity<?> obtenerSeguimiento(
            @PathVariable Long ticketId,
            Authentication authentication) {
        try {
            System.out.println("🔍 [CONTROLLER DEBUG] Iniciando obtenerSeguimiento para ticket: " + ticketId);
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            System.out.println("🔍 [CONTROLLER DEBUG] Email usuario: " + emailUsuario);
            
            TicketResponseDTO ticket = ticketService.obtenerTicketParaSeguimiento(ticketId, emailUsuario);
            System.out.println("🔍 [CONTROLLER DEBUG] Ticket obtenido exitosamente");
            
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            System.out.println("🔍 [CONTROLLER DEBUG] Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener el ticket: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener historial de tickets del usuario
     * GET /api/tickets/historial
     */
    @GetMapping("/historial")
    public ResponseEntity<?> obtenerHistorial(
            Authentication authentication,
            Pageable pageable) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            Page<HistorialTicketResponseDTO> historial = ticketService.obtenerHistorialTickets(emailUsuario, pageable);
            
            return ResponseEntity.ok(historial);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener el historial: " + e.getMessage())
            );
        }
    }

    /**
     * Agregar comentario a un ticket
     * POST /api/tickets/{ticketId}/comentarios
     */
    @PostMapping("/{ticketId}/comentarios")
    public ResponseEntity<?> agregarComentario(
            @PathVariable Long ticketId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            String mensaje = (String) request.get("mensaje");
            Long usuarioId = null;
            
            // Extraer usuario_id del request si está presente
            if (request.containsKey("usuario_id")) {
                Object usuarioIdObj = request.get("usuario_id");
                if (usuarioIdObj instanceof Number) {
                    usuarioId = ((Number) usuarioIdObj).longValue();
                } else if (usuarioIdObj instanceof String) {
                    try {
                        usuarioId = Long.parseLong((String) usuarioIdObj);
                    } catch (NumberFormatException e) {
                        // Ignorar si no se puede parsear
                    }
                }
            }
            
            if (mensaje == null || mensaje.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("El mensaje no puede estar vacío")
                );
            }
            
            // Crear DTO para el comentario
            ComentarioRequestDTO comentarioRequest = new ComentarioRequestDTO();
            comentarioRequest.setTicketId(ticketId);
            comentarioRequest.setMensaje(mensaje);
            comentarioRequest.setUsuarioId(usuarioId);
            
            // Crear comentario usando el servicio (esto enviará WebSocket automáticamente)
            ComentarioResponseDTO comentario = comentarioService.crearComentario(comentarioRequest, emailUsuario);
            
            return ResponseEntity.ok(comentario);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al agregar comentario: " + e.getMessage())
            );
        }
    }

}