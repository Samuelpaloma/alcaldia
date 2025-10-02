package com.example.demo.notificacion.service;

import com.example.demo.notificacion.dto.NotificacionDTO;
import com.example.demo.notificacion.dto.PreferenciasNotificacionDTO;
import com.example.demo.notificacion.dto.request.CreateNotificacionRequest;
import com.example.demo.notificacion.model.Notificacion;
import com.example.demo.notificacion.model.Notification;
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
     * Crear nueva notificación directamente desde modelo
     */
    Notificacion crearNotificacion(Notificacion notificacion);
    
    /**
     * Eliminar notificación
     */
    void eliminarNotificacion(Long id, String emailUsuario);
    
    /**
     * Obtener estadísticas de notificaciones
     */
    NotificacionStatsResponseDTO obtenerEstadisticas(String emailUsuario);
    
    /**
     * Obtener notificaciones del usuario por ID (para el controller)
     */
    List<NotificacionDTO> getNotificacionesByUsuario(Long usuarioId);
    
    /**
     * Obtener notificaciones no leídas del usuario por ID
     */
    List<NotificacionDTO> getNotificacionesNoLeidasByUsuario(Long usuarioId);
    
    /**
     * Marcar notificación como leída por ID de usuario
     */
    void marcarComoLeida(Long notificacionId, Long usuarioId);
    
    /**
     * Contar notificaciones no leídas del usuario
     */
    long contarNotificacionesNoLeidas(Long usuarioId);
    
    /**
     * Obtener preferencias de notificación del usuario
     */
    PreferenciasNotificacionDTO getPreferenciasByUsuario(Long usuarioId);
    
    /**
     * Actualizar preferencias de notificación del usuario
     */
    PreferenciasNotificacionDTO actualizarPreferencias(Long usuarioId, PreferenciasNotificacionDTO preferenciasDTO);
    
    // ===== MÉTODOS ADICIONALES DE ALCALDIA =====
    
    /**
     * Crear una notificación (método de alcaldia)
     */
    Notification crearNotificacion(String tipo, String mensaje, List<Integer> destinatariosIds, 
                                          Long ticketId, Integer usuarioActorId, String prioridad);
    
    /**
     * Crear notificación solo si el usuario tiene push activo
     */
    Notification crearNotificacionSiPushActivo(String tipo, String mensaje, List<Integer> destinatariosIds, 
                                                      Long ticketId, Integer usuarioActorId, String prioridad);
    
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
