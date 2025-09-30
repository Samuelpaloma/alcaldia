package com.example.demo.notificacion.service;

import com.example.demo.notificacion.model.NotificacionMejorada;
import com.example.demo.notificacion.repository.NotificacionMejoradaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificacionMejoradaService {
    
    @Autowired
    private NotificacionMejoradaRepository notificacionMejoradaRepository;
    
    public NotificacionMejorada crearNotificacion(NotificacionMejorada notificacion) {
        return notificacionMejoradaRepository.save(notificacion);
    }
    
    public List<NotificacionMejorada> obtenerNotificacionesPorUsuario(String email) {
        System.out.println("🔔 [NOTIFICACION MEJORADA] Obteniendo notificaciones para usuario: " + email);
        List<NotificacionMejorada> notificaciones = notificacionMejoradaRepository.findByDestinatariosContaining(email);
        System.out.println("🔔 [NOTIFICACION MEJORADA] Notificaciones encontradas: " + notificaciones.size());
        return notificaciones;
    }
    
    public List<NotificacionMejorada> obtenerNotificacionesPorRol(String rol) {
        return notificacionMejoradaRepository.findByDestinatariosContaining("rol:" + rol);
    }
    
    public List<NotificacionMejorada> obtenerNotificacionesNoLeidas(String email) {
        return notificacionMejoradaRepository.findByDestinatariosContainingAndLeidaFalse(email);
    }
    
    public NotificacionMejorada marcarComoLeida(Long id) {
        Optional<NotificacionMejorada> notificacionOpt = notificacionMejoradaRepository.findById(id);
        if (notificacionOpt.isPresent()) {
            NotificacionMejorada notificacion = notificacionOpt.get();
            notificacion.setLeida(true);
            notificacion.setFechaLectura(LocalDateTime.now());
            return notificacionMejoradaRepository.save(notificacion);
        }
        return null;
    }
    
    public void eliminarNotificacion(Long id) {
        notificacionMejoradaRepository.deleteById(id);
    }
    
    public List<NotificacionMejorada> obtenerNotificacionesPorTicket(Long ticketId) {
        return notificacionMejoradaRepository.findByTicketId(ticketId);
    }
    
    public List<NotificacionMejorada> obtenerNotificacionesPorTipo(String tipo) {
        return notificacionMejoradaRepository.findByTipo(tipo);
    }
    
    public List<NotificacionMejorada> obtenerNotificacionesCriticas() {
        return notificacionMejoradaRepository.findByPrioridad(NotificacionMejorada.PRIORIDAD_CRITICA);
    }
    
    public Long contarNotificacionesNoLeidas(String email) {
        System.out.println("🔔 [NOTIFICACION MEJORADA] Contando notificaciones no leídas para: " + email);
        
        // Primero, obtener todas las notificaciones para debug
        List<NotificacionMejorada> todasLasNotificaciones = notificacionMejoradaRepository.findAll();
        System.out.println("🔔 [NOTIFICACION MEJORADA] Total notificaciones en BD: " + todasLasNotificaciones.size());
        
        for (NotificacionMejorada notif : todasLasNotificaciones) {
            System.out.println("🔔 [NOTIFICACION MEJORADA] - ID: " + notif.getId() + 
                             ", Destinatarios: " + notif.getDestinatarios() + 
                             ", Leída: " + notif.getLeida() + 
                             ", Tipo: " + notif.getTipo());
        }
        
        Long count = notificacionMejoradaRepository.countByDestinatariosContainingAndLeidaFalse(email);
        System.out.println("🔔 [NOTIFICACION MEJORADA] Contador encontrado: " + count);
        
        return count;
    }
}
