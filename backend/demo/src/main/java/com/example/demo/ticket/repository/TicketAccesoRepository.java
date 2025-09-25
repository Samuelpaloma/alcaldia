package com.example.demo.ticket.repository;

import com.example.demo.ticket.model.TicketAcceso;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketAccesoRepository extends JpaRepository<TicketAcceso, Long> {
    
    /**
     * Buscar acceso activo de un técnico a un ticket
     */
    @Query("SELECT ta FROM TicketAcceso ta WHERE ta.ticket = :ticket AND ta.tecnico = :tecnico AND ta.activo = true")
    Optional<TicketAcceso> findAccesoActivo(@Param("ticket") Ticket ticket, @Param("tecnico") Usuario tecnico);
    
    /**
     * Buscar todos los accesos de un técnico a un ticket
     */
    @Query("SELECT ta FROM TicketAcceso ta WHERE ta.ticket = :ticket AND ta.tecnico = :tecnico ORDER BY ta.fechaAsignacion DESC")
    List<TicketAcceso> findByTicketAndTecnico(@Param("ticket") Ticket ticket, @Param("tecnico") Usuario tecnico);
    
    /**
     * Buscar accesos activos de un técnico
     */
    @Query("SELECT ta FROM TicketAcceso ta WHERE ta.tecnico = :tecnico AND ta.activo = true ORDER BY ta.fechaAsignacion DESC")
    List<TicketAcceso> findAccesosActivosByTecnico(@Param("tecnico") Usuario tecnico);
    
    /**
     * Buscar accesos activos de un ticket
     */
    @Query("SELECT ta FROM TicketAcceso ta WHERE ta.ticket = :ticket AND ta.activo = true ORDER BY ta.fechaAsignacion DESC")
    List<TicketAcceso> findAccesosActivosByTicket(@Param("ticket") Ticket ticket);
}
