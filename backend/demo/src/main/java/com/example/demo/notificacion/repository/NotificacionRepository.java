package com.example.demo.notificacion.repository;

import com.example.demo.notificacion.model.Notificacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    
    // Obtener notificaciones por usuario
    Page<Notificacion> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId, Pageable pageable);
    
    // Obtener notificaciones no leídas por usuario
    List<Notificacion> findByUsuarioIdAndEstadoOrderByFechaCreacionDesc(Long usuarioId, Notificacion.EstadoNotificacion estado);
    
    // Contar notificaciones no leídas por usuario
    long countByUsuarioIdAndEstado(Long usuarioId, Notificacion.EstadoNotificacion estado);
    
    // Obtener notificaciones por tipo
    Page<Notificacion> findByUsuarioIdAndTipoOrderByFechaCreacionDesc(Long usuarioId, Notificacion.TipoNotificacion tipo, Pageable pageable);
    
    // Obtener notificaciones por rango de fechas
    @Query("SELECT n FROM Notificacion n WHERE n.usuarioId = :usuarioId AND n.fechaCreacion BETWEEN :fechaInicio AND :fechaFin ORDER BY n.fechaCreacion DESC")
    Page<Notificacion> findByUsuarioIdAndFechaCreacionBetween(@Param("usuarioId") Long usuarioId, 
                                                              @Param("fechaInicio") LocalDateTime fechaInicio, 
                                                              @Param("fechaFin") LocalDateTime fechaFin, 
                                                              Pageable pageable);
    
    // Obtener notificaciones relacionadas con un ticket
    List<Notificacion> findByTicketIdOrderByFechaCreacionDesc(Long ticketId);
    
    // Obtener notificaciones del sistema (para todos los usuarios)
    @Query("SELECT n FROM Notificacion n WHERE n.tipo IN ('SISTEMA_ALERTA', 'SISTEMA_MANTENIMIENTO') ORDER BY n.fechaCreacion DESC")
    Page<Notificacion> findSystemNotifications(Pageable pageable);
    
    // Marcar notificaciones como leídas
    @Query("UPDATE Notificacion n SET n.estado = 'LEIDA', n.fechaLectura = :fechaLectura WHERE n.id IN :ids")
    void markAsRead(@Param("ids") List<Long> ids, @Param("fechaLectura") LocalDateTime fechaLectura);
    
    // Archivar notificaciones antiguas
    @Query("UPDATE Notificacion n SET n.estado = 'ARCHIVADA' WHERE n.fechaCreacion < :fechaAntigua AND n.estado = 'LEIDA'")
    void archiveOldNotifications(@Param("fechaAntigua") LocalDateTime fechaAntigua);
}
