package com.example.demo.evidencia.repository;

import com.example.demo.evidencia.model.Evidencia;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EvidenciaRepository extends JpaRepository<Evidencia, Long> {
    
    // Buscar evidencias por ticket
    List<Evidencia> findByTicketOrderByFechaSubidaDesc(Ticket ticket);
    
    // Buscar evidencias por ticket y tipo
    List<Evidencia> findByTicketAndTipoEvidenciaOrderByFechaSubidaDesc(Ticket ticket, String tipoEvidencia);
    
    // Buscar evidencias por quien las subió
    List<Evidencia> findBySubidoPorOrderByFechaSubidaDesc(Usuario subidoPor);
    
    // Buscar evidencias activas por ticket
    @Query("SELECT e FROM Evidencia e WHERE e.ticket = :ticket AND e.activa = true ORDER BY e.fechaSubida DESC")
    List<Evidencia> findActivasByTicket(@Param("ticket") Ticket ticket);
    
    // Buscar evidencias recientes
    @Query("SELECT e FROM Evidencia e WHERE e.fechaSubida >= :desde ORDER BY e.fechaSubida DESC")
    List<Evidencia> findEvidenciasRecientes(@Param("desde") LocalDateTime desde);
    
    // Contar evidencias por ticket
    long countByTicket(Ticket ticket);
    
    // Contar evidencias por tipo
    long countByTipoEvidencia(String tipoEvidencia);
    
    // Buscar evidencias por rango de fechas
    @Query("SELECT e FROM Evidencia e WHERE e.fechaSubida BETWEEN :desde AND :hasta ORDER BY e.fechaSubida DESC")
    List<Evidencia> findByFechaSubidaBetween(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);
}
