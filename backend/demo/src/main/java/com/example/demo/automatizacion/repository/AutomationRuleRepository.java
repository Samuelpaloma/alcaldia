package com.example.demo.automatizacion.repository;

import com.example.demo.automatizacion.model.AutomationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AutomationRuleRepository extends JpaRepository<AutomationRule, Long> {
    
    // Buscar reglas activas
    List<AutomationRule> findByActivaTrue();
    
    // Buscar reglas por prioridad
    List<AutomationRule> findByPrioridad(String prioridad);
    
    // Buscar reglas activas por prioridad
    List<AutomationRule> findByActivaTrueAndPrioridad(String prioridad);
    
    // Buscar reglas por nombre (búsqueda parcial)
    @Query("SELECT r FROM AutomationRule r WHERE LOWER(r.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<AutomationRule> findByNombreContainingIgnoreCase(@Param("nombre") String nombre);
    
    // Contar reglas activas
    long countByActivaTrue();
    
    // Obtener estadísticas de ejecuciones
    @Query("SELECT SUM(r.ejecuciones) FROM AutomationRule r WHERE r.activa = true")
    Long sumEjecucionesByActivaTrue();
    
    // Buscar reglas que necesitan ejecutarse (para el motor de reglas)
    @Query("SELECT r FROM AutomationRule r WHERE r.activa = true ORDER BY r.prioridad DESC, r.fechaCreacion ASC")
    List<AutomationRule> findReglasParaEjecutar();
}
