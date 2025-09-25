package com.example.demo.notificacion.service;

import com.example.demo.notificacion.model.NotificacionMejorada;
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
    private NotificacionMejoradaService notificacionMejoradaService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    /**
     * Crear notificación personalizada según el rol del destinatario
     */
    public void crearNotificacionPersonalizada(String tipo, Ticket ticket, Usuario actor, List<String> destinatarios) {
        System.out.println("🔔 [DEBUG] Creando notificación personalizada:");
        System.out.println("   - Tipo: " + tipo);
        System.out.println("   - Ticket ID: " + ticket.getId());
        System.out.println("   - Actor: " + actor.getNombreCompleto());
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
            NotificacionMejorada notificacion = new NotificacionMejorada();
            notificacion.setTipo(tipo);
            notificacion.setMensaje(mensajePersonalizado);
            notificacion.setDestinatarios("[\"" + destinatario + "\"]");
            notificacion.setTicketId(ticket.getId());
            notificacion.setUsuarioActorId(actor.getIdUsuario());
            notificacion.setUsuarioActorEmail(actor.getEmail());
            notificacion.setUsuarioActorNombre(actor.getNombreCompleto());
            notificacion.setPrioridad(determinarPrioridad(tipo));
            notificacion.setLeida(false);
            notificacion.setFechaCreacion(LocalDateTime.now());
            
            // Guardar en base de datos
            NotificacionMejorada notificacionGuardada = notificacionMejoradaService.crearNotificacion(notificacion);
            
            // Enviar via WebSocket
            messagingTemplate.convertAndSend("/topic/notifications", notificacionGuardada);
            
            System.out.println("   - ✅ Notificación enviada a: " + usuarioDestinatario.getNombreCompleto());
        }
    }
    
    /**
     * Obtener usuario destinatario según tipo y identificador
     */
    private Usuario obtenerUsuarioDestinatario(String tipoDestinatario, String identificador) {
        if (tipoDestinatario.equals("rol")) {
            // Buscar por rol
            TipoUsuario tipoUsuario = TipoUsuario.valueOf(identificador.toUpperCase());
            List<Usuario> usuarios = usuarioRepository.findByTipoUsuario(tipoUsuario);
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
        String rolDestinatario = destinatario.getTipoUsuario().name().toLowerCase();
        
        switch (tipo) {
            case NotificacionMejorada.TIPO_TICKET_CREADO:
                if (rolDestinatario.equals("administrador")) {
                    return "Nuevo ticket creado por " + actor.getNombreCompleto() + " (#" + ticket.getId() + ")";
                }
                break;
                
            case NotificacionMejorada.TIPO_TICKET_ASIGNADO:
                if (rolDestinatario.equals("funcionario") || rolDestinatario.equals("cliente")) {
                    return "Tu ticket #" + ticket.getId() + " fue asignado al técnico " + actor.getNombreCompleto();
                } else if (rolDestinatario.equals("tecnico")) {
                    return "Se te asignó el ticket #" + ticket.getId() + " del cliente " + ticket.getCreadorNombre();
                } else if (rolDestinatario.equals("administrador")) {
                    return "Has asignado el ticket #" + ticket.getId() + " al técnico " + actor.getNombreCompleto();
                }
                break;
                
            case NotificacionMejorada.TIPO_TICKET_EN_PROCESO:
                if (rolDestinatario.equals("funcionario") || rolDestinatario.equals("cliente")) {
                    return "Tu ticket #" + ticket.getId() + " está siendo procesado por " + actor.getNombreCompleto();
                } else if (rolDestinatario.equals("administrador")) {
                    return "El ticket #" + ticket.getId() + " del cliente " + ticket.getCreadorNombre() + " está siendo procesado por " + actor.getNombreCompleto();
                }
                break;
                
            case NotificacionMejorada.TIPO_TICKET_RESUELTO:
                if (rolDestinatario.equals("funcionario") || rolDestinatario.equals("cliente")) {
                    return "Tu ticket #" + ticket.getId() + " ha sido resuelto por " + actor.getNombreCompleto();
                } else if (rolDestinatario.equals("administrador")) {
                    return "El ticket #" + ticket.getId() + " del cliente " + ticket.getCreadorNombre() + " fue resuelto por " + actor.getNombreCompleto();
                }
                break;
                
            case NotificacionMejorada.TIPO_TICKET_CERRADO:
                if (rolDestinatario.equals("funcionario") || rolDestinatario.equals("cliente")) {
                    return "Tu ticket #" + ticket.getId() + " ha sido cerrado";
                } else if (rolDestinatario.equals("administrador")) {
                    return "El ticket #" + ticket.getId() + " del cliente " + ticket.getCreadorNombre() + " ha sido cerrado";
                }
                break;
                
            case NotificacionMejorada.TIPO_TICKET_ESCALADO:
                if (rolDestinatario.equals("funcionario") || rolDestinatario.equals("cliente")) {
                    return "Tu ticket #" + ticket.getId() + " ha sido escalado a un supervisor";
                } else if (rolDestinatario.equals("administrador")) {
                    return "El ticket #" + ticket.getId() + " del cliente " + ticket.getCreadorNombre() + " ha sido escalado";
                }
                break;
                
            case NotificacionMejorada.TIPO_COMENTARIO_AGREGADO:
                if (rolDestinatario.equals("funcionario") || rolDestinatario.equals("cliente")) {
                    return "Nuevo comentario en tu ticket #" + ticket.getId() + " por " + actor.getNombreCompleto();
                } else if (rolDestinatario.equals("tecnico")) {
                    return "Nuevo comentario en el ticket #" + ticket.getId() + " por " + actor.getNombreCompleto();
                } else if (rolDestinatario.equals("administrador")) {
                    return "Nuevo comentario en el ticket #" + ticket.getId() + " por " + actor.getNombreCompleto();
                }
                break;
                
            case NotificacionMejorada.TIPO_EVIDENCIA_AGREGADA:
                if (rolDestinatario.equals("tecnico")) {
                    return "Nueva evidencia agregada al ticket #" + ticket.getId() + " por " + actor.getNombreCompleto();
                } else if (rolDestinatario.equals("administrador")) {
                    return "Nueva evidencia agregada al ticket #" + ticket.getId() + " por " + actor.getNombreCompleto();
                }
                break;
                
            case NotificacionMejorada.TIPO_SLA_VENCIDO:
                if (rolDestinatario.equals("tecnico")) {
                    return "⚠️ SLA vencido para el ticket #" + ticket.getId();
                } else if (rolDestinatario.equals("administrador")) {
                    return "⚠️ SLA vencido para el ticket #" + ticket.getId() + " del cliente " + ticket.getCreadorNombre();
                }
                break;
                
            case NotificacionMejorada.TIPO_ALERTA_SISTEMA:
                if (rolDestinatario.equals("administrador")) {
                    return "🚨 Alerta del sistema: " + ticket.getAsunto();
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
            case NotificacionMejorada.TIPO_SLA_VENCIDO:
            case NotificacionMejorada.TIPO_ALERTA_SISTEMA:
                return NotificacionMejorada.PRIORIDAD_CRITICA;
            case NotificacionMejorada.TIPO_TICKET_ESCALADO:
                return NotificacionMejorada.PRIORIDAD_ALTA;
            default:
                return NotificacionMejorada.PRIORIDAD_NORMAL;
        }
    }
    
    /**
     * Métodos específicos para cada evento
     */
    
    public void notificarTicketCreado(Ticket ticket, Usuario funcionario) {
        List<String> destinatarios = new ArrayList<>();
        destinatarios.add("rol:administrador");
        
        crearNotificacionPersonalizada(
            NotificacionMejorada.TIPO_TICKET_CREADO,
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
            NotificacionMejorada.TIPO_TICKET_ASIGNADO,
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
            NotificacionMejorada.TIPO_TICKET_RESUELTO,
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
            NotificacionMejorada.TIPO_TICKET_CERRADO,
            ticket,
            actor,
            destinatarios
        );
    }
    
    public void notificarComentarioAgregado(Ticket ticket, Usuario actor) {
        List<String> destinatarios = new ArrayList<>();
        
        // Determinar destinatarios según el rol del actor
        if (actor.getTipoUsuario() == TipoUsuario.TECNICO) {
            destinatarios.add("rol:funcionario"); // Cliente
            destinatarios.add("rol:administrador");
        } else if (actor.getTipoUsuario() == TipoUsuario.FUNCIONARIO) {
            destinatarios.add("rol:tecnico"); // Técnico asignado
            destinatarios.add("rol:administrador");
        } else if (actor.getTipoUsuario() == TipoUsuario.ADMINISTRADOR) {
            destinatarios.add("rol:funcionario"); // Cliente
            destinatarios.add("rol:tecnico"); // Técnico asignado
        }
        
        crearNotificacionPersonalizada(
            NotificacionMejorada.TIPO_COMENTARIO_AGREGADO,
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
        NotificacionMejorada notificacion = new NotificacionMejorada();
        notificacion.setTipo(NotificacionMejorada.TIPO_SLA_VENCIDO);
        notificacion.setMensaje("⚠️ SLA vencido para el ticket #" + ticket.getId());
        notificacion.setDestinatarios("[\"rol:tecnico\", \"rol:administrador\"]");
        notificacion.setTicketId(ticket.getId());
        notificacion.setPrioridad(NotificacionMejorada.PRIORIDAD_CRITICA);
        notificacion.setLeida(false);
        notificacion.setFechaCreacion(LocalDateTime.now());
        
        NotificacionMejorada notificacionGuardada = notificacionMejoradaService.crearNotificacion(notificacion);
        messagingTemplate.convertAndSend("/topic/notifications", notificacionGuardada);
    }
}
