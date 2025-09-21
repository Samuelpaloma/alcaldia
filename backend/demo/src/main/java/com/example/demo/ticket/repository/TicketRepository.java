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
    Page<Ticket> findByCreadorOrderByFechaCreacionDesc(Usuario creador, Pageable pageable);
    
    // Buscar tickets por múltiples criterios
    @Query("SELECT t FROM Ticket t WHERE t.creador = :creador " +
           "AND (:categoria IS NULL OR t.categoria.nombre = :categoria) " +
           "AND (:estado IS NULL OR t.estado = :estado) " +
           "AND (:prioridad IS NULL OR t.prioridad = :prioridad)")
    List<Ticket> findByCreadorAndCategoriaAndEstadoAndPrioridad(
            @Param("creador") Usuario creador,
            @Param("categoria") String categoria,
            @Param("estado") String estado,
            @Param("prioridad") String prioridad);
    
    // Buscar tickets por estado
    List<Ticket> findByEstado(String estado);
    
    // Buscar tickets por categoría (por nombre de categoría)
    @Query("SELECT t FROM Ticket t WHERE t.categoria.nombre = :categoria")
    List<Ticket> findByCategoriaNombre(@Param("categoria") String categoria);
    
    // Buscar tickets por categoría (usando la entidad Categoria)
    List<Ticket> findByCategoria(Categoria categoria);
    
    // Buscar tickets por prioridad
    List<Ticket> findByPrioridad(String prioridad);
    
    // Contar tickets por estado
    long countByEstado(String estado);
    
    // Contar tickets por creador
    long countByCreador(Usuario creador);
    
    // Buscar tickets por técnico asignado
    List<Ticket> findByTecnicoAsignado(Usuario tecnico);
    
    // Buscar tickets sin asignar
    List<Ticket> findByTecnicoAsignadoIsNull();
    
    // Buscar tickets asignados ordenados por fecha
    List<Ticket> findByTecnicoAsignadoOrderByFechaCreacionDesc(Usuario tecnico);
    
    // Contar tickets por técnico asignado
    long countByTecnicoAsignado(Usuario tecnico);
}
