package com.example.demo.ticket.repository;

import com.example.demo.ticket.model.Ticket;
import com.example.demo.usuario.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    // 📊 Consultas para estadísticas del técnico
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.tecnicoAsignado.id = :tecnicoId AND t.estado = 'PENDIENTE'")
    long countTicketsPendientesByTecnico(@Param("tecnicoId") Integer tecnicoId);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.tecnicoAsignado.id = :tecnicoId AND t.estado = 'EN_PROCESO'")
    long countTicketsEnProcesoByTecnico(@Param("tecnicoId") Integer tecnicoId);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.tecnicoAsignado.id = :tecnicoId AND t.estado = 'COMPLETADO'")
    long countTicketsCompletadosByTecnico(@Param("tecnicoId") Integer tecnicoId);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.tecnicoAsignado.id = :tecnicoId")
    long countTicketsAsignadosByTecnico(@Param("tecnicoId") Integer tecnicoId);
    
    // 📋 Consultas para obtener tickets del técnico
    @Query("SELECT t FROM Ticket t WHERE t.tecnicoAsignado.id = :tecnicoId ORDER BY t.fechaCreacion DESC")
    List<Ticket> findTicketsByTecnico(@Param("tecnicoId") Integer tecnicoId);
    
    @Query("SELECT t FROM Ticket t WHERE t.tecnicoAsignado.id = :tecnicoId AND t.estado = :estado ORDER BY t.fechaCreacion DESC")
    List<Ticket> findTicketsByTecnicoAndEstado(@Param("tecnicoId") Integer tecnicoId, @Param("estado") String estado);
    
    // 🔍 Consultas adicionales útiles
    @Query("SELECT t FROM Ticket t WHERE t.tecnicoAsignado.id = :tecnicoId AND t.estado IN ('PENDIENTE', 'EN_PROCESO') ORDER BY t.prioridad DESC, t.fechaCreacion ASC")
    List<Ticket> findTicketsActivosByTecnico(@Param("tecnicoId") Integer tecnicoId);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.tecnicoAsignado.id = :tecnicoId AND t.estado IN ('PENDIENTE', 'EN_PROCESO')")
    long countTicketsActivosByTecnico(@Param("tecnicoId") Integer tecnicoId);
}
