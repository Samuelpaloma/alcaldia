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
        return notificacionMejoradaRepository.findByDestinatariosContaining(email);
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
        return notificacionMejoradaRepository.countByDestinatariosContainingAndLeidaFalse(email);
    }
}
