package com.example.demo.notificacion.service;

import com.example.demo.ticket.model.Ticket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Servicio de integración que conecta los eventos de tickets con las notificaciones
 */
@Service
public class TicketNotificationIntegrationService {

    @Autowired
    private NotificationRoleService notificationRoleService;

    /**
     * Se ejecuta cuando se crea un nuevo ticket
     */
    public void onTicketCreated(Long ticketId, Long creatorId) {
        try {
            notificationRoleService.notificarCreacionTicket(ticketId, creatorId);
        } catch (Exception e) {
            System.err.println("Error enviando notificación de creación de ticket: " + e.getMessage());
        }
    }

    /**
     * Se ejecuta cuando se asigna un ticket a un técnico
     */
    public void onTicketAssigned(Long ticketId, Long technicianId, Long assignerId) {
        try {
            notificationRoleService.notificarAsignacionTicket(ticketId, assignerId, technicianId);
        } catch (Exception e) {
            System.err.println("Error enviando notificación de asignación de ticket: " + e.getMessage());
        }
    }

    /**
     * Se ejecuta cuando un ticket cambia a estado "EN_PROCESO"
     */
    public void onTicketInProgress(Long ticketId, Long processorId) {
        try {
            notificationRoleService.notificarTicketEnProceso(ticketId, processorId);
        } catch (Exception e) {
            System.err.println("Error enviando notificación de ticket en proceso: " + e.getMessage());
        }
    }

    /**
     * Se ejecuta cuando un ticket cambia a estado "RESUELTO"
     */
    public void onTicketResolved(Long ticketId, Long resolverId) {
        try {
            notificationRoleService.notificarResolucionTicket(ticketId, resolverId);
        } catch (Exception e) {
            System.err.println("Error enviando notificación de resolución de ticket: " + e.getMessage());
        }
    }

    /**
     * Se ejecuta cuando un ticket cambia a estado "CERRADO"
     */
    public void onTicketClosed(Long ticketId, Long closerId) {
        try {
            notificationRoleService.notificarCierreTicket(ticketId, closerId);
        } catch (Exception e) {
            System.err.println("Error enviando notificación de cierre de ticket: " + e.getMessage());
        }
    }

    /**
     * Se ejecuta cuando se actualiza un ticket
     */
    public void onTicketUpdated(Ticket ticket, Long usuarioActorId) {
        try {
            // Aquí podrías agregar lógica para notificaciones de actualización
            // Por ejemplo, si se cambia la prioridad o se agrega un comentario
            System.out.println("Ticket actualizado: " + ticket.getId() + " por usuario: " + usuarioActorId);
        } catch (Exception e) {
            System.err.println("Error procesando actualización de ticket: " + e.getMessage());
        }
    }
}