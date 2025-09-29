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
import java.util.Optional;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    
    // Obtener notificaciones por email de usuario
    Page<Notificacion> findByUsuarioEmailOrderByFechaCreacionDesc(String usuarioEmail, Pageable pageable);
    
    // Obtener notificaciones por email de usuario y estado de leída
    Page<Notificacion> findByUsuarioEmailAndLeidaOrderByFechaCreacionDesc(String usuarioEmail, Boolean leida, Pageable pageable);
    
    // Obtener notificaciones no leídas por email de usuario
    List<Notificacion> findByUsuarioEmailAndLeidaFalseOrderByFechaCreacionDesc(String usuarioEmail);
    
    // Contar notificaciones por email de usuario
    long countByUsuarioEmail(String usuarioEmail);
    
    // Contar notificaciones no leídas por email de usuario
    long countByUsuarioEmailAndLeidaFalse(String usuarioEmail);
    
    // Contar notificaciones por email de usuario y fecha posterior
    long countByUsuarioEmailAndFechaCreacionAfter(String usuarioEmail, LocalDateTime fecha);
    
    // Obtener notificación por ID y email de usuario
    Optional<Notificacion> findByIdAndUsuarioEmail(Long id, String usuarioEmail);
    
    // Obtener notificaciones por tipo
    Page<Notificacion> findByUsuarioEmailAndTipoOrderByFechaCreacionDesc(String usuarioEmail, String tipo, Pageable pageable);
    
    // Obtener notificaciones por rango de fechas
    @Query("SELECT n FROM Notificacion n WHERE n.usuarioEmail = :usuarioEmail AND n.fechaCreacion BETWEEN :fechaInicio AND :fechaFin ORDER BY n.fechaCreacion DESC")
    Page<Notificacion> findByUsuarioEmailAndFechaCreacionBetween(@Param("usuarioEmail") String usuarioEmail, 
                                                               @Param("fechaInicio") LocalDateTime fechaInicio, 
                                                               @Param("fechaFin") LocalDateTime fechaFin, 
                                                               Pageable pageable);
    
    // Obtener notificaciones relacionadas con un ticket
    List<Notificacion> findByTicketIdOrderByFechaCreacionDesc(Long ticketId);
    
    // Obtener notificaciones del sistema (para todos los usuarios)
    @Query("SELECT n FROM Notificacion n WHERE n.tipo IN ('SISTEMA_ALERTA', 'SISTEMA_MANTENIMIENTO') ORDER BY n.fechaCreacion DESC")
    Page<Notificacion> findSystemNotifications(Pageable pageable);
    
    // Archivar notificaciones antiguas
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.fechaCreacion < :fechaAntigua AND n.leida = false")
    void archiveOldNotifications(@Param("fechaAntigua") LocalDateTime fechaAntigua);
    
    // Métodos para trabajar con ID de usuario (para el controller)
    List<Notificacion> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
    
    List<Notificacion> findByUsuarioIdAndLeidaFalseOrderByFechaCreacionDesc(Long usuarioId);
    
    long countByUsuarioIdAndLeidaFalse(Long usuarioId);
    
    Optional<Notificacion> findByIdAndUsuarioId(Long id, Long usuarioId);
}
