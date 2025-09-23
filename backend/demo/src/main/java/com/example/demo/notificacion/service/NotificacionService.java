package com.example.demo.notificacion.service;

import com.example.demo.notificacion.dto.request.CreateNotificacionRequest;
import com.example.demo.notificacion.model.Notificacion;
import com.example.demo.shared.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificacionService {
    
    /**
     * Obtener notificaciones del usuario con paginación y filtros
     */
    PageResponse<Notificacion> obtenerNotificacionesPorUsuario(String emailUsuario, Pageable pageable, Boolean leida);
    
    /**
     * Obtener notificaciones no leídas del usuario
     */
    List<Notificacion> obtenerNotificacionesNoLeidas(String emailUsuario);
    
    /**
     * Marcar notificación como leída
     */
    Notificacion marcarComoLeida(Long id, String emailUsuario);
    
    /**
     * Marcar todas las notificaciones como leídas
     */
    int marcarTodasComoLeidas(String emailUsuario);
    
    /**
     * Crear nueva notificación
     */
    Notificacion crearNotificacion(CreateNotificacionRequest request, String emailCreador);
    
    /**
     * Eliminar notificación
     */
    void eliminarNotificacion(Long id, String emailUsuario);
    
    /**
     * Obtener estadísticas de notificaciones
     */
    NotificacionStatsResponseDTO obtenerEstadisticas(String emailUsuario);
    
    // Clase interna para estadísticas
    class NotificacionStatsResponseDTO {
        public final long totalNotificaciones;
        public final long notificacionesNoLeidas;
        public final long notificacionesLeidas;
        public final long notificacionesHoy;
        public final long notificacionesEstaSemana;
        
        public NotificacionStatsResponseDTO(long totalNotificaciones, long notificacionesNoLeidas, 
                                          long notificacionesLeidas, long notificacionesHoy, 
                                          long notificacionesEstaSemana) {
            this.totalNotificaciones = totalNotificaciones;
            this.notificacionesNoLeidas = notificacionesNoLeidas;
            this.notificacionesLeidas = notificacionesLeidas;
            this.notificacionesHoy = notificacionesHoy;
            this.notificacionesEstaSemana = notificacionesEstaSemana;
        }
    }
}
