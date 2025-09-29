package com.example.demo.notificacion.service;

import com.example.demo.notificacion.model.NotificacionMejorada;
import com.example.demo.notificacion.model.PreferenciasNotificacion;
import com.example.demo.notificacion.repository.NotificacionMejoradaRepository;
import com.example.demo.notificacion.repository.PreferenciasNotificacionRepository;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
public class ComentarioNotificationService {

    @Autowired
    private NotificacionMejoradaRepository notificacionMejoradaRepository;

    @Autowired
    private PreferenciasNotificacionRepository preferenciasNotificacionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    // Constantes para tipos de notificación
    public static final String TIPO_COMENTARIO_AGREGADO = "comentario_agregado";

    /**
     * Notifica a los usuarios relevantes cuando se agrega un comentario,
     * respetando las preferencias de notificación de cada usuario
     */
    public void notificarComentarioAgregado(Long ticketId, Long usuarioActorId) {
        try {
            log.info("🔔 [COMENTARIO NOTIFICATION] Iniciando notificación de comentario para ticket {}", ticketId);

            // Verificar que el ticket existe
            Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
            
            Usuario usuarioActor = usuarioRepository.findById(usuarioActorId)
                .orElseThrow(() -> new RuntimeException("Usuario actor no encontrado"));

            log.info("🔔 [COMENTARIO NOTIFICATION] Usuario actor: {} ({})", 
                usuarioActor.getNombre() + " " + usuarioActor.getApellido(), 
                usuarioActor.getTipoUsuario());

            // Determinar destinatarios según el rol del actor
            List<Usuario> destinatarios = new ArrayList<>();

            if (usuarioActor.getTipoUsuario() == TipoUsuario.TECNICO) {
                // Si es técnico, notificar al funcionario (creador del ticket) y admin
                if (ticket.getCreador() != null) {
                    destinatarios.add(ticket.getCreador());
                }
                // Agregar administradores
                destinatarios.addAll(usuarioRepository.findByTipoUsuario(TipoUsuario.ADMINISTRADOR));
                destinatarios.addAll(usuarioRepository.findByTipoUsuario(TipoUsuario.SUPERADMIN));
                
            } else if (usuarioActor.getTipoUsuario() == TipoUsuario.FUNCIONARIO) {
                // Si es funcionario, notificar al técnico asignado y admin
                if (ticket.getTecnicoAsignado() != null) {
                    destinatarios.add(ticket.getTecnicoAsignado());
                }
                // Agregar administradores
                destinatarios.addAll(usuarioRepository.findByTipoUsuario(TipoUsuario.ADMINISTRADOR));
                destinatarios.addAll(usuarioRepository.findByTipoUsuario(TipoUsuario.SUPERADMIN));
                
            } else if (usuarioActor.getTipoUsuario() == TipoUsuario.ADMINISTRADOR || 
                      usuarioActor.getTipoUsuario() == TipoUsuario.SUPERADMIN) {
                // Si es admin, notificar al funcionario y técnico
                if (ticket.getCreador() != null) {
                    destinatarios.add(ticket.getCreador());
                }
                if (ticket.getTecnicoAsignado() != null) {
                    destinatarios.add(ticket.getTecnicoAsignado());
                }
            }

            log.info("🔔 [COMENTARIO NOTIFICATION] Destinatarios encontrados: {}", destinatarios.size());
            for (Usuario dest : destinatarios) {
                log.info("🔔 [COMENTARIO NOTIFICATION] - {} ({})", dest.getEmail(), dest.getTipoUsuario());
            }

            // Crear notificaciones para cada destinatario (respetando preferencias)
            for (Usuario destinatario : destinatarios) {
                // No notificar al mismo usuario que envió el comentario
                if (destinatario.getIdUsuario().equals(usuarioActorId)) {
                    continue;
                }

                // Verificar preferencias de notificación
                if (debeNotificarComentario(destinatario.getIdUsuario())) {
                    String mensaje = crearMensajeComentario(usuarioActor, ticketId, destinatario.getTipoUsuario());
                    
                    crearNotificacionPersonalizada(
                        TIPO_COMENTARIO_AGREGADO,
                        mensaje,
                        destinatario,
                        ticketId,
                        usuarioActor
                    );
                    
                    log.info("🔔 [COMENTARIO NOTIFICATION] Notificación enviada a: {} ({})", 
                        destinatario.getEmail(), destinatario.getTipoUsuario());
                } else {
                    log.info("🔔 [COMENTARIO NOTIFICATION] Notificación omitida para: {} (preferencias desactivadas)", 
                        destinatario.getEmail());
                }
            }

        } catch (Exception e) {
            log.error("❌ [COMENTARIO NOTIFICATION] Error creando notificaciones de comentario", e);
        }
    }

