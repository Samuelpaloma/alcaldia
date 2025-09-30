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
import java.util.Map;

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
    public void sendMessage(@Payload Map<String, Object> messageData, 
                           SimpMessageHeaderAccessor headerAccessor) {
        try {
            System.out.println("🔥🔥🔥 [WEBSOCKET] ===== MENSAJE RECIBIDO =====");
            System.out.println("🔥🔥🔥 [WEBSOCKET] Datos completos: " + messageData);
            System.out.println("🔥🔥🔥 [WEBSOCKET] Headers: " + headerAccessor.getMessageHeaders());
            System.out.println("🔥🔥🔥 [WEBSOCKET] User: " + headerAccessor.getUser());
            
            // Extraer datos del mensaje
            if (messageData == null || !messageData.containsKey("ticketId") || !messageData.containsKey("mensaje")) {
                System.err.println("❌ [WEBSOCKET] Datos de mensaje inválidos: " + messageData);
                return;
            }
            
            Long ticketId = Long.valueOf(messageData.get("ticketId").toString());
            String mensaje = messageData.get("mensaje").toString();
            
            System.out.println("🔥🔥🔥 [WEBSOCKET] Ticket ID: " + ticketId);
            System.out.println("🔥🔥🔥 [WEBSOCKET] Mensaje: " + mensaje);
            
            // Obtener información del usuario desde el header
            Authentication auth = (Authentication) headerAccessor.getUser();
            String emailUsuario = null;
            
            if (auth != null && auth.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
                emailUsuario = userDetails.getEmail();
                System.out.println("🔥🔥🔥 [WEBSOCKET] Usuario autenticado: " + emailUsuario);
                System.out.println("🔥🔥🔥 [WEBSOCKET] Tipo de usuario: " + userDetails.getTipoUsuario());
            } else {
                System.err.println("❌❌❌ [WEBSOCKET] ERROR: No se pudo obtener información del usuario autenticado");
                System.err.println("❌❌❌ [WEBSOCKET] Auth: " + auth);
                System.err.println("❌❌❌ [WEBSOCKET] Principal: " + (auth != null ? auth.getPrincipal() : "null"));
                return; // No procesar el mensaje si no hay autenticación
            }
            
            // Crear DTO para el comentario
            ComentarioRequestDTO comentarioRequest = new ComentarioRequestDTO();
            comentarioRequest.setTicketId(ticketId);
            comentarioRequest.setMensaje(mensaje);
            
            System.out.println("🔥🔥🔥 [WEBSOCKET] Creando comentario...");
            // Crear comentario usando el servicio
            ComentarioResponseDTO comentarioCreado = comentarioService.crearComentario(comentarioRequest, emailUsuario);
            System.out.println("🔥🔥🔥 [WEBSOCKET] Comentario creado exitosamente: " + comentarioCreado);
            
            // Enviar mensaje a todos los clientes conectados al ticket
            String destination = "/topic/ticket/" + ticketId + "/messages";
            System.out.println("🔥🔥🔥 [WEBSOCKET] Enviando a destino: " + destination);
            System.out.println("🔥🔥🔥 [WEBSOCKET] Datos a enviar: " + comentarioCreado);
            
            messagingTemplate.convertAndSend(destination, comentarioCreado);
            System.out.println("✅✅✅ [WEBSOCKET] ===== MENSAJE ENVIADO EXITOSAMENTE =====");
            System.out.println("✅✅✅ [WEBSOCKET] Destino: " + destination);
            System.out.println("✅✅✅ [WEBSOCKET] ==========================================");
            
        } catch (Exception e) {
            System.err.println("❌❌❌ [WEBSOCKET] ===== ERROR CRÍTICO =====");
            System.err.println("❌❌❌ [WEBSOCKET] Error: " + e.getMessage());
            System.err.println("❌❌❌ [WEBSOCKET] Stack trace:");
            e.printStackTrace();
            System.err.println("❌❌❌ [WEBSOCKET] =========================");
        }
    }
}



