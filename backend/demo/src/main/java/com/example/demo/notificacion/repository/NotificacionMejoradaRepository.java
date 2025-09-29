package com.example.demo.notificacion.repository;

import com.example.demo.notificacion.model.NotificacionMejorada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionMejoradaRepository extends JpaRepository<NotificacionMejorada, Long> {
    
    // Buscar notificaciones que contengan un destinatario específico
    @Query("SELECT n FROM NotificacionMejorada n WHERE n.destinatarios LIKE %:destinatario%")
    List<NotificacionMejorada> findByDestinatariosContaining(@Param("destinatario") String destinatario);
    
    // Buscar notificaciones no leídas para un destinatario
    @Query("SELECT n FROM NotificacionMejorada n WHERE n.destinatarios LIKE %:destinatario% AND n.leida = false")
    List<NotificacionMejorada> findByDestinatariosContainingAndLeidaFalse(@Param("destinatario") String destinatario);
    
    // Buscar notificaciones por ticket
    List<NotificacionMejorada> findByTicketId(Long ticketId);
    
    // Buscar notificaciones por tipo
    List<NotificacionMejorada> findByTipo(String tipo);
    
    // Buscar notificaciones por prioridad
    List<NotificacionMejorada> findByPrioridad(String prioridad);
    
    // Contar notificaciones no leídas
    @Query("SELECT COUNT(n) FROM NotificacionMejorada n WHERE n.destinatarios LIKE %:destinatario% AND n.leida = false")
    Long countByDestinatariosContainingAndLeidaFalse(@Param("destinatario") String destinatario);
    
    // Buscar notificaciones por usuario actor
    List<NotificacionMejorada> findByUsuarioActorEmail(String email);
    
    // Buscar notificaciones por fecha de creación
    @Query("SELECT n FROM NotificacionMejorada n WHERE n.fechaCreacion >= :fechaInicio AND n.fechaCreacion <= :fechaFin")
    List<NotificacionMejorada> findByFechaCreacionBetween(@Param("fechaInicio") java.time.LocalDateTime fechaInicio, 
                                                          @Param("fechaFin") java.time.LocalDateTime fechaFin);
    
    // ===== MÉTODOS ADICIONALES DE ALCALDIA =====
    
    // Buscar notificaciones por destinatario (método de alcaldia)
    @Query("SELECT n FROM NotificacionMejorada n WHERE n.destinatarios LIKE %:destinatario% ORDER BY n.fechaCreacion DESC")
    List<NotificacionMejorada> findByDestinatario(@Param("destinatario") String destinatario);
    
    // Buscar notificaciones no leídas por destinatario (método de alcaldia)
    @Query("SELECT n FROM NotificacionMejorada n WHERE n.destinatarios LIKE %:destinatario% AND n.leida = false ORDER BY n.fechaCreacion DESC")
    List<NotificacionMejorada> findNoLeidasByDestinatario(@Param("destinatario") String destinatario);
    
    // Contar notificaciones no leídas por destinatario (método de alcaldia)
    @Query("SELECT COUNT(n) FROM NotificacionMejorada n WHERE n.destinatarios LIKE %:destinatario% AND n.leida = false")
    long countNoLeidasByDestinatario(@Param("destinatario") String destinatario);
}
