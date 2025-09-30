package com.example.demo.automation.repository;

import com.example.demo.automation.model.ReglaAutomatizacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReglaAutomatizacionRepository extends JpaRepository<ReglaAutomatizacion, Long> {
    
    // Buscar reglas activas ordenadas por prioridad
    List<ReglaAutomatizacion> findByActivaTrueOrderByPrioridadDescFechaCreacionAsc();
    
    // Buscar reglas activas con paginación
    Page<ReglaAutomatizacion> findByActivaTrueOrderByPrioridadDescFechaCreacionAsc(Pageable pageable);
    
    // Buscar por nombre (case insensitive)
    List<ReglaAutomatizacion> findByNombreContainingIgnoreCase(String nombre);
    
    // Buscar por estado
    List<ReglaAutomatizacion> findByActivaOrderByPrioridadDescFechaCreacionAsc(Boolean activa);
    
    // Buscar por prioridad
    List<ReglaAutomatizacion> findByPrioridadOrderByFechaCreacionAsc(Integer prioridad);
    
    // Buscar reglas que no se han ejecutado en X días
    @Query("SELECT r FROM ReglaAutomatizacion r WHERE r.activa = true AND " +
           "(r.ultimaEjecucion IS NULL OR r.ultimaEjecucion < :fechaLimite)")
    List<ReglaAutomatizacion> findReglasNoEjecutadas(@Param("fechaLimite") java.time.LocalDateTime fechaLimite);
    
    // Contar reglas activas
    long countByActivaTrue();
    
    // Contar ejecuciones totales
    @Query("SELECT COALESCE(SUM(r.ejecuciones), 0) FROM ReglaAutomatizacion r WHERE r.activa = true")
    Long sumEjecucionesActivas();
    
    // Buscar con filtros múltiples
    @Query("SELECT r FROM ReglaAutomatizacion r WHERE " +
           "(:activa IS NULL OR r.activa = :activa) AND " +
           "(:nombre IS NULL OR LOWER(r.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) AND " +
           "(:prioridad IS NULL OR r.prioridad = :prioridad) " +
           "ORDER BY r.prioridad DESC, r.fechaCreacion ASC")
    Page<ReglaAutomatizacion> findWithFilters(@Param("activa") Boolean activa,
                                             @Param("nombre") String nombre,
                                             @Param("prioridad") Integer prioridad,
                                             Pageable pageable);
}
