package com.example.demo.ticket.repository;

import com.example.demo.ticket.model.HistorialEstadoTicket;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HistorialEstadoTicketRepository extends JpaRepository<HistorialEstadoTicket, Long> {
    
    // Buscar historial por ticket
    List<HistorialEstadoTicket> findByTicketOrderByFechaCambioDesc(Ticket ticket);
    
    // Buscar historial por quien hizo el cambio
    List<HistorialEstadoTicket> findByCambiadoPorOrderByFechaCambioDesc(Usuario cambiadoPor);
    
    // Buscar historial por tipo de usuario
    List<HistorialEstadoTicket> findByTipoUsuarioOrderByFechaCambioDesc(String tipoUsuario);
    
    // Buscar historial reciente
    @Query("SELECT h FROM HistorialEstadoTicket h WHERE h.fechaCambio >= :desde ORDER BY h.fechaCambio DESC")
    List<HistorialEstadoTicket> findHistorialReciente(@Param("desde") LocalDateTime desde);
    
    // Buscar último cambio de estado de un ticket
    @Query("SELECT h FROM HistorialEstadoTicket h WHERE h.ticket = :ticket ORDER BY h.fechaCambio DESC")
    List<HistorialEstadoTicket> findUltimoCambio(@Param("ticket") Ticket ticket);
    
    // Contar cambios por ticket
    long countByTicket(Ticket ticket);
    
    // Contar cambios por técnico
    long countByCambiadoPor(Usuario cambiadoPor);
    
    // Buscar cambios por rango de fechas
    @Query("SELECT h FROM HistorialEstadoTicket h WHERE h.fechaCambio BETWEEN :desde AND :hasta ORDER BY h.fechaCambio DESC")
    List<HistorialEstadoTicket> findByFechaCambioBetween(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);
}


