package com.example.demo.ticket.repository;

import com.example.demo.ticket.model.Ticket;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.categoria.model.Categoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    // Buscar tickets por creador ordenados por fecha de creación descendente
    Page<Ticket> findByCreatorOrderByCreatedAtDesc(Usuario creator, Pageable pageable);
    
    // Buscar tickets por múltiples criterios
    @Query("SELECT t FROM Ticket t WHERE t.creator = :creator " +
           "AND (:categoria IS NULL OR t.category.name = :categoria) " +
           "AND (:estado IS NULL OR t.status = :estado) " +
           "AND (:prioridad IS NULL OR t.priority = :prioridad)")
    List<Ticket> findByCreatorAndCategoriaAndEstadoAndPrioridad(
            @Param("creator") Usuario creator,
            @Param("categoria") String categoria,
            @Param("estado") String estado,
            @Param("prioridad") String prioridad);
    
    // Buscar tickets por estado
    List<Ticket> findByStatus(String status);
    
    // Buscar tickets por categoría (por nombre de categoría)
    @Query("SELECT t FROM Ticket t WHERE t.category.name = :categoria")
    List<Ticket> findByCategoriaNombre(@Param("categoria") String categoria);
    
    // Buscar tickets por categoría (usando la entidad Categoria)
    List<Ticket> findByCategory(Categoria category);
    
    // Buscar tickets por prioridad
    List<Ticket> findByPriority(String priority);
    
    // Contar tickets por estado
    long countByStatus(String status);
    
    // Contar tickets por creador
    long countByCreator(Usuario creator);
    
    // Buscar tickets por técnico asignado
    List<Ticket> findByAssignedTechnician(Usuario assignedTechnician);
    
    // Buscar tickets sin asignar
    List<Ticket> findByAssignedTechnicianIsNull();
    
    // Buscar tickets asignados ordenados por fecha
    List<Ticket> findByAssignedTechnicianOrderByCreatedAtDesc(Usuario assignedTechnician);
    
    // Contar tickets por técnico asignado
    long countByAssignedTechnician(Usuario assignedTechnician);
    
    // ===== MÉTODOS ADICIONALES DE ALCALDIA =====
    
    // 📊 Consultas para estadísticas del técnico (adaptadas para Usuario)
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedTechnician.id = :tecnicoId AND t.status = 'PENDIENTE'")
    long countTicketsPendientesByTecnico(@Param("tecnicoId") Integer tecnicoId);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedTechnician.id = :tecnicoId AND t.status = 'EN_PROCESO'")
    long countTicketsEnProcesoByTecnico(@Param("tecnicoId") Integer tecnicoId);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedTechnician.id = :tecnicoId AND t.status = 'FINALIZADA'")
    long countTicketsCompletadosByTecnico(@Param("tecnicoId") Integer tecnicoId);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedTechnician.id = :tecnicoId")
    long countTicketsAsignadosByTecnico(@Param("tecnicoId") Integer tecnicoId);
    
    // 📋 Consultas para obtener tickets del técnico
    @Query("SELECT t FROM Ticket t WHERE t.assignedTechnician.id = :tecnicoId ORDER BY t.createdAt DESC")
    List<Ticket> findTicketsByTecnico(@Param("tecnicoId") Integer tecnicoId);
    
    @Query("SELECT t FROM Ticket t WHERE t.assignedTechnician.id = :tecnicoId AND t.status = :estado ORDER BY t.createdAt DESC")
    List<Ticket> findTicketsByTecnicoAndEstado(@Param("tecnicoId") Integer tecnicoId, @Param("estado") String estado);
    
    // 🔍 Consultas adicionales útiles
    @Query("SELECT t FROM Ticket t WHERE t.assignedTechnician.id = :tecnicoId AND t.status IN ('PENDIENTE', 'EN_PROCESO') ORDER BY t.priority DESC, t.createdAt ASC")
    List<Ticket> findTicketsActivosByTecnico(@Param("tecnicoId") Integer tecnicoId);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedTechnician.id = :tecnicoId AND t.status IN ('PENDIENTE', 'EN_PROCESO')")
    long countTicketsActivosByTecnico(@Param("tecnicoId") Integer tecnicoId);
}
