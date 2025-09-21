package com.example.demo.asignacion.repository;

import com.example.demo.asignacion.model.AsignacionTicket;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AsignacionTicketRepository extends JpaRepository<AsignacionTicket, Long> {
    
    // Buscar asignaciones por ticket
    List<AsignacionTicket> findByTicketOrderByFechaAsignacionDesc(Ticket ticket);
    
    // Buscar asignaciones por técnico
    List<AsignacionTicket> findByTecnicoOrderByFechaAsignacionDesc(Usuario tecnico);
    
    // Buscar asignaciones por quien asignó
    List<AsignacionTicket> findByAsignadoPorOrderByFechaAsignacionDesc(Usuario asignadoPor);
    
    // Buscar asignaciones recientes
    @Query("SELECT a FROM AsignacionTicket a WHERE a.fechaAsignacion >= :desde ORDER BY a.fechaAsignacion DESC")
    List<AsignacionTicket> findAsignacionesRecientes(@Param("desde") LocalDateTime desde);
    
    // Buscar asignación actual de un ticket
    @Query("SELECT a FROM AsignacionTicket a WHERE a.ticket = :ticket ORDER BY a.fechaAsignacion DESC")
    List<AsignacionTicket> findAsignacionActual(@Param("ticket") Ticket ticket);
    
    // Contar asignaciones por técnico
    long countByTecnico(Usuario tecnico);
    
    // Contar asignaciones por técnico en un rango de fechas
    @Query("SELECT COUNT(a) FROM AsignacionTicket a WHERE a.tecnico = :tecnico AND a.fechaAsignacion >= :desde")
    long countByTecnicoAndFechaAsignacionAfter(@Param("tecnico") Usuario tecnico, @Param("desde") LocalDateTime desde);
}


