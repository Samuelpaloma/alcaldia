package com.example.demo.asignacion.repository;

import com.example.demo.asignacion.model.AsignacionTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AsignacionTicketRepository extends JpaRepository<AsignacionTicket, Long> {
    
    // Buscar asignación activa por ticket
    Optional<AsignacionTicket> findByTicketIdAndActivaTrue(Long ticketId);
    
    // Buscar todas las asignaciones activas por ticket
    List<AsignacionTicket> findAllByTicketIdAndActivaTrue(Long ticketId);
    
    // Buscar la asignación activa más reciente por ticket
    @Query("SELECT a FROM AsignacionTicket a WHERE a.ticketId = :ticketId AND a.activa = true ORDER BY a.fechaAsignacion DESC")
    Optional<AsignacionTicket> findAsignacionActivaMasReciente(@Param("ticketId") Long ticketId);
    
    // Buscar asignaciones por ticket
    List<AsignacionTicket> findByTicketIdOrderByFechaAsignacionDesc(Long ticketId);
    
    // Buscar asignaciones activas por técnico
    List<AsignacionTicket> findByTecnicoIdAndActivaTrue(Long tecnicoId);
    
    // Buscar asignaciones por técnico
    List<AsignacionTicket> findByTecnicoIdOrderByFechaAsignacionDesc(Long tecnicoId);
    
    // Buscar asignaciones recientes
    @Query("SELECT a FROM AsignacionTicket a WHERE a.fechaAsignacion >= :desde ORDER BY a.fechaAsignacion DESC")
    List<AsignacionTicket> findAsignacionesRecientes(@Param("desde") LocalDateTime desde);
    
    // Contar asignaciones activas por técnico
    long countByTecnicoIdAndActivaTrue(Long tecnicoId);
    
    // Contar asignaciones por técnico en un rango de fechas
    @Query("SELECT COUNT(a) FROM AsignacionTicket a WHERE a.tecnicoId = :tecnicoId AND a.fechaAsignacion >= :desde")
    long countByTecnicoIdAndFechaAsignacionAfter(@Param("tecnicoId") Long tecnicoId, @Param("desde") LocalDateTime desde);
}


