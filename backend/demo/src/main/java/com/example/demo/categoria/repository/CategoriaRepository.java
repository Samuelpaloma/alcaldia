package com.example.demo.categoria.repository;

import com.example.demo.categoria.model.Categoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    
    // Buscar por nombre (case insensitive)
    Optional<Categoria> findByNameIgnoreCase(String name);
    
    // Verificar si existe por nombre (excluyendo un ID específico)
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    
    // Buscar categorías activas
    List<Categoria> findByActiveTrueOrderByOrderAsc();
    
    // Buscar categorías activas con paginación
    Page<Categoria> findByActiveTrueOrderByOrderAsc(Pageable pageable);
    
    // Buscar por nombre (activas)
    @Query("SELECT c FROM Categoria c WHERE c.active = true AND LOWER(c.name) LIKE LOWER(CONCAT('%', :nombre, '%')) ORDER BY c.order ASC")
    List<Categoria> findActivasByNombreContainingIgnoreCase(@Param("nombre") String nombre);
    
    // Contar categorías activas
    long countByActiveTrue();
    
    // Obtener siguiente orden disponible
    @Query("SELECT COALESCE(MAX(c.order), 0) + 1 FROM Categoria c")
    Integer getNextOrden();
    
    // Buscar por estado (activa/inactiva)
    List<Categoria> findByActiveOrderByOrderAsc(Boolean active);
    
    // Buscar todas con paginación y filtros
    @Query("SELECT c FROM Categoria c WHERE " +
           "(:activa IS NULL OR c.active = :activa) AND " +
           "(:nombre IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :nombre, '%'))) " +
           "ORDER BY c.order ASC, c.name ASC")
    Page<Categoria> findWithFilters(@Param("activa") Boolean activa, 
                                   @Param("nombre") String nombre, 
                                   Pageable pageable);
}


