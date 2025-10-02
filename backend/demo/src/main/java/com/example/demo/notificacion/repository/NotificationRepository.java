package com.example.demo.notificacion.repository;

import com.example.demo.notificacion.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Buscar notificaciones que contengan un destinatario específico
    @Query("SELECT n FROM Notification n WHERE n.recipients LIKE %:destinatario%")
    List<Notification> findByDestinatariosContaining(@Param("destinatario") String destinatario);
    
    // Buscar notificaciones no leídas para un destinatario
    @Query("SELECT n FROM Notification n WHERE n.recipients LIKE %:destinatario% AND n.read = false")
    List<Notification> findByDestinatariosContainingAndLeidaFalse(@Param("destinatario") String destinatario);
    
    // Buscar notificaciones por ticket
    List<Notification> findByTicketId(Long ticketId);
    
    // Buscar notificaciones por tipo
    List<Notification> findByType(String type);
    
    // Buscar notificaciones por prioridad
    List<Notification> findByPriority(String priority);
    
    // Contar notificaciones no leídas
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipients LIKE %:destinatario% AND n.read = false")
    Long countByDestinatariosContainingAndLeidaFalse(@Param("destinatario") String destinatario);
    
    // Buscar notificaciones por usuario actor
    List<Notification> findByActorUserEmail(String email);
    
    // Buscar notificaciones por fecha de creación
    @Query("SELECT n FROM Notification n WHERE n.createdAt >= :fechaInicio AND n.createdAt <= :fechaFin")
    List<Notification> findByFechaCreacionBetween(@Param("fechaInicio") java.time.LocalDateTime fechaInicio, 
                                                          @Param("fechaFin") java.time.LocalDateTime fechaFin);
    
    // ===== MÉTODOS ADICIONALES DE ALCALDIA =====
    
    // Buscar notificaciones por destinatario (método de alcaldia)
    @Query("SELECT n FROM Notification n WHERE n.recipients LIKE %:destinatario% ORDER BY n.createdAt DESC")
    List<Notification> findByDestinatario(@Param("destinatario") String destinatario);
    
    // Buscar notificaciones no leídas por destinatario (método de alcaldia)
    @Query("SELECT n FROM Notification n WHERE n.recipients LIKE %:destinatario% AND n.read = false ORDER BY n.createdAt DESC")
    List<Notification> findNoLeidasByDestinatario(@Param("destinatario") String destinatario);
    
    // Contar notificaciones no leídas por destinatario (método de alcaldia)
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipients LIKE %:destinatario% AND n.read = false")
    long countNoLeidasByDestinatario(@Param("destinatario") String destinatario);
    
    // Buscar notificaciones que contengan un destinatario específico con paginación
    @Query("SELECT n FROM Notification n WHERE n.recipients LIKE %:destinatario% ORDER BY n.createdAt DESC")
    Page<Notification> findByDestinatariosContainingOrderByFechaCreacionDesc(@Param("destinatario") String destinatario, Pageable pageable);
    
    // Buscar notificaciones no leídas para un destinatario con ordenamiento
    @Query("SELECT n FROM Notification n WHERE n.recipients LIKE %:destinatario% AND n.read = false ORDER BY n.createdAt DESC")
    List<Notification> findByDestinatariosContainingAndLeidaFalseOrderByFechaCreacionDesc(@Param("destinatario") String destinatario);
    
    // Buscar TODAS las notificaciones ordenadas por fecha de creación (para filtrado por roles)
    @Query("SELECT n FROM Notification n ORDER BY n.createdAt DESC")
    Page<Notification> findAllOrderByFechaCreacionDesc(Pageable pageable);
}
