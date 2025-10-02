package com.example.demo.notificacion.service;

import com.example.demo.notificacion.model.Notification;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class NotificacionInteligenteService {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private NotificationService NotificationService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    /**
     * Crear notificación personalizada según el rol del destinatario
     */
    public void crearNotificacionPersonalizada(String tipo, Ticket ticket, Usuario actor, List<String> destinatarios) {
        System.out.println("🔔 [DEBUG] Creando notificación personalizada:");
        System.out.println("   - Tipo: " + tipo);
        System.out.println("   - Ticket ID: " + ticket.getId());
        System.out.println("   - Actor: " + actor.getFullName());
        System.out.println("   - Destinatarios: " + destinatarios);
        
        for (String destinatario : destinatarios) {
            String[] partes = destinatario.split(":");
            String tipoDestinatario = partes[0];
            String identificador = partes[1];
            
            // Obtener usuario destinatario
            Usuario usuarioDestinatario = obtenerUsuarioDestinatario(tipoDestinatario, identificador);
            if (usuarioDestinatario == null) {
                System.out.println("   - ❌ Usuario destinatario no encontrado: " + destinatario);
                continue;
            }
            
            // Crear mensaje personalizado según el rol
            String mensajePersonalizado = crearMensajePersonalizado(tipo, ticket, actor, usuarioDestinatario);
            
            // Crear notificación
            Notification notificacion = new Notification();
            notificacion.setType(tipo);
            notificacion.setMessage(mensajePersonalizado);
            notificacion.setRecipients("[\"" + destinatario + "\"]");
            notificacion.setTicketId(ticket.getId());
            notificacion.setActorUserId(actor.getId());
            notificacion.setActorUserEmail(actor.getEmail());
            notificacion.setActorUserName(actor.getFullName());
            notificacion.setPriority(determinarPrioridad(tipo));
            notificacion.setRead(false);
            notificacion.setCreatedAt(LocalDateTime.now());
            
            // Guardar en base de datos
            Notification notificacionGuardada = NotificationService.crearNotificacion(notificacion);
            
            // Enviar via WebSocket
            messagingTemplate.convertAndSend("/topic/notifications", notificacionGuardada);
            
            System.out.println("   - ✅ Notificación enviada a: " + usuarioDestinatario.getFullName());
        }
    }
    
    /**
     * Obtener usuario destinatario según tipo y identificador
     */
    private Usuario obtenerUsuarioDestinatario(String tipoDestinatario, String identificador) {
        if (tipoDestinatario.equals("rol")) {
            // Buscar por rol
            TipoUsuario tipoUsuario = TipoUsuario.valueOf(identificador.toUpperCase());
            List<Usuario> usuarios = usuarioRepository.findByUserType(tipoUsuario);
            return usuarios.isEmpty() ? null : usuarios.get(0); // Tomar el primero
        } else {
            // Buscar por email
            return usuarioRepository.findByEmail(identificador).orElse(null);
        }
    }
    
    /**
     * Crear mensaje personalizado según el rol del destinatario
     */
    private String crearMensajePersonalizado(String tipo, Ticket ticket, Usuario actor, Usuario destinatario) {
        String rolDestinatario = destinatario.getUserType().name().toLowerCase();
        
        switch (tipo) {
            case Notification.TYPE_TICKET_CREATED:
                if (rolDestinatario.equals("administrador")) {
                    return "Nuevo ticket creado por " + actor.getFullName() + " (#" + ticket.getId() + ")";
                }
                break;
                
            case Notification.TYPE_TICKET_ASSIGNED:
                if (rolDestinatario.equals("funcionario") || rolDestinatario.equals("cliente")) {
                    return "Tu ticket #" + ticket.getId() + " fue asignado al técnico " + actor.getFullName();
                } else if (rolDestinatario.equals("tecnico")) {
                    return "Se te asignó el ticket #" + ticket.getId() + " del cliente " + ticket.getCreatorName();
                } else if (rolDestinatario.equals("administrador")) {
                    return "Has asignado el ticket #" + ticket.getId() + " al técnico " + actor.getFullName();
                }
                break;
                
            case Notification.TYPE_TICKET_IN_PROGRESS:
                if (rolDestinatario.equals("funcionario") || rolDestinatario.equals("cliente")) {
                    return "Tu ticket #" + ticket.getId() + " está siendo procesado por " + actor.getFullName();
                } else if (rolDestinatario.equals("administrador")) {
                    return "El ticket #" + ticket.getId() + " del cliente " + ticket.getCreatorName() + " está siendo procesado por " + actor.getFullName();
                }
                break;
                
            case Notification.TYPE_TICKET_RESOLVED:
                if (rolDestinatario.equals("funcionario") || rolDestinatario.equals("cliente")) {
                    return "Tu ticket #" + ticket.getId() + " ha sido resuelto por " + actor.getFullName();
                } else if (rolDestinatario.equals("administrador")) {
                    return "El ticket #" + ticket.getId() + " del cliente " + ticket.getCreatorName() + " fue resuelto por " + actor.getFullName();
                }
                break;
                
            case Notification.TYPE_TICKET_CLOSED:
                if (rolDestinatario.equals("funcionario") || rolDestinatario.equals("cliente")) {
                    return "Tu ticket #" + ticket.getId() + " ha sido cerrado";
                } else if (rolDestinatario.equals("administrador")) {
                    return "El ticket #" + ticket.getId() + " del cliente " + ticket.getCreatorName() + " ha sido cerrado";
                }
                break;
                
            case Notification.TYPE_TICKET_ESCALATED:
                if (rolDestinatario.equals("funcionario") || rolDestinatario.equals("cliente")) {
                    return "Tu ticket #" + ticket.getId() + " ha sido escalado a un supervisor";
                } else if (rolDestinatario.equals("administrador")) {
                    return "El ticket #" + ticket.getId() + " del cliente " + ticket.getCreatorName() + " ha sido escalado";
                }
                break;
                
            case Notification.TYPE_COMMENT_ADDED:
                if (rolDestinatario.equals("funcionario") || rolDestinatario.equals("cliente")) {
                    return "Nuevo comentario en tu ticket #" + ticket.getId() + " por " + actor.getFullName();
                } else if (rolDestinatario.equals("tecnico")) {
                    return "Nuevo comentario en el ticket #" + ticket.getId() + " por " + actor.getFullName();
                } else if (rolDestinatario.equals("administrador")) {
                    return "Nuevo comentario en el ticket #" + ticket.getId() + " por " + actor.getFullName();
                }
                break;
                
            case Notification.TYPE_EVIDENCE_ADDED:
                if (rolDestinatario.equals("tecnico")) {
                    return "Nueva evidencia agregada al ticket #" + ticket.getId() + " por " + actor.getFullName();
                } else if (rolDestinatario.equals("administrador")) {
                    return "Nueva evidencia agregada al ticket #" + ticket.getId() + " por " + actor.getFullName();
                }
                break;
                
            case Notification.TYPE_SLA_EXPIRED:
                if (rolDestinatario.equals("tecnico")) {
                    return "⚠️ SLA vencido para el ticket #" + ticket.getId();
                } else if (rolDestinatario.equals("administrador")) {
                    return "⚠️ SLA vencido para el ticket #" + ticket.getId() + " del cliente " + ticket.getCreatorName();
                }
                break;
                
            case Notification.TYPE_SYSTEM_ALERT:
                if (rolDestinatario.equals("administrador")) {
                    return "🚨 Alerta del sistema: " + ticket.getSubject();
                }
                break;
        }
        
        return "Notificación del ticket #" + ticket.getId();
    }
    
    /**
     * Determinar prioridad según el tipo de notificación
     */
    private String determinarPrioridad(String tipo) {
        switch (tipo) {
            case Notification.TYPE_SLA_EXPIRED:
            case Notification.TYPE_SYSTEM_ALERT:
                return Notification.PRIORITY_CRITICAL;
            case Notification.TYPE_TICKET_ESCALATED:
                return Notification.PRIORITY_HIGH;
            default:
                return Notification.PRIORITY_NORMAL;
        }
    }
    
    /**
     * Métodos específicos para cada evento
     */
    
    public void notificarTicketCreado(Ticket ticket, Usuario funcionario) {
        List<String> destinatarios = new ArrayList<>();
        destinatarios.add("rol:administrador");
        
        crearNotificacionPersonalizada(
            Notification.TYPE_TICKET_CREATED,
            ticket,
            funcionario,
            destinatarios
        );
    }
    
    public void notificarTicketAsignado(Ticket ticket, Usuario admin, Usuario tecnico) {
        List<String> destinatarios = new ArrayList<>();
        destinatarios.add("rol:funcionario"); // Al cliente
        destinatarios.add("tecnico:" + tecnico.getEmail());
        destinatarios.add("administrador:" + admin.getEmail());
        
        crearNotificacionPersonalizada(
            Notification.TYPE_TICKET_ASSIGNED,
            ticket,
            admin,
            destinatarios
        );
    }
    
    public void notificarTicketResuelto(Ticket ticket, Usuario tecnico) {
        List<String> destinatarios = new ArrayList<>();
        destinatarios.add("rol:funcionario"); // Al cliente
        destinatarios.add("rol:administrador");
        
        crearNotificacionPersonalizada(
            Notification.TYPE_TICKET_RESOLVED,
            ticket,
            tecnico,
            destinatarios
        );
    }
    
    public void notificarTicketCerrado(Ticket ticket, Usuario actor) {
        List<String> destinatarios = new ArrayList<>();
        destinatarios.add("rol:funcionario"); // Al cliente
        destinatarios.add("rol:administrador");
        
        crearNotificacionPersonalizada(
            Notification.TYPE_TICKET_CLOSED,
            ticket,
            actor,
            destinatarios
        );
    }
    
    public void notificarComentarioAgregado(Ticket ticket, Usuario actor) {
        List<String> destinatarios = new ArrayList<>();
        
        // Determinar destinatarios según el rol del actor
        if (actor.getUserType() == TipoUsuario.TECNICO) {
            destinatarios.add("rol:funcionario"); // Cliente
            destinatarios.add("rol:administrador");
        } else if (actor.getUserType() == TipoUsuario.FUNCIONARIO) {
            destinatarios.add("rol:tecnico"); // Técnico asignado
            destinatarios.add("rol:administrador");
        } else if (actor.getUserType() == TipoUsuario.ADMINISTRADOR) {
            destinatarios.add("rol:funcionario"); // Cliente
            destinatarios.add("rol:tecnico"); // Técnico asignado
        }
        
        crearNotificacionPersonalizada(
            Notification.TYPE_COMMENT_ADDED,
            ticket,
            actor,
            destinatarios
        );
    }
    
    public void notificarSLAVencido(Ticket ticket) {
        List<String> destinatarios = new ArrayList<>();
        destinatarios.add("rol:tecnico");
        destinatarios.add("rol:administrador");
        
        // Crear notificación sin actor específico
        Notification notificacion = new Notification();
        notificacion.setType(Notification.TYPE_SLA_EXPIRED);
        notificacion.setMessage("⚠️ SLA vencido para el ticket #" + ticket.getId());
        notificacion.setRecipients("[\"rol:tecnico\", \"rol:administrador\"]");
        notificacion.setTicketId(ticket.getId());
        notificacion.setPriority(Notification.PRIORITY_CRITICAL);
        notificacion.setRead(false);
        notificacion.setCreatedAt(LocalDateTime.now());
        
        Notification notificacionGuardada = NotificationService.crearNotificacion(notificacion);
        messagingTemplate.convertAndSend("/topic/notifications", notificacionGuardada);
    }
}
