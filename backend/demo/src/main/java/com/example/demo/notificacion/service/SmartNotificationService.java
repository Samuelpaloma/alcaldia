package com.example.demo.notificacion.service;

import com.example.demo.notificacion.model.Notificacion;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SmartNotificationService {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private NotificacionService notificacionService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    // Notificar cuando un cliente crea un ticket
    public void notificarTicketCreado(Ticket ticket) {
        System.out.println("🔔 [DEBUG] SmartNotificationService.notificarTicketCreado()");
        System.out.println("   - Ticket ID: " + ticket.getId());
        System.out.println("   - Ticket Asunto: " + ticket.getSubject());
        System.out.println("   - Creador: " + ticket.getCreatorName());
        
        // Notificar a todos los administradores
        List<Usuario> admins = usuarioRepository.findByUserType(TipoUsuario.ADMINISTRADOR);
        System.out.println("   - Administradores encontrados: " + admins.size());
        
        for (Usuario admin : admins) {
            System.out.println("   - Notificando a admin: " + admin.getEmail());
            Notificacion notificacion = new Notificacion();
            notificacion.setTitulo("📝 Nuevo Ticket Creado");
            notificacion.setMensaje("El cliente " + ticket.getCreatorName() + " ha creado el ticket #" + ticket.getId() + 
                                  "\n📋 Asunto: " + ticket.getSubject() + 
                                  "\n🏷️ Prioridad: " + (ticket.getPriority() != null ? ticket.getPriority() : "Normal"));
            notificacion.setTipo("info");
            notificacion.setTicketId(ticket.getId());
            notificacion.setUsuarioId(admin.getId());
            notificacion.setUsuarioEmail(admin.getEmail());
            notificacion.setFechaCreacion(LocalDateTime.now());
            notificacion.setLeida(false);
            
            // Guardar en la base de datos
            Notificacion savedNotificacion = notificacionService.crearNotificacion(notificacion);
            
            // Enviar via WebSocket
            messagingTemplate.convertAndSend("/topic/notifications", savedNotificacion);
        }
    }
    
    // Notificar cuando un admin asigna un ticket
    public void notificarTicketAsignado(Ticket ticket, Usuario tecnico, Usuario admin) {
        // Notificar al técnico asignado
        Notificacion notifTecnico = new Notificacion();
        notifTecnico.setTitulo("🎯 Ticket Asignado");
        notifTecnico.setMensaje("Se te ha asignado el ticket #" + ticket.getId() + 
                              "\n📋 Asunto: " + ticket.getSubject() + 
                              "\n👤 Cliente: " + ticket.getCreatorName() +
                              "\n👨‍💼 Asignado por: " + admin.getFullName());
        notifTecnico.setTipo("success");
        notifTecnico.setTicketId(ticket.getId());
        notifTecnico.setUsuarioId(tecnico.getId());
        notifTecnico.setUsuarioEmail(tecnico.getEmail());
        notifTecnico.setFechaCreacion(LocalDateTime.now());
        notifTecnico.setLeida(false);
        
        // Guardar en la base de datos
        Notificacion savedNotifTecnico = notificacionService.crearNotificacion(notifTecnico);
        
        // Enviar via WebSocket
        messagingTemplate.convertAndSend("/topic/notifications", savedNotifTecnico);
        
        // Notificar al cliente
        if (ticket.getCreatorEmail() != null) {
            Usuario cliente = usuarioRepository.findByEmail(ticket.getCreatorEmail()).orElse(null);
            if (cliente != null) {
                Notificacion notifCliente = new Notificacion();
                notifCliente.setTitulo("✅ Ticket Asignado");
                notifCliente.setMensaje("Tu ticket #" + ticket.getId() + " ha sido asignado" +
                                      "\n👨‍🔧 Técnico: " + tecnico.getFullName() + " " + tecnico.getLastName() +
                                      "\n📋 Asunto: " + ticket.getSubject());
                notifCliente.setTipo("success");
                notifCliente.setTicketId(ticket.getId());
                notifCliente.setUsuarioId(cliente.getId());
                notifCliente.setUsuarioEmail(cliente.getEmail());
                notifCliente.setFechaCreacion(LocalDateTime.now());
                notifCliente.setLeida(false);
                
                // Guardar en la base de datos
                Notificacion savedNotifCliente = notificacionService.crearNotificacion(notifCliente);
                
                // Enviar via WebSocket
                messagingTemplate.convertAndSend("/topic/notifications", savedNotifCliente);
            }
        }
    }
    
    // Notificar cuando un técnico responde
    public void notificarRespuestaTecnico(Ticket ticket, Usuario tecnico) {
        // Notificar al cliente
        if (ticket.getCreatorEmail() != null) {
            Usuario cliente = usuarioRepository.findByEmail(ticket.getCreatorEmail()).orElse(null);
            if (cliente != null) {
                Notificacion notifCliente = new Notificacion();
                notifCliente.setTitulo("💬 Respuesta del Técnico");
                notifCliente.setMensaje("El técnico " + tecnico.getFullName() + " " + tecnico.getLastName() + 
                                      " ha respondido en tu ticket #" + ticket.getId() +
                                      "\n📋 Asunto: " + ticket.getSubject());
                notifCliente.setTipo("info");
                notifCliente.setTicketId(ticket.getId());
                notifCliente.setUsuarioId(cliente.getId());
                notifCliente.setUsuarioEmail(cliente.getEmail());
                notifCliente.setFechaCreacion(LocalDateTime.now());
                notifCliente.setLeida(false);
                
                // Guardar en la base de datos
                Notificacion savedNotifCliente = notificacionService.crearNotificacion(notifCliente);
                
                // Enviar via WebSocket
                messagingTemplate.convertAndSend("/topic/notifications", savedNotifCliente);
            }
        }
        
        // Notificar a los administradores
        List<Usuario> admins = usuarioRepository.findByUserType(TipoUsuario.ADMINISTRADOR);
        for (Usuario admin : admins) {
            Notificacion notifAdmin = new Notificacion();
            notifAdmin.setTitulo("💬 Respuesta del Técnico");
            notifAdmin.setMensaje("El técnico " + tecnico.getFullName() + " " + tecnico.getLastName() + 
                                " ha respondido en el ticket #" + ticket.getId() +
                                "\n👤 Cliente: " + ticket.getCreatorName());
            notifAdmin.setTipo("info");
            notifAdmin.setTicketId(ticket.getId());
            notifAdmin.setUsuarioId(admin.getId());
            notifAdmin.setUsuarioEmail(admin.getEmail());
            notifAdmin.setFechaCreacion(LocalDateTime.now());
            notifAdmin.setLeida(false);
            
            // Guardar en la base de datos
            Notificacion savedNotifAdmin = notificacionService.crearNotificacion(notifAdmin);
            
            // Enviar via WebSocket
            messagingTemplate.convertAndSend("/topic/notifications", savedNotifAdmin);
        }
    }
    
    // Notificar cuando un cliente responde
    public void notificarRespuestaCliente(Ticket ticket, Usuario cliente) {
        // Notificar al técnico asignado
        if (ticket.getAssignedTechnicianEmail() != null) {
            Usuario tecnico = usuarioRepository.findByEmail(ticket.getAssignedTechnicianEmail()).orElse(null);
            if (tecnico != null) {
                Notificacion notifTecnico = new Notificacion();
                notifTecnico.setTitulo("Respuesta del Cliente");
                notifTecnico.setMensaje("El cliente " + cliente.getFullName() + " ha respondido en el ticket #" + ticket.getId());
                notifTecnico.setTipo("info");
                notifTecnico.setTicketId(ticket.getId());
                notifTecnico.setUsuarioId(tecnico.getId());
                notifTecnico.setUsuarioEmail(tecnico.getEmail());
                notifTecnico.setFechaCreacion(LocalDateTime.now());
                notifTecnico.setLeida(false);
                
                // Guardar en la base de datos
                Notificacion savedNotifTecnico = notificacionService.crearNotificacion(notifTecnico);
                
                // Enviar via WebSocket
                messagingTemplate.convertAndSend("/topic/notifications", savedNotifTecnico);
            }
        }
        
        // Notificar a los administradores
        List<Usuario> admins = usuarioRepository.findByUserType(TipoUsuario.ADMINISTRADOR);
        for (Usuario admin : admins) {
            Notificacion notifAdmin = new Notificacion();
            notifAdmin.setTitulo("Respuesta del Cliente");
            notifAdmin.setMensaje("El cliente " + cliente.getFullName() + " ha respondido en el ticket #" + ticket.getId());
            notifAdmin.setTipo("info");
            notifAdmin.setTicketId(ticket.getId());
            notifAdmin.setUsuarioId(admin.getId());
            notifAdmin.setUsuarioEmail(admin.getEmail());
            notifAdmin.setFechaCreacion(LocalDateTime.now());
            notifAdmin.setLeida(false);
            
            // Guardar en la base de datos
            Notificacion savedNotifAdmin = notificacionService.crearNotificacion(notifAdmin);
            
            // Enviar via WebSocket
            messagingTemplate.convertAndSend("/topic/notifications", savedNotifAdmin);
        }
    }
    
    // Notificar cuando un ticket es escalado
    public void notificarTicketEscalado(Ticket ticket, Usuario admin) {
        // Notificar al técnico
        if (ticket.getAssignedTechnicianEmail() != null) {
            Usuario tecnico = usuarioRepository.findByEmail(ticket.getAssignedTechnicianEmail()).orElse(null);
            if (tecnico != null) {
                Notificacion notifTecnico = new Notificacion();
                notifTecnico.setTitulo("⚠️ Ticket Escalado");
                notifTecnico.setMensaje("El ticket #" + ticket.getId() + " ha sido escalado" +
                                     "\n📋 Asunto: " + ticket.getSubject() +
                                     "\n👤 Cliente: " + ticket.getCreatorName() +
                                     "\n👨‍💼 Escalado por: " + admin.getFullName());
                notifTecnico.setTipo("warning");
                notifTecnico.setTicketId(ticket.getId());
                notifTecnico.setUsuarioId(tecnico.getId());
                notifTecnico.setUsuarioEmail(tecnico.getEmail());
                notifTecnico.setFechaCreacion(LocalDateTime.now());
                notifTecnico.setLeida(false);
                
                // Guardar en la base de datos
                Notificacion savedNotifTecnico = notificacionService.crearNotificacion(notifTecnico);
                
                // Enviar via WebSocket
                messagingTemplate.convertAndSend("/topic/notifications", savedNotifTecnico);
            }
        }
        
        // Notificar al cliente
        if (ticket.getCreatorEmail() != null) {
            Usuario cliente = usuarioRepository.findByEmail(ticket.getCreatorEmail()).orElse(null);
            if (cliente != null) {
                Notificacion notifCliente = new Notificacion();
                notifCliente.setTitulo("⚠️ Ticket Escalado");
                notifCliente.setMensaje("Tu ticket #" + ticket.getId() + " ha sido escalado" +
                                      "\n📋 Asunto: " + ticket.getSubject() +
                                      "\n👨‍💼 Escalado por: " + admin.getFullName() +
                                      "\n🔄 Será atendido por un supervisor");
                notifCliente.setTipo("warning");
                notifCliente.setTicketId(ticket.getId());
                notifCliente.setUsuarioId(cliente.getId());
                notifCliente.setUsuarioEmail(cliente.getEmail());
                notifCliente.setFechaCreacion(LocalDateTime.now());
                notifCliente.setLeida(false);
                
                // Guardar en la base de datos
                Notificacion savedNotifCliente = notificacionService.crearNotificacion(notifCliente);
                
                // Enviar via WebSocket
                messagingTemplate.convertAndSend("/topic/notifications", savedNotifCliente);
            }
        }
    }
}
