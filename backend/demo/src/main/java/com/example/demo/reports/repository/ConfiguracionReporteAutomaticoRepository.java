package com.example.demo.reports.repository;

import com.example.demo.reports.model.ConfiguracionReporteAutomatico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConfiguracionReporteAutomaticoRepository extends JpaRepository<ConfiguracionReporteAutomatico, Long> {
    
    // Buscar configuraciones activas
    List<ConfiguracionReporteAutomatico> findByActivoTrue();
    
    // Buscar por tipo de reporte
    List<ConfiguracionReporteAutomatico> findByTipoReporteAndActivoTrue(String tipoReporte);
    
    // Buscar configuraciones que deben ejecutarse
    @Query("SELECT c FROM ConfiguracionReporteAutomatico c WHERE c.activo = true AND c.proximaGeneracion <= :ahora")
    List<ConfiguracionReporteAutomatico> findConfiguracionesParaEjecutar(LocalDateTime ahora);
    
    // Buscar por tipo y activo
    ConfiguracionReporteAutomatico findByTipoReporteAndActivoTrueAndId(String tipoReporte, Long id);
}
