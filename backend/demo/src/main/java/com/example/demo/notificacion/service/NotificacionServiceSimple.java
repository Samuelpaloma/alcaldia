package com.example.demo.notificacion.service;

import com.example.demo.notificacion.dto.NotificacionDTO;
import com.example.demo.notificacion.model.Notification;
import com.example.demo.notificacion.repository.NotificationRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificacionServiceSimple {
    
    @Autowired
    private NotificationRepository NotificationRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * Crear una notificación
     */
    @Transactional
    public Notification crearNotificacion(String tipo, String mensaje, List<Integer> destinatariosIds, 
                                                  Long ticketId, Integer usuarioActorId, String prioridad) {
        try {
            // Convertir lista de IDs a JSON
            String destinatariosJson = objectMapper.writeValueAsString(destinatariosIds);
            
            // Obtener información del usuario actor
            Usuario usuarioActor = usuarioRepository.findById(usuarioActorId.longValue()).orElse(null);
            String usuarioActorEmail = usuarioActor != null ? usuarioActor.getEmail() : null;
            String usuarioActorNombre = usuarioActor != null ? (usuarioActor.getFullName() + " " + usuarioActor.getLastName()) : null;
            
            Notification notificacion = new Notification();
            notificacion.setType(tipo);
            notificacion.setMessage(mensaje);
            notificacion.setRecipients(destinatariosJson);
            notificacion.setTicketId(ticketId);
            notificacion.setActorUserId(usuarioActorId.longValue());
            notificacion.setActorUserEmail(usuarioActorEmail);
            notificacion.setActorUserName(usuarioActorNombre);
            notificacion.setPriority(prioridad != null ? prioridad : Notification.PRIORITY_NORMAL);
            notificacion.setRead(false);
            notificacion.setCreatedAt(LocalDateTime.now());
            
            return NotificationRepository.save(notificacion);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al crear notificación", e);
        }
    }
    
    /**
     * Crear notificación solo si el usuario tiene push activado (para mostrar en la app)
     */
    public Notification crearNotificacionSiPushActivo(String tipo, String mensaje, List<Integer> destinatariosIds, 
                                                              Long ticketId, Integer usuarioActorId, String prioridad) {
        System.out.println("🔔 [NOTIFICACION] ===== CREANDO NOTIFICACIÓN SI PUSH ACTIVO =====");
        System.out.println("🔔 [NOTIFICACION] Tipo: " + tipo);
        System.out.println("🔔 [NOTIFICACION] Mensaje: " + mensaje);
        System.out.println("🔔 [NOTIFICACION] Destinatarios: " + destinatariosIds);
        System.out.println("🔔 [NOTIFICACION] Ticket ID: " + ticketId);
        System.out.println("🔔 [NOTIFICACION] Usuario Actor ID: " + usuarioActorId);
        System.out.println("🔔 [NOTIFICACION] Prioridad: " + prioridad);
        
        // Por ahora, siempre crear la notificación (simplificado)
        Notification resultado = crearNotificacion(tipo, mensaje, destinatariosIds, ticketId, usuarioActorId, prioridad);
        
        if (resultado != null) {
            System.out.println("✅ [NOTIFICACION] Notificación creada exitosamente - ID: " + resultado.getId());
        } else {
            System.out.println("❌ [NOTIFICACION] Error: No se pudo crear la notificación");
        }
        
        return resultado;
    }
    
    /**
     * Obtener notificaciones de un usuario
     */
    public List<NotificacionDTO> getNotificacionesByUsuario(Long usuarioId) {
        System.out.println("📱 [NOTIFICACION] ===== OBTENIENDO NOTIFICACIONES PARA USUARIO =====");
        System.out.println("📱 [NOTIFICACION] Usuario ID: " + usuarioId);
        
        List<Notification> notificaciones = NotificationRepository.findByDestinatario(usuarioId.toString());
        System.out.println("📱 [NOTIFICACION] Notificaciones encontradas en BD: " + notificaciones.size());
        
        for (Notification notif : notificaciones) {
            System.out.println("📱 [NOTIFICACION] - ID: " + notif.getId() + ", Tipo: " + notif.getType() + ", Mensaje: " + notif.getMessage() + ", Leída: " + notif.getRead() + ", Fecha: " + notif.getCreatedAt());
        }
        
        List<NotificacionDTO> resultado = notificaciones.stream()
            .map(this::convertirNotificationADTO)
            .collect(Collectors.toList());
            
        System.out.println("📱 [NOTIFICACION] DTOs convertidos: " + resultado.size());
        System.out.println("✅ [NOTIFICACION] ===== NOTIFICACIONES OBTENIDAS EXITOSAMENTE =====");
        
        return resultado;
    }
    
    /**
     * Obtener notificaciones no leídas de un usuario
     */
    public List<NotificacionDTO> getNotificacionesNoLeidasByUsuario(Long usuarioId) {
        List<Notification> notificaciones = NotificationRepository.findByDestinatariosContainingAndLeidaFalse(usuarioId.toString());
        return notificaciones.stream()
            .map(this::convertirNotificationADTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Contar notificaciones no leídas
     */
    public long contarNotificacionesNoLeidas(Long usuarioId) {
        return NotificationRepository.countByDestinatariosContainingAndLeidaFalse(usuarioId.toString());
    }
    
    /**
     * Marcar notificación como leída
     */
    public void marcarComoLeida(Long notificacionId, Long usuarioId) {
        System.out.println("🔔 [NOTIFICACION] ===== MARCANDO COMO LEÍDA =====");
        System.out.println("🔔 [NOTIFICACION] Notificación ID: " + notificacionId);
        System.out.println("🔔 [NOTIFICACION] Usuario ID: " + usuarioId);
        
        Notification notificacion = NotificationRepository.findById(notificacionId)
            .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        
        System.out.println("🔔 [NOTIFICACION] Notificación encontrada: " + notificacion.getId());
        System.out.println("🔔 [NOTIFICACION] Destinatarios: " + notificacion.getRecipients());
        System.out.println("🔔 [NOTIFICACION] ¿Contiene usuario? " + notificacion.getRecipients().contains(usuarioId.toString()));
        
        if (notificacion.getRecipients().contains(usuarioId.toString())) {
            notificacion.setRead(true);
            notificacion.setReadAt(LocalDateTime.now());
            NotificationRepository.save(notificacion);
            System.out.println("✅ [NOTIFICACION] Notificación marcada como leída exitosamente");
        } else {
            System.out.println("❌ [NOTIFICACION] Usuario no es destinatario de esta notificación");
            throw new RuntimeException("Usuario no autorizado para marcar esta notificación como leída");
        }
    }
    
    private NotificacionDTO convertirNotificationADTO(Notification notificacion) {
        NotificacionDTO dto = new NotificacionDTO();
        dto.setId(notificacion.getId());
        dto.setTipo(notificacion.getType());
        dto.setMensaje(notificacion.getMessage());
        dto.setLeida(notificacion.getRead());
        dto.setFechaCreacion(notificacion.getCreatedAt());
        dto.setFechaLeida(notificacion.getReadAt());
        dto.setTicketId(notificacion.getTicketId());
        dto.setUsuarioActorId(notificacion.getActorUserId());
        dto.setPrioridad(notificacion.getPriority());
        
        // Campos adicionales
        dto.setTitulo(notificacion.getType());
        dto.setUsuarioId(notificacion.getActorUserId());
        
        return dto;
    }
}
