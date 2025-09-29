package com.example.demo.sla.repository;

import com.example.demo.sla.model.SLAConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SLAConfigurationRepository extends JpaRepository<SLAConfiguration, Long> {
    
    /**
     * Buscar configuraciones SLA activas
     */
    List<SLAConfiguration> findByActivoTrue();
    
    /**
     * Buscar configuraciones SLA por prioridad
     */
    List<SLAConfiguration> findByPrioridad(String prioridad);
    
    /**
     * Buscar configuraciones SLA por categoría
     */
    List<SLAConfiguration> findByCategoriaId(Long categoriaId);
    
    /**
     * Buscar configuraciones SLA por nombre (búsqueda parcial)
     */
    List<SLAConfiguration> findByNombreContainingIgnoreCase(String nombre);
    
    /**
     * Buscar configuraciones SLA activas por prioridad
     */
    List<SLAConfiguration> findByActivoTrueAndPrioridad(String prioridad);
    
    /**
     * Buscar configuraciones SLA activas por categoría
     */
    List<SLAConfiguration> findByActivoTrueAndCategoriaId(Long categoriaId);
    
    /**
     * Buscar configuración SLA por categoría y prioridad
     */
    @Query("SELECT s FROM SLAConfiguration s WHERE s.categoriaId = :categoriaId AND s.prioridad = :prioridad AND s.activo = true")
    Optional<SLAConfiguration> findByCategoriaIdAndPrioridadAndActivoTrue(
        @Param("categoriaId") Long categoriaId, 
        @Param("prioridad") String prioridad
    );
    
    /**
     * Contar configuraciones SLA activas
     */
    long countByActivoTrue();
    
    /**
     * Contar configuraciones SLA inactivas
     */
    long countByActivoFalse();
}
