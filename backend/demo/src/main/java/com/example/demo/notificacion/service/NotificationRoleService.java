package com.example.demo.notificacion.service;

import com.example.demo.notificacion.model.Notification;
import com.example.demo.notificacion.repository.NotificationRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class NotificationRoleService {

    @Autowired
    private NotificationRepository NotificationRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    // Constantes para tipos de notificación
    public static final String TYPE_TICKET_CREATED = "ticket_creado";
    public static final String TIPO_TICKET_ASIGNADO = "ticket_asignado";
    public static final String TIPO_TICKET_EN_PROCESO = "ticket_en_proceso";
    public static final String TIPO_TICKET_RESUELTO = "ticket_resuelto";
    public static final String TIPO_TICKET_CERRADO = "ticket_cerrado";
    public static final String TIPO_COMENTARIO_AGREGADO = "comentario_agregado";
    public static final String TIPO_TICKET_ESCALADO = "ticket_escalado";
    
    // Constantes para notificaciones de SLA
    public static final String TIPO_SLA_VENCIDO = "sla_vencido";
    public static final String TIPO_SLA_PROXIMO_VENCER = "sla_proximo_vencer";
    public static final String TIPO_ALERTA_SLA = "alerta_sla";

    // Constantes para roles
    public static final String ROL_FUNCIONARIO = "funcionario";
    public static final String ROL_TECNICO = "tecnico";
    public static final String ROL_ADMINISTRADOR = "administrador";

    /**
     * Crea notificaciones diferenciadas por rol para la creación de un ticket
     */
    public void notificarCreacionTicket(Long ticketId, Long usuarioActorId) {
        try {
            // Verificar que el ticket existe
            ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
            
            Usuario usuarioActor = usuarioRepository.findById(usuarioActorId)
                .orElseThrow(() -> new RuntimeException("Usuario actor no encontrado"));

            // Notificación para administradores
            List<String> destinatariosAdmin = Arrays.asList("rol:administrador");
            String mensajeAdmin = String.format("Nuevo ticket creado por %s (#%d)", 
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(), ticketId);
            
            crearNotificacion(
                TYPE_TICKET_CREATED,
                mensajeAdmin,
                destinatariosAdmin,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                "normal"
            );

        } catch (Exception e) {
            System.err.println("Error creando notificaciones de creación de ticket: " + e.getMessage());
        }
    }

    /**
     * Crea notificaciones diferenciadas por rol para la asignación de un ticket
     */
    public void notificarAsignacionTicket(Long ticketId, Long usuarioActorId, Long tecnicoId) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
            
            Usuario usuarioActor = usuarioRepository.findById(usuarioActorId)
                .orElseThrow(() -> new RuntimeException("Usuario actor no encontrado"));
            
            Usuario tecnico = usuarioRepository.findById(tecnicoId)
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));

            // Notificación para el funcionario (creador del ticket)
            String mensajeFuncionario = String.format("Tu ticket #%d fue asignado al técnico %s", 
                ticketId, tecnico.getFullName() + " " + tecnico.getLastName());
            
            List<String> destinatariosFuncionario = Arrays.asList(
                "funcionario:" + ticket.getCreatorEmail()
            );
            
            crearNotificacion(
                TIPO_TICKET_ASIGNADO,
                mensajeFuncionario,
                destinatariosFuncionario,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                "normal"
            );

            // Notificación para el técnico asignado
            String mensajeTecnico = String.format("Se te asignó el ticket #%d del funcionario %s", 
                ticketId, ticket.getCreatorName());
            
            List<String> destinatariosTecnico = Arrays.asList(
                "tecnico:" + tecnico.getEmail()
            );
            
            crearNotificacion(
                TIPO_TICKET_ASIGNADO,
                mensajeTecnico,
                destinatariosTecnico,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                "normal"
            );

            // Notificación para administradores
            String mensajeAdmin = String.format("Has asignado el ticket #%d del funcionario %s al técnico %s", 
                ticketId, ticket.getCreatorName(), tecnico.getFullName() + " " + tecnico.getLastName());
            
            List<String> destinatariosAdmin = Arrays.asList("rol:administrador");
            
            crearNotificacion(
                TIPO_TICKET_ASIGNADO,
                mensajeAdmin,
                destinatariosAdmin,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                "normal"
            );

        } catch (Exception e) {
            System.err.println("Error creando notificaciones de asignación de ticket: " + e.getMessage());
        }
    }

    /**
     * Crea notificaciones diferenciadas por rol para la resolución de un ticket
     */
    public void notificarResolucionTicket(Long ticketId, Long usuarioActorId) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
            
            Usuario usuarioActor = usuarioRepository.findById(usuarioActorId)
                .orElseThrow(() -> new RuntimeException("Usuario actor no encontrado"));

            // Notificación para el funcionario (creador del ticket)
            String mensajeFuncionario = String.format("Tu ticket #%d ha sido resuelto por %s", 
                ticketId, usuarioActor.getFullName() + " " + usuarioActor.getLastName());
            
            List<String> destinatariosFuncionario = Arrays.asList(
                "funcionario:" + ticket.getCreatorEmail()
            );
            
            crearNotificacion(
                TIPO_TICKET_RESUELTO,
                mensajeFuncionario,
                destinatariosFuncionario,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                "normal"
            );

            // Notificación para administradores
            String mensajeAdmin = String.format("El ticket #%d del funcionario %s fue resuelto por %s", 
                ticketId, ticket.getCreatorName(), usuarioActor.getFullName() + " " + usuarioActor.getLastName());
            
            List<String> destinatariosAdmin = Arrays.asList("rol:administrador");
            
            crearNotificacion(
                TIPO_TICKET_RESUELTO,
                mensajeAdmin,
                destinatariosAdmin,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                "normal"
            );

        } catch (Exception e) {
            System.err.println("Error creando notificaciones de resolución de ticket: " + e.getMessage());
        }
    }

    /**
     * Crea notificaciones diferenciadas por rol para el cierre de un ticket
     */
    public void notificarCierreTicket(Long ticketId, Long usuarioActorId) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
            
            Usuario usuarioActor = usuarioRepository.findById(usuarioActorId)
                .orElseThrow(() -> new RuntimeException("Usuario actor no encontrado"));

            // Notificación para el funcionario (creador del ticket)
            String mensajeFuncionario = String.format("Tu ticket #%d ha sido cerrado por %s", 
                ticketId, usuarioActor.getFullName() + " " + usuarioActor.getLastName());
            
            List<String> destinatariosFuncionario = Arrays.asList(
                "funcionario:" + ticket.getCreatorEmail()
            );
            
            crearNotificacion(
                TIPO_TICKET_CERRADO,
                mensajeFuncionario,
                destinatariosFuncionario,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                "normal"
            );

            // Notificación para administradores
            String mensajeAdmin = String.format("El ticket #%d del funcionario %s fue cerrado por %s", 
                ticketId, ticket.getCreatorName(), usuarioActor.getFullName() + " " + usuarioActor.getLastName());
            
            List<String> destinatariosAdmin = Arrays.asList("rol:administrador");
            
            crearNotificacion(
                TIPO_TICKET_CERRADO,
                mensajeAdmin,
                destinatariosAdmin,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                "normal"
            );

        } catch (Exception e) {
            System.err.println("Error creando notificaciones de cierre de ticket: " + e.getMessage());
        }
    }

    /**
     * Crea notificaciones diferenciadas por rol para cuando un ticket entra en proceso
     */
    public void notificarTicketEnProceso(Long ticketId, Long usuarioActorId) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
            
            Usuario usuarioActor = usuarioRepository.findById(usuarioActorId)
                .orElseThrow(() -> new RuntimeException("Usuario actor no encontrado"));

            // Notificación para el funcionario (creador del ticket)
            String mensajeFuncionario = String.format("Tu ticket #%d está siendo procesado por %s", 
                ticketId, usuarioActor.getFullName() + " " + usuarioActor.getLastName());
            
            List<String> destinatariosFuncionario = Arrays.asList(
                "funcionario:" + ticket.getCreatorEmail()
            );
            
            crearNotificacion(
                TIPO_TICKET_EN_PROCESO,
                mensajeFuncionario,
                destinatariosFuncionario,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                "normal"
            );

            // Notificación para administradores
            String mensajeAdmin = String.format("El ticket #%d del funcionario %s está siendo procesado por %s", 
                ticketId, ticket.getCreatorName(), usuarioActor.getFullName() + " " + usuarioActor.getLastName());
            
            List<String> destinatariosAdmin = Arrays.asList("rol:administrador");
            
            crearNotificacion(
                TIPO_TICKET_EN_PROCESO,
                mensajeAdmin,
                destinatariosAdmin,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                "normal"
            );

        } catch (Exception e) {
            System.err.println("Error creando notificaciones de ticket en proceso: " + e.getMessage());
        }
    }

    /**
     * Obtiene usuarios por rol
     */
    private List<String> getUsuariosPorRol(String rol) {
        TipoUsuario tipoUsuario;
        switch (rol) {
            case ROL_FUNCIONARIO:
                tipoUsuario = TipoUsuario.FUNCIONARIO;
                break;
            case ROL_TECNICO:
                tipoUsuario = TipoUsuario.TECNICO;
                break;
            case ROL_ADMINISTRADOR:
                tipoUsuario = TipoUsuario.ADMINISTRADOR;
                break;
            default:
                return new ArrayList<>();
        }
        
        List<Usuario> usuarios = usuarioRepository.findByUserTypeAndActive(tipoUsuario, true);
        List<String> destinatarios = new ArrayList<>();
        
        for (Usuario usuario : usuarios) {
            destinatarios.add(rol + ":" + usuario.getEmail());
        }
        
        return destinatarios;
    }

    /**
     * Crea notificaciones diferenciadas por rol para la adición de comentarios
     */
    public void notificarComentarioAgregado(Long ticketId, Long usuarioActorId) {
        try {
            // Verificar que el ticket existe
            Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
            
            Usuario usuarioActor = usuarioRepository.findById(usuarioActorId)
                .orElseThrow(() -> new RuntimeException("Usuario actor no encontrado"));

            // Determinar destinatarios según el rol del actor
            List<String> destinatarios = new ArrayList<>();
            String mensajeFuncionario = "";
            String mensajeTecnico = "";
            String mensajeAdmin = "";

            if (usuarioActor.getUserType() == TipoUsuario.TECNICO) {
                // Si es técnico, notificar al funcionario y admin
                destinatarios.add("rol:funcionario");
                destinatarios.add("rol:administrador");
                
                mensajeFuncionario = String.format("El técnico %s agregó un comentario al ticket #%d", 
                    usuarioActor.getFullName() + " " + usuarioActor.getLastName(), ticketId);
                mensajeAdmin = String.format("El técnico %s agregó un comentario al ticket #%d", 
                    usuarioActor.getFullName() + " " + usuarioActor.getLastName(), ticketId);
                
            } else if (usuarioActor.getUserType() == TipoUsuario.FUNCIONARIO) {
                // Si es funcionario, notificar al técnico y admin
                destinatarios.add("rol:tecnico");
                destinatarios.add("rol:administrador");
                
                mensajeTecnico = String.format("El funcionario %s agregó un comentario al ticket #%d", 
                    usuarioActor.getFullName() + " " + usuarioActor.getLastName(), ticketId);
                mensajeAdmin = String.format("El funcionario %s agregó un comentario al ticket #%d", 
                    usuarioActor.getFullName() + " " + usuarioActor.getLastName(), ticketId);
                
            } else if (usuarioActor.getUserType() == TipoUsuario.ADMINISTRADOR) {
                // Si es admin, notificar al funcionario y técnico
                destinatarios.add("rol:funcionario");
                destinatarios.add("rol:tecnico");
                
                mensajeFuncionario = String.format("El administrador %s agregó un comentario al ticket #%d", 
                    usuarioActor.getFullName() + " " + usuarioActor.getLastName(), ticketId);
                mensajeTecnico = String.format("El administrador %s agregó un comentario al ticket #%d", 
                    usuarioActor.getFullName() + " " + usuarioActor.getLastName(), ticketId);
            }

            // Crear notificaciones para cada destinatario
            for (String destinatario : destinatarios) {
                String mensaje = "";
                if (destinatario.equals("rol:funcionario")) {
                    mensaje = mensajeFuncionario;
                } else if (destinatario.equals("rol:tecnico")) {
                    mensaje = mensajeTecnico;
                } else if (destinatario.equals("rol:administrador")) {
                    mensaje = mensajeAdmin;
                }
                
                if (!mensaje.isEmpty()) {
                    crearNotificacion(
                        TIPO_COMENTARIO_AGREGADO,
                        mensaje,
                        Arrays.asList(destinatario),
                        ticketId,
                        usuarioActorId,
                        usuarioActor.getEmail(),
                        usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                        "normal"
                    );
                }
            }

        } catch (Exception e) {
            System.err.println("Error creando notificaciones de comentario: " + e.getMessage());
        }
    }

    /**
     * Crea notificaciones diferenciadas por rol para la escalación de un ticket
     */
    public void notificarEscalacionTicket(Long ticketId, Long usuarioActorId, Long tecnicoId) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
            
            Usuario usuarioActor = usuarioRepository.findById(usuarioActorId)
                .orElseThrow(() -> new RuntimeException("Usuario actor no encontrado"));
            
            Usuario tecnico = usuarioRepository.findById(tecnicoId)
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));

            // Notificación para el funcionario (creador del ticket)
            String mensajeFuncionario = String.format("Tu ticket #%d fue escalado al técnico %s", 
                ticketId, tecnico.getFullName() + " " + tecnico.getLastName());
            
            List<String> destinatariosFuncionario = Arrays.asList(
                "funcionario:" + ticket.getCreatorEmail()
            );
            
            crearNotificacion(
                TIPO_TICKET_ESCALADO,
                mensajeFuncionario,
                destinatariosFuncionario,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                "alta" // Prioridad alta para escalaciones
            );

            // Notificación para el técnico asignado
            String mensajeTecnico = String.format("Se te escaló el ticket #%d del funcionario %s", 
                ticketId, ticket.getCreatorName());
            
            List<String> destinatariosTecnico = Arrays.asList(
                "tecnico:" + tecnico.getEmail()
            );
            
            crearNotificacion(
                TIPO_TICKET_ESCALADO,
                mensajeTecnico,
                destinatariosTecnico,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                "alta" // Prioridad alta para escalaciones
            );

            // Notificación para administradores
            String mensajeAdmin = String.format("El ticket #%d del funcionario %s fue escalado al técnico %s", 
                ticketId, ticket.getCreatorName(), tecnico.getFullName() + " " + tecnico.getLastName());
            
            List<String> destinatariosAdmin = Arrays.asList("rol:administrador");
            
            crearNotificacion(
                TIPO_TICKET_ESCALADO,
                mensajeAdmin,
                destinatariosAdmin,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                "alta" // Prioridad alta para escalaciones
            );

        } catch (Exception e) {
            System.err.println("Error creando notificaciones de escalación de ticket: " + e.getMessage());
        }
    }

    /**
     * Crea notificaciones de SLA vencido
     */
    public void notificarEventoSLA(Long ticketId, Long usuarioDestinatarioId, String tipoEvento, String mensaje) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
            
            Usuario usuarioDestinatario = usuarioRepository.findById(usuarioDestinatarioId)
                .orElseThrow(() -> new RuntimeException("Usuario destinatario no encontrado"));

            // Determinar prioridad según el tipo de evento
            String prioridad = "normal";
            if (tipoEvento.equals(TIPO_SLA_VENCIDO)) {
                prioridad = "critica";
            } else if (tipoEvento.equals(TIPO_SLA_PROXIMO_VENCER)) {
                prioridad = "alta";
            }

            // Crear notificación específica para el usuario
            List<String> destinatarios = Arrays.asList(
                usuarioDestinatario.getUserType().toString().toLowerCase() + ":" + usuarioDestinatario.getEmail()
            );
            
            crearNotificacion(
                tipoEvento,
                mensaje,
                destinatarios,
                ticketId,
                null, // No hay usuario actor para eventos automáticos
                "sistema@alcaldia.com",
                "Sistema SLA",
                prioridad
            );

        } catch (Exception e) {
            System.err.println("Error creando notificación de SLA: " + e.getMessage());
        }
    }

    /**
     * Notifica a todos los administradores sobre eventos de SLA
     */
    public void notificarAdministradoresSLA(Long ticketId, String tipoEvento, String mensaje) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));

            // Determinar prioridad según el tipo de evento
            String prioridad = "normal";
            if (tipoEvento.equals(TIPO_SLA_VENCIDO)) {
                prioridad = "critica";
            } else if (tipoEvento.equals(TIPO_SLA_PROXIMO_VENCER)) {
                prioridad = "alta";
            }

            // Notificar a todos los administradores
            List<String> destinatarios = Arrays.asList("rol:administrador");
            
            crearNotificacion(
                tipoEvento,
                mensaje,
                destinatarios,
                ticketId,
                null, // No hay usuario actor para eventos automáticos
                "sistema@alcaldia.com",
                "Sistema SLA",
                prioridad
            );

        } catch (Exception e) {
            System.err.println("Error notificando administradores sobre SLA: " + e.getMessage());
        }
    }

    /**
     * Notifica a todos los técnicos sobre eventos de SLA
     */
    public void notificarTecnicosSLA(Long ticketId, String tipoEvento, String mensaje) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));

            // Determinar prioridad según el tipo de evento
            String prioridad = "normal";
            if (tipoEvento.equals(TIPO_SLA_VENCIDO)) {
                prioridad = "critica";
            } else if (tipoEvento.equals(TIPO_SLA_PROXIMO_VENCER)) {
                prioridad = "alta";
            }

            // Notificar a todos los técnicos
            List<String> destinatarios = Arrays.asList("rol:tecnico");
            
            crearNotificacion(
                tipoEvento,
                mensaje,
                destinatarios,
                ticketId,
                null, // No hay usuario actor para eventos automáticos
                "sistema@alcaldia.com",
                "Sistema SLA",
                prioridad
            );

        } catch (Exception e) {
            System.err.println("Error notificando técnicos sobre SLA: " + e.getMessage());
        }
    }

    /**
     * Notificar a un rol específico (para uso de otros servicios)
     */
    public void crearNotificacionParaRol(String tipo, String mensaje, String rol, Long ticketId, Long usuarioActorId, String prioridad) {
        try {
            Usuario usuarioActor = usuarioRepository.findById(usuarioActorId)
                .orElseThrow(() -> new RuntimeException("Usuario actor no encontrado"));
            
            List<String> destinatarios = Arrays.asList(rol);
            
            crearNotificacion(
                tipo,
                mensaje,
                destinatarios,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                prioridad
            );
        } catch (Exception e) {
            System.err.println("Error creando notificación para rol: " + e.getMessage());
        }
    }
    
    /**
     * Notificar a un usuario específico por email (para uso de otros servicios)
     */
    public void crearNotificacionParaUsuario(String tipo, String mensaje, String emailUsuario, Long ticketId, Long usuarioActorId, String prioridad) {
        try {
            Usuario usuarioActor = usuarioRepository.findById(usuarioActorId)
                .orElseThrow(() -> new RuntimeException("Usuario actor no encontrado"));
            
            // Determinar el tipo de usuario para el prefijo
            Usuario destinatario = usuarioRepository.findByEmail(emailUsuario).orElse(null);
            String prefijoDestinatario = "funcionario:"; // Por defecto
            
            if (destinatario != null) {
                if ("TECNICO".equals(destinatario.getUserType())) {
                    prefijoDestinatario = "tecnico:";
                } else if ("ADMINISTRADOR".equals(destinatario.getUserType()) || "SUPERADMIN".equals(destinatario.getUserType())) {
                    prefijoDestinatario = "administrador:";
                }
            }
            
            List<String> destinatarios = Arrays.asList(prefijoDestinatario + emailUsuario);
            
            crearNotificacion(
                tipo,
                mensaje,
                destinatarios,
                ticketId,
                usuarioActorId,
                usuarioActor.getEmail(),
                usuarioActor.getFullName() + " " + usuarioActor.getLastName(),
                prioridad
            );
        } catch (Exception e) {
            System.err.println("Error creando notificación para usuario: " + e.getMessage());
        }
    }

    /**
     * Crea una notificación y la envía por WebSocket
     */
    private void crearNotificacion(String tipo, String mensaje, List<String> destinatarios, 
                                 Long ticketId, Long usuarioActorId, String usuarioActorEmail, 
                                 String usuarioActorNombre, String prioridad) {
        try {
            Notification notificacion = new Notification();
            notificacion.setType(tipo);
            notificacion.setMessage(mensaje);
            notificacion.setRecipients(objectMapper.writeValueAsString(destinatarios));
            notificacion.setTicketId(ticketId);
            notificacion.setActorUserId(usuarioActorId);
            notificacion.setActorUserEmail(usuarioActorEmail);
            notificacion.setActorUserName(usuarioActorNombre);
            notificacion.setPriority(prioridad);
            notificacion.setRead(false);
            notificacion.setCreatedAt(LocalDateTime.now());

            // Guardar en base de datos
            Notification savedNotificacion = NotificationRepository.save(notificacion);

            // Enviar por WebSocket a cada destinatario
            for (String destinatario : destinatarios) {
                String[] partes = destinatario.split(":");
                String email = partes[1];
                
                // Enviar notificación personalizada por WebSocket
                Map<String, Object> notificacionWebSocket = new HashMap<>();
                notificacionWebSocket.put("id", savedNotificacion.getId());
                notificacionWebSocket.put("tipo", tipo);
                notificacionWebSocket.put("mensaje", mensaje);
                notificacionWebSocket.put("destinatarios", destinatarios);
                notificacionWebSocket.put("ticketId", ticketId);
                notificacionWebSocket.put("usuarioActorNombre", usuarioActorNombre);
                notificacionWebSocket.put("prioridad", prioridad);
                notificacionWebSocket.put("leida", false);
                notificacionWebSocket.put("fechaCreacion", savedNotificacion.getCreatedAt());

                // Enviar por WebSocket global (el frontend filtrará por usuario/rol)
                System.out.println("🔔 [DEBUG] Enviando notificación por WebSocket:");
                System.out.println("🔔 [DEBUG] - Canal: /topic/notifications");
                System.out.println("🔔 [DEBUG] - Mensaje: " + notificacionWebSocket);
                System.out.println("🔔 [DEBUG] - MessagingTemplate: " + (messagingTemplate != null ? "INYECTADO" : "NULL"));
                
                messagingTemplate.convertAndSend("/topic/notifications", notificacionWebSocket);
                
                System.out.println("🔔 [DEBUG] ✅ Notificación enviada por WebSocket exitosamente");
            }

        } catch (JsonProcessingException e) {
            System.err.println("Error serializando destinatarios: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error creando notificación: " + e.getMessage());
        }
    }
}
