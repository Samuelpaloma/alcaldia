package com.example.demo.notificacion.service;

import com.example.demo.notificacion.model.Notification;
import com.example.demo.notificacion.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository NotificationRepository;
    
    public Notification crearNotificacion(Notification notificacion) {
        return NotificationRepository.save(notificacion);
    }
    
    public List<Notification> obtenerNotificacionesPorUsuario(String email) {
        System.out.println("🔔 [NOTIFICACION MEJORADA] Obteniendo notificaciones para usuario: " + email);
        List<Notification> notificaciones = NotificationRepository.findByDestinatariosContaining(email);
        System.out.println("🔔 [NOTIFICACION MEJORADA] Notificaciones encontradas: " + notificaciones.size());
        return notificaciones;
    }
    
    public List<Notification> obtenerNotificacionesPorRol(String rol) {
        return NotificationRepository.findByDestinatariosContaining("rol:" + rol);
    }
    
    public List<Notification> obtenerNotificacionesNoLeidas(String email) {
        return NotificationRepository.findByDestinatariosContainingAndLeidaFalse(email);
    }
    
    public Notification marcarComoLeida(Long id) {
        Optional<Notification> notificacionOpt = NotificationRepository.findById(id);
        if (notificacionOpt.isPresent()) {
            Notification notificacion = notificacionOpt.get();
            notificacion.setRead(true);
            notificacion.setReadAt(LocalDateTime.now());
            return NotificationRepository.save(notificacion);
        }
        return null;
    }
    
    public void eliminarNotificacion(Long id) {
        NotificationRepository.deleteById(id);
    }
    
    public List<Notification> obtenerNotificacionesPorTicket(Long ticketId) {
        return NotificationRepository.findByTicketId(ticketId);
    }
    
    public List<Notification> obtenerNotificacionesPorTipo(String tipo) {
        return NotificationRepository.findByType(tipo);
    }
    
    public List<Notification> obtenerNotificacionesCriticas() {
        return NotificationRepository.findByPriority(Notification.PRIORITY_CRITICAL);
    }
    
    public Long contarNotificacionesNoLeidas(String email) {
        System.out.println("🔔 [NOTIFICACION MEJORADA] Contando notificaciones no leídas para: " + email);
        
        // Primero, obtener todas las notificaciones para debug
        List<Notification> todasLasNotificaciones = NotificationRepository.findAll();
        System.out.println("🔔 [NOTIFICACION MEJORADA] Total notificaciones en BD: " + todasLasNotificaciones.size());
        
        for (Notification notif : todasLasNotificaciones) {
            System.out.println("🔔 [NOTIFICACION MEJORADA] - ID: " + notif.getId() + 
                             ", Destinatarios: " + notif.getRecipients() + 
                             ", Leída: " + notif.getRead() + 
                             ", Tipo: " + notif.getType());
        }
        
        Long count = NotificationRepository.countByDestinatariosContainingAndLeidaFalse(email);
        System.out.println("🔔 [NOTIFICACION MEJORADA] Contador encontrado: " + count);
        
        return count;
    }
}