    /**
     * Verifica si debe enviar notificación de comentario según las preferencias del usuario
     */
    private boolean debeNotificarComentario(Long usuarioId) {
        try {
            Optional<PreferenciasNotificacion> preferenciasOpt = 
                preferenciasNotificacionRepository.findByUsuarioId(usuarioId);
            
            if (preferenciasOpt.isPresent()) {
                PreferenciasNotificacion preferencias = preferenciasOpt.get();
                return preferencias.getNotificacionesComentarios() && 
                       (preferencias.getPushActivo() || preferencias.getEmailActivo());
            }
            
            // Si no hay preferencias, usar valores por defecto (notificaciones activas)
            log.info("🔔 [COMENTARIO NOTIFICATION] No hay preferencias para usuario {}, usando valores por defecto", usuarioId);
            return true;
            
        } catch (Exception e) {
            log.error("❌ [COMENTARIO NOTIFICATION] Error verificando preferencias para usuario {}", usuarioId, e);
            return true; // En caso de error, enviar notificación
        }
    }

    /**
     * Crea el mensaje personalizado según el rol del destinatario
     */
    private String crearMensajeComentario(Usuario usuarioActor, Long ticketId, TipoUsuario tipoDestinatario) {
        String nombreActor = usuarioActor.getNombre() + " " + usuarioActor.getApellido();
        
        switch (tipoDestinatario) {
            case FUNCIONARIO:
                return String.format("El %s %s agregó un comentario a tu ticket #%d", 
                    usuarioActor.getTipoUsuario().name().toLowerCase(), nombreActor, ticketId);
            case TECNICO:
                return String.format("El %s %s agregó un comentario al ticket #%d que tienes asignado", 
                    usuarioActor.getTipoUsuario().name().toLowerCase(), nombreActor, ticketId);
            case ADMINISTRADOR:
            case SUPERADMIN:
                return String.format("El %s %s agregó un comentario al ticket #%d", 
                    usuarioActor.getTipoUsuario().name().toLowerCase(), nombreActor, ticketId);
            default:
                return String.format("Nuevo comentario en el ticket #%d por %s", ticketId, nombreActor);
        }
    }

    /**
     * Crea una notificación personalizada para un usuario específico
     */
    private void crearNotificacionPersonalizada(String tipo, String mensaje, Usuario destinatario, 
                                               Long ticketId, Usuario usuarioActor) {
        try {
            // Crear notificación en base de datos
            NotificacionMejorada notificacion = new NotificacionMejorada();
            notificacion.setTipo(tipo);
            notificacion.setMensaje(mensaje);
            notificacion.setDestinatarios(destinatario.getEmail());
            notificacion.setTicketId(ticketId);
            notificacion.setUsuarioActorId(usuarioActor.getIdUsuario());
            notificacion.setUsuarioActorEmail(usuarioActor.getEmail());
            notificacion.setUsuarioActorNombre(usuarioActor.getNombre() + " " + usuarioActor.getApellido());
            notificacion.setPrioridad("normal");
            notificacion.setLeida(false);
            notificacion.setFechaCreacion(LocalDateTime.now());

            // Guardar en base de datos
            NotificacionMejorada savedNotificacion = notificacionMejoradaRepository.save(notificacion);

            // Enviar por WebSocket
            enviarNotificacionWebSocket(savedNotificacion, destinatario);

            log.info("✅ [COMENTARIO NOTIFICATION] Notificación creada con ID: {}", savedNotificacion.getId());

        } catch (Exception e) {
            log.error("❌ [COMENTARIO NOTIFICATION] Error creando notificación personalizada", e);
        }
    }

    /**
     * Envía la notificación por WebSocket
     */
    private void enviarNotificacionWebSocket(NotificacionMejorada notificacion, Usuario destinatario) {
        try {
            Map<String, Object> notificacionWebSocket = new HashMap<>();
            notificacionWebSocket.put("id", notificacion.getId());
            notificacionWebSocket.put("tipo", notificacion.getTipo());
            notificacionWebSocket.put("mensaje", notificacion.getMensaje());
            notificacionWebSocket.put("destinatarios", destinatario.getEmail());
            notificacionWebSocket.put("ticketId", notificacion.getTicketId());
            notificacionWebSocket.put("usuarioActorNombre", notificacion.getUsuarioActorNombre());
            notificacionWebSocket.put("prioridad", notificacion.getPrioridad());
            notificacionWebSocket.put("leida", false);
            notificacionWebSocket.put("fechaCreacion", notificacion.getFechaCreacion());

            // Enviar por WebSocket global
            messagingTemplate.convertAndSend("/topic/notifications", notificacionWebSocket);
            
            log.info("🔔 [COMENTARIO NOTIFICATION] Notificación WebSocket enviada a: {}", destinatario.getEmail());

        } catch (Exception e) {
            log.error("❌ [COMENTARIO NOTIFICATION] Error enviando notificación WebSocket", e);
        }
    }
}
