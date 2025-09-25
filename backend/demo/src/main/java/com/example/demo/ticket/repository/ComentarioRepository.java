package com.example.demo.ticket.repository;

import com.example.demo.ticket.model.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    
    List<Comentario> findByTicketIdOrderByFechaCreacionAsc(Long ticketId);
    
    @Query("SELECT c FROM Comentario c WHERE c.ticketId = :ticketId ORDER BY c.fechaCreacion DESC")
    List<Comentario> findComentariosPorTicket(@Param("ticketId") Long ticketId);
    
    List<Comentario> findByAutorEmailOrderByFechaCreacionDesc(String autorEmail);
    
    @Query("SELECT COUNT(c) FROM Comentario c WHERE c.ticketId = :ticketId")
    Long countByTicketId(@Param("ticketId") Long ticketId);
}













