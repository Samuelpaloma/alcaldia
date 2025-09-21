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
    Optional<Categoria> findByNombreIgnoreCase(String nombre);
    
    // Verificar si existe por nombre (excluyendo un ID específico)
    boolean existsByNombreIgnoreCaseAndIdCategoriaNot(String nombre, Long idCategoria);
    
    // Buscar categorías activas
    List<Categoria> findByActivaTrueOrderByOrdenAsc();
    
    // Buscar categorías activas con paginación
    Page<Categoria> findByActivaTrueOrderByOrdenAsc(Pageable pageable);
    
    // Buscar por nombre (activas)
    @Query("SELECT c FROM Categoria c WHERE c.activa = true AND LOWER(c.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) ORDER BY c.orden ASC")
    List<Categoria> findActivasByNombreContainingIgnoreCase(@Param("nombre") String nombre);
    
    // Contar categorías activas
    long countByActivaTrue();
    
    // Obtener siguiente orden disponible
    @Query("SELECT COALESCE(MAX(c.orden), 0) + 1 FROM Categoria c")
    Integer getNextOrden();
    
    // Buscar por estado (activa/inactiva)
    List<Categoria> findByActivaOrderByOrdenAsc(Boolean activa);
    
    // Buscar todas con paginación y filtros
    @Query("SELECT c FROM Categoria c WHERE " +
           "(:activa IS NULL OR c.activa = :activa) AND " +
           "(:nombre IS NULL OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) " +
           "ORDER BY c.orden ASC, c.nombre ASC")
    Page<Categoria> findWithFilters(@Param("activa") Boolean activa, 
                                   @Param("nombre") String nombre, 
                                   Pageable pageable);
}


