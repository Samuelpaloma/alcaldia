package com.example.demo.ticket.repository;

import com.example.demo.ticket.model.ArchivoTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArchivoTicketRepository extends JpaRepository<ArchivoTicket, Long> {
    
    /**
     * Buscar archivos activos por ticket ordenados por fecha de subida
     */
    @Query("SELECT a FROM ArchivoTicket a WHERE a.ticket.id = :ticketId AND a.activo = true ORDER BY a.fechaSubida ASC")
    List<ArchivoTicket> findByTicketIdAndActivoTrueOrderByFechaSubidaAsc(@Param("ticketId") Long ticketId);
    
    /**
     * Buscar archivo por ID y ticket
     */
    @Query("SELECT a FROM ArchivoTicket a WHERE a.id = :archivoId AND a.ticket.id = :ticketId AND a.activo = true")
    Optional<ArchivoTicket> findByIdAndTicketIdAndActivoTrue(@Param("archivoId") Long archivoId, @Param("ticketId") Long ticketId);
    
    /**
     * Contar archivos activos por ticket
     */
    @Query("SELECT COUNT(a) FROM ArchivoTicket a WHERE a.ticket.id = :ticketId AND a.activo = true")
    Long countByTicketIdAndActivoTrue(@Param("ticketId") Long ticketId);
}
