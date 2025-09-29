package com.example.demo.notificacion.service;

import com.example.demo.auth.service.EmailService;
import com.example.demo.notificacion.model.NotificacionMejorada;
import com.example.demo.notificacion.model.PreferenciasNotificacion;
import com.example.demo.notificacion.repository.PreferenciasNotificacionRepository;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificacionAutomaticaService {
    
    @Autowired
    private NotificacionServiceSimple notificacionService;
    
    @Autowired
    private PreferenciasNotificacionRepository preferenciasRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private PushNotificationService pushNotificationService;
    
    /**
     * Notificar cuando un ticket es creado
     */
    public void notificarTicketCreado(Ticket ticket, Usuario creador) {
        System.out.println("🚀 [DEBUG] ===== INICIANDO NOTIFICACIÓN TICKET CREADO =====");
        System.out.println("🚀 [DEBUG] Ticket ID: " + ticket.getId());
        System.out.println("🚀 [DEBUG] Creador: " + (creador != null ? creador.getEmail() : "NULL"));
        System.out.println("🚀 [DEBUG] ¿Tiene técnico asignado? " + (ticket.getTecnicoAsignado() != null));
        
        try {
            // Notificar al técnico asignado si existe
            if (ticket.getTecnicoAsignado() != null) {
                Usuario tecnico = ticket.getTecnicoAsignado();
                System.out.println("🚀 [DEBUG] Técnico asignado: " + tecnico.getEmail());
                System.out.println("🚀 [DEBUG] Técnico ID: " + tecnico.getIdUsuario());
                
                // Verificar preferencias del técnico
                if (!debeNotificar(tecnico.getIdUsuario(), "ticket_asignado")) {
                    System.out.println("⚠️ [NOTIFICACION] Usuario " + tecnico.getEmail() + " tiene notificaciones desactivadas para este tipo");
                    return;
                }
                
                System.out.println("🔔 [NOTIFICACION] Ticket #" + ticket.getId() + " creado y asignado a técnico " + tecnico.getNombre());
                
                // Crear notificación en BD
                String mensaje = "Nuevo ticket #" + ticket.getId() + " asignado: " + 
                    (ticket.getConsulta() != null ? ticket.getConsulta() : "Sin descripción");
                
                notificacionService.crearNotificacionSiPushActivo(
                    "ticket_asignado", 
                    mensaje, 
                    List.of(tecnico.getIdUsuario().intValue()), 
                    ticket.getId(), 
                    creador.getIdUsuario().intValue(), 
                    "normal"
                );
                
                System.out.println("✅ [NOTIFICACION] Notificación creada exitosamente");
            } else {
                System.out.println("⚠️ [NOTIFICACION] Ticket sin técnico asignado - no se envía notificación");
            }
        } catch (Exception e) {
            System.err.println("❌ [NOTIFICACION] Error en notificación de ticket creado: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Notificar cuando un ticket es asignado a un técnico
     */
    public void notificarTicketAsignado(Ticket ticket, Usuario tecnico) {
        try {
            // Verificar preferencias del técnico
            if (!debeNotificar(tecnico.getIdUsuario(), "ticket_asignado")) {
                return;
            }
            
            // Crear notificación
            String mensaje = "Ticket #" + ticket.getId() + " asignado: " + 
                (ticket.getConsulta() != null ? ticket.getConsulta() : "Sin descripción");
            
            notificacionService.crearNotificacionSiPushActivo(
                "ticket_asignado", 
                mensaje, 
                List.of(tecnico.getIdUsuario().intValue()), 
                ticket.getId(), 
                tecnico.getIdUsuario().intValue(), 
                "normal"
            );
        } catch (Exception e) {
            System.err.println("Error notificando ticket asignado: " + e.getMessage());
        }
    }
    
    /**
     * Notificar cuando un ticket cambia a EN_PROCESO
     */
    public void notificarTicketEnProceso(Ticket ticket, Usuario tecnico) {
        System.out.println("🚀 [DEBUG] ===== INICIANDO NOTIFICACIÓN TICKET EN PROCESO =====");
        System.out.println("🚀 [DEBUG] Ticket ID: " + ticket.getId());
        System.out.println("🚀 [DEBUG] Técnico: " + (tecnico != null ? tecnico.getEmail() : "NULL"));
        System.out.println("🚀 [DEBUG] Técnico ID: " + (tecnico != null ? tecnico.getIdUsuario() : "NULL"));
        
        try {
            // Verificar preferencias del técnico
            boolean debeNotif = debeNotificar(tecnico.getIdUsuario(), "ticket_en_proceso");
            System.out.println("🚀 [DEBUG] ¿Debe notificar? " + debeNotif);
            
            if (!debeNotif) {
                System.out.println("⚠️ [DEBUG] No se envía notificación por preferencias del usuario");
                return;
            }

            // Crear notificación
            String mensaje = "Ticket #" + ticket.getId() + " en proceso: " +
                (ticket.getConsulta() != null ? ticket.getConsulta() : "Sin descripción");
            System.out.println("🚀 [DEBUG] Mensaje: " + mensaje);

            System.out.println("🚀 [DEBUG] Creando notificación en BD...");
            NotificacionMejorada notificacionGuardada = notificacionService.crearNotificacionSiPushActivo(
                "ticket_en_proceso",
                mensaje,
                List.of(tecnico.getIdUsuario().intValue()),
                ticket.getId(),
                tecnico.getIdUsuario().intValue(),
                "normal"
            );
            
            if (notificacionGuardada != null) {
                System.out.println("✅ [DEBUG] Notificación guardada en BD exitosamente - ID: " + notificacionGuardada.getId());
            } else {
                System.out.println("⚠️ [DEBUG] Notificación NO guardada en BD (push desactivado)");
            }

            // Enviar notificación push
            try {
                String deviceToken = tecnico.getDeviceToken();
                System.out.println("🚀 [DEBUG] Device Token: " + (deviceToken != null ? deviceToken : "NULL"));
                
                if (deviceToken != null && !deviceToken.trim().isEmpty()) {
                    System.out.println("🚀 [DEBUG] Enviando push notification...");
                    pushNotificationService.sendTicketAcceptedPushNotification(
                        deviceToken,
                        ticket.getId(),
                        ticket.getConsulta() != null ? ticket.getConsulta() : "Ticket #" + ticket.getId()
                    );
                    System.out.println("✅ [DEBUG] Push notification enviada exitosamente");
                } else {
                    System.out.println("⚠️ [PUSH] Técnico " + tecnico.getEmail() + " no tiene device token");
                }
            } catch (Exception e) {
                System.err.println("❌ [PUSH] Error enviando push notification: " + e.getMessage());
                e.printStackTrace();
            }
            
            System.out.println("✅ [DEBUG] ===== NOTIFICACIÓN TICKET EN PROCESO COMPLETADA =====");
        } catch (Exception e) {
            System.err.println("❌ [DEBUG] Error notificando ticket en proceso: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Notificar cuando un ticket es finalizado
     */
    public void notificarTicketFinalizado(Ticket ticket, Usuario tecnico) {
        try {
            // Verificar preferencias del técnico
            if (!debeNotificar(tecnico.getIdUsuario(), "ticket_finalizado")) {
                return;
            }
            
            // Crear notificación
            String mensaje = "Ticket #" + ticket.getId() + " finalizado: " + 
                (ticket.getConsulta() != null ? ticket.getConsulta() : "Sin descripción");
            
            notificacionService.crearNotificacionSiPushActivo(
                "ticket_finalizado", 
                mensaje, 
                List.of(tecnico.getIdUsuario().intValue()), 
                ticket.getId(), 
                tecnico.getIdUsuario().intValue(), 
                "normal"
            );
        } catch (Exception e) {
            System.err.println("Error notificando ticket finalizado: " + e.getMessage());
        }
    }
    
    /**
     * Notificar cuando se agrega evidencia a un ticket
     */
    public void notificarEvidenciaAgregada(Ticket ticket, Usuario tecnico) {
        try {
            // Verificar preferencias del técnico
            if (!debeNotificar(tecnico.getIdUsuario(), "evidencia_agregada")) {
                return;
            }
            
            // Crear notificación
            String mensaje = "Evidencia agregada al ticket #" + ticket.getId() + ": " + 
                (ticket.getConsulta() != null ? ticket.getConsulta() : "Sin descripción");
            
            notificacionService.crearNotificacionSiPushActivo(
                "evidencia_agregada", 
                mensaje, 
                List.of(tecnico.getIdUsuario().intValue()), 
                ticket.getId(), 
                tecnico.getIdUsuario().intValue(), 
                "normal"
            );
        } catch (Exception e) {
            System.err.println("Error notificando evidencia agregada: " + e.getMessage());
        }
    }
    
    /**
     * Verificar si debe enviar notificación según las preferencias del usuario
     */
    private boolean debeNotificar(Long usuarioId, String tipoNotificacion) {
        try {
            PreferenciasNotificacion preferencias = preferenciasRepository.findByUsuarioId(usuarioId).orElse(null);
            
            // Si no hay preferencias, usar valores por defecto (notificaciones activas)
            if (preferencias == null) {
                return true;
            }
            
            // Verificar según el tipo de notificación
            switch (tipoNotificacion) {
                case "ticket_asignado":
                    return preferencias.getNotificacionesTicketAsignado();
                case "ticket_en_proceso":
                    return preferencias.getNotificacionesTicketEnProceso();
                case "ticket_finalizado":
                    return preferencias.getNotificacionesTicketResuelto();
                case "evidencia_agregada":
                    return preferencias.getNotificacionesEvidencias();
                default:
                    return true;
            }
        } catch (Exception e) {
            System.err.println("Error verificando preferencias de notificación: " + e.getMessage());
            return true; // En caso de error, enviar notificación
        }
    }
}