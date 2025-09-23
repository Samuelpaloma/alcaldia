package com.example.demo.asignacion.repository;

import com.example.demo.asignacion.model.HistorialAsignacion;
import com.example.demo.ticket.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialAsignacionRepository extends JpaRepository<HistorialAsignacion, Long> {
    
    /**
     * Buscar historial de asignaciones por ticket, ordenado por fecha de operación
     */
    @Query("SELECT h FROM HistorialAsignacion h WHERE h.ticket = :ticket ORDER BY h.fechaOperacion ASC")
    List<HistorialAsignacion> findByTicketOrderByFechaOperacionAsc(@Param("ticket") Ticket ticket);
    
    /**
     * Buscar historial de asignaciones por ticket ID
     */
    @Query("SELECT h FROM HistorialAsignacion h WHERE h.ticket.id = :ticketId ORDER BY h.fechaOperacion ASC")
    List<HistorialAsignacion> findByTicketIdOrderByFechaOperacionAsc(@Param("ticketId") Long ticketId);
}
