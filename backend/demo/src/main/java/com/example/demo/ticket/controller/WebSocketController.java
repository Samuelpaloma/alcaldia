package com.example.demo.ticket.controller;

import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import com.example.demo.ticket.dto.request.ComentarioRequestDTO;
import com.example.demo.ticket.dto.response.ComentarioResponseDTO;
import com.example.demo.ticket.service.ComentarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@CrossOrigin(origins = "*")
public class WebSocketController {

    @Autowired
    private ComentarioService comentarioService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    /**
     * Endpoint REST para obtener comentarios de un ticket
     * GET /api/tickets/{ticketId}/comentarios
     */
    @GetMapping("/api/tickets/{ticketId}/comentarios")
    public ResponseEntity<?> obtenerComentarios(
            @PathVariable Long ticketId,
            Authentication authentication) {
        try {
            List<ComentarioResponseDTO> comentarios = comentarioService.obtenerComentariosPorTicket(ticketId);
            return ResponseEntity.ok(comentarios);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener comentarios: " + e.getMessage())
            );
        }
    }

    /**
     * Endpoint WebSocket para enviar mensajes en tiempo real
     * /app/chat.sendMessage
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ComentarioRequestDTO comentarioRequest, 
                           SimpMessageHeaderAccessor headerAccessor) {
        try {
            // Obtener información del usuario desde el header
            Authentication auth = (Authentication) headerAccessor.getUser();
            if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
                String emailUsuario = userDetails.getEmail();
                
                // Crear comentario
                ComentarioResponseDTO comentarioCreado = comentarioService.crearComentario(comentarioRequest, emailUsuario);
                
                // Enviar mensaje a todos los clientes conectados al ticket
                String destination = "/topic/ticket/" + comentarioRequest.getTicketId() + "/messages";
                messagingTemplate.convertAndSend(destination, comentarioCreado);
                
                System.out.println("Mensaje enviado a: " + destination);
            }
        } catch (Exception e) {
            System.err.println("Error procesando mensaje WebSocket: " + e.getMessage());
        }
    }
}



