package com.example.demo.notificacion.controller;

import com.example.demo.notificacion.model.Notificacion;
import com.example.demo.notificacion.service.NotificacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class NotificacionWebSocketController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private NotificacionService notificacionService;
    
    
    @MessageMapping("/notification.send")
    @SendTo("/topic/notifications")
    public Notificacion sendNotification(Notificacion notificacion) {
        // Guardar la notificación en la base de datos
        notificacion.setFechaCreacion(LocalDateTime.now());
        notificacion.setLeida(false);
        
        // Valores por defecto para testing
        if (notificacion.getUsuarioId() == null) {
            notificacion.setUsuarioId(1L);
        }
        if (notificacion.getUsuarioEmail() == null) {
            notificacion.setUsuarioEmail("admin@test.com");
        }
        
        Notificacion savedNotificacion = notificacionService.crearNotificacion(notificacion);
        
        return savedNotificacion;
    }
    
    // Método para enviar notificaciones globales
    public void enviarNotificacionGlobal(Notificacion notificacion) {
        try {
            System.out.println("🔔 [DEBUG] Enviando notificación global:");
            System.out.println("   - Título: " + notificacion.getTitulo());
            System.out.println("   - Mensaje: " + notificacion.getMensaje());
            System.out.println("   - Usuario ID: " + notificacion.getUsuarioId());
            System.out.println("   - Usuario Email: " + notificacion.getUsuarioEmail());
            System.out.println("   - Ticket ID: " + notificacion.getTicketId());
            
            // Guardar en la base de datos
            notificacion.setFechaCreacion(LocalDateTime.now());
            notificacion.setLeida(false);
            
            // Valores por defecto para testing
            if (notificacion.getUsuarioId() == null) {
                notificacion.setUsuarioId(1L);
                System.out.println("   - Usuario ID establecido por defecto: 1L");
            }
            if (notificacion.getUsuarioEmail() == null) {
                notificacion.setUsuarioEmail("admin@test.com");
                System.out.println("   - Usuario Email establecido por defecto: admin@test.com");
            }
            
            System.out.println("   - Guardando en base de datos...");
            Notificacion savedNotificacion = notificacionService.crearNotificacion(notificacion);
            System.out.println("   - ✅ Notificación guardada con ID: " + savedNotificacion.getId());
            
            // Enviar via WebSocket
            System.out.println("   - Enviando via WebSocket a /topic/notifications...");
            messagingTemplate.convertAndSend("/topic/notifications", savedNotificacion);
            System.out.println("   - ✅ Notificación enviada via WebSocket");
            
        } catch (Exception e) {
            System.err.println("❌ Error enviando notificación: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // Método para enviar notificaciones específicas de ticket
    public void enviarNotificacionTicket(Long ticketId, String mensaje, String tipo) {
        try {
            Notificacion notificacion = new Notificacion();
            notificacion.setTitulo("Actualización de Ticket");
            notificacion.setMensaje(mensaje);
            notificacion.setTipo(tipo);
            notificacion.setTicketId(ticketId);
            notificacion.setUsuarioId(1L); // Valor por defecto para testing
            notificacion.setUsuarioEmail("admin@test.com"); // Valor por defecto para testing
            notificacion.setFechaCreacion(LocalDateTime.now());
            notificacion.setLeida(false);
            
            Notificacion savedNotificacion = notificacionService.crearNotificacion(notificacion);
            
            // Enviar via WebSocket
            messagingTemplate.convertAndSend("/topic/notifications", savedNotificacion);
            
        } catch (Exception e) {
            System.err.println("Error enviando notificación de ticket: " + e.getMessage());
        }
    }
}
            
