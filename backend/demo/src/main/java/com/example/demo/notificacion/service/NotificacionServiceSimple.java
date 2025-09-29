package com.example.demo.notificacion.service;

import com.example.demo.notificacion.dto.NotificacionDTO;
import com.example.demo.notificacion.model.NotificacionMejorada;
import com.example.demo.notificacion.repository.NotificacionMejoradaRepository;
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
    private NotificacionMejoradaRepository notificacionMejoradaRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * Crear una notificación
     */
    @Transactional
    public NotificacionMejorada crearNotificacion(String tipo, String mensaje, List<Integer> destinatariosIds, 
                                                  Long ticketId, Integer usuarioActorId, String prioridad) {
        try {
            // Convertir lista de IDs a JSON
            String destinatariosJson = objectMapper.writeValueAsString(destinatariosIds);
            
            // Obtener información del usuario actor
            Usuario usuarioActor = usuarioRepository.findById(usuarioActorId.longValue()).orElse(null);
            String usuarioActorEmail = usuarioActor != null ? usuarioActor.getEmail() : null;
            String usuarioActorNombre = usuarioActor != null ? (usuarioActor.getNombre() + " " + usuarioActor.getApellido()) : null;
            
            NotificacionMejorada notificacion = new NotificacionMejorada();
            notificacion.setTipo(tipo);
            notificacion.setMensaje(mensaje);
            notificacion.setDestinatarios(destinatariosJson);
            notificacion.setTicketId(ticketId);
            notificacion.setUsuarioActorId(usuarioActorId.longValue());
            notificacion.setUsuarioActorEmail(usuarioActorEmail);
            notificacion.setUsuarioActorNombre(usuarioActorNombre);
            notificacion.setPrioridad(prioridad != null ? prioridad : NotificacionMejorada.PRIORIDAD_NORMAL);
            notificacion.setLeida(false);
            notificacion.setFechaCreacion(LocalDateTime.now());
            
            return notificacionMejoradaRepository.save(notificacion);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al crear notificación", e);
        }
    }
    
    /**
     * Crear notificación solo si el usuario tiene push activado (para mostrar en la app)
     */
    public NotificacionMejorada crearNotificacionSiPushActivo(String tipo, String mensaje, List<Integer> destinatariosIds, 
                                                              Long ticketId, Integer usuarioActorId, String prioridad) {
        System.out.println("🔔 [NOTIFICACION] ===== CREANDO NOTIFICACIÓN SI PUSH ACTIVO =====");
        System.out.println("🔔 [NOTIFICACION] Tipo: " + tipo);
        System.out.println("🔔 [NOTIFICACION] Mensaje: " + mensaje);
        System.out.println("🔔 [NOTIFICACION] Destinatarios: " + destinatariosIds);
        System.out.println("🔔 [NOTIFICACION] Ticket ID: " + ticketId);
        System.out.println("🔔 [NOTIFICACION] Usuario Actor ID: " + usuarioActorId);
        System.out.println("🔔 [NOTIFICACION] Prioridad: " + prioridad);
        
        // Por ahora, siempre crear la notificación (simplificado)
        NotificacionMejorada resultado = crearNotificacion(tipo, mensaje, destinatariosIds, ticketId, usuarioActorId, prioridad);
        
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
        
        List<NotificacionMejorada> notificaciones = notificacionMejoradaRepository.findByDestinatario(usuarioId.toString());
        System.out.println("📱 [NOTIFICACION] Notificaciones encontradas en BD: " + notificaciones.size());
        
        for (NotificacionMejorada notif : notificaciones) {
            System.out.println("📱 [NOTIFICACION] - ID: " + notif.getId() + ", Tipo: " + notif.getTipo() + ", Mensaje: " + notif.getMensaje() + ", Leída: " + notif.getLeida() + ", Fecha: " + notif.getFechaCreacion());
        }
        
        List<NotificacionDTO> resultado = notificaciones.stream()
            .map(this::convertirNotificacionMejoradaADTO)
            .collect(Collectors.toList());
            
        System.out.println("📱 [NOTIFICACION] DTOs convertidos: " + resultado.size());
        System.out.println("✅ [NOTIFICACION] ===== NOTIFICACIONES OBTENIDAS EXITOSAMENTE =====");
        
        return resultado;
    }
    
    /**
     * Obtener notificaciones no leídas de un usuario
     */
    public List<NotificacionDTO> getNotificacionesNoLeidasByUsuario(Long usuarioId) {
        List<NotificacionMejorada> notificaciones = notificacionMejoradaRepository.findByDestinatariosContainingAndLeidaFalse(usuarioId.toString());
        return notificaciones.stream()
            .map(this::convertirNotificacionMejoradaADTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Contar notificaciones no leídas
     */
    public long contarNotificacionesNoLeidas(Long usuarioId) {
        return notificacionMejoradaRepository.countByDestinatariosContainingAndLeidaFalse(usuarioId.toString());
    }
    
    /**
     * Marcar notificación como leída
     */
    public void marcarComoLeida(Long notificacionId, Long usuarioId) {
        System.out.println("🔔 [NOTIFICACION] ===== MARCANDO COMO LEÍDA =====");
        System.out.println("🔔 [NOTIFICACION] Notificación ID: " + notificacionId);
        System.out.println("🔔 [NOTIFICACION] Usuario ID: " + usuarioId);
        
        NotificacionMejorada notificacion = notificacionMejoradaRepository.findById(notificacionId)
            .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        
        System.out.println("🔔 [NOTIFICACION] Notificación encontrada: " + notificacion.getId());
        System.out.println("🔔 [NOTIFICACION] Destinatarios: " + notificacion.getDestinatarios());
        System.out.println("🔔 [NOTIFICACION] ¿Contiene usuario? " + notificacion.getDestinatarios().contains(usuarioId.toString()));
        
        if (notificacion.getDestinatarios().contains(usuarioId.toString())) {
            notificacion.setLeida(true);
            notificacion.setFechaLectura(LocalDateTime.now());
            notificacionMejoradaRepository.save(notificacion);
            System.out.println("✅ [NOTIFICACION] Notificación marcada como leída exitosamente");
        } else {
            System.out.println("❌ [NOTIFICACION] Usuario no es destinatario de esta notificación");
            throw new RuntimeException("Usuario no autorizado para marcar esta notificación como leída");
        }
    }
    
    private NotificacionDTO convertirNotificacionMejoradaADTO(NotificacionMejorada notificacion) {
        NotificacionDTO dto = new NotificacionDTO();
        dto.setId(notificacion.getId());
        dto.setTipo(notificacion.getTipo());
        dto.setMensaje(notificacion.getMensaje());
        dto.setLeida(notificacion.getLeida());
        dto.setFechaCreacion(notificacion.getFechaCreacion());
        dto.setFechaLeida(notificacion.getFechaLectura());
        dto.setTicketId(notificacion.getTicketId());
        dto.setUsuarioActorId(notificacion.getUsuarioActorId());
        dto.setPrioridad(notificacion.getPrioridad());
        
        // Campos adicionales
        dto.setTitulo(notificacion.getTipo());
        dto.setUsuarioId(notificacion.getUsuarioActorId());
        
        return dto;
    }
}
