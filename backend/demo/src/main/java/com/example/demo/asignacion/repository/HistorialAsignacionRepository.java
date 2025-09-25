package com.example.demo.asignacion.repository;

import com.example.demo.asignacion.model.HistorialAsignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialAsignacionRepository extends JpaRepository<HistorialAsignacion, Long> {
    
    /**
     * Buscar historial de asignaciones por ticket ID
     */
    @Query("SELECT h FROM HistorialAsignacion h WHERE h.ticketId = :ticketId ORDER BY h.fechaOperacion ASC")
    List<HistorialAsignacion> findByTicketIdOrderByFechaOperacionAsc(@Param("ticketId") Long ticketId);
    
    /**
     * Buscar historial por técnico
     */
    List<HistorialAsignacion> findByTecnicoIdOrderByFechaOperacionDesc(Long tecnicoId);
    
    /**
     * Buscar historial por usuario que asigna
     */
    List<HistorialAsignacion> findByUsuarioQueAsignaIdOrderByFechaOperacionDesc(Long usuarioQueAsignaId);
}
