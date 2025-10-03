package com.example.demo.reports.repository;

import com.example.demo.reports.model.ReporteMensual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReporteMensualRepository extends JpaRepository<ReporteMensual, Long> {
    
    // Buscar reportes activos ordenados por fecha de generación descendente
    List<ReporteMensual> findByActivoTrueOrderByFechaGeneracionDesc();
    
    // Buscar por tipo de reporte
    List<ReporteMensual> findByTipoReporteAndActivoTrueOrderByFechaGeneracionDesc(String tipoReporte);
    
    // Buscar por mes y año
    List<ReporteMensual> findByMesAndAñoAndActivoTrueOrderByFechaGeneracionDesc(Integer mes, Integer año);
    
    // Buscar por tipo, mes y año
    List<ReporteMensual> findByTipoReporteAndMesAndAñoAndActivoTrueOrderByFechaGeneracionDesc(
            String tipoReporte, Integer mes, Integer año);
    
    // Buscar reportes generados en un rango de fechas
    @Query("SELECT r FROM ReporteMensual r WHERE r.activo = true AND r.fechaGeneracion BETWEEN :fechaInicio AND :fechaFin ORDER BY r.fechaGeneracion DESC")
    List<ReporteMensual> findByFechaGeneracionBetweenAndActivoTrueOrderByFechaGeneracionDesc(
            LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    // Contar reportes por tipo
    @Query("SELECT r.tipoReporte, COUNT(r) FROM ReporteMensual r WHERE r.activo = true GROUP BY r.tipoReporte")
    List<Object[]> contarReportesPorTipo();
    
    // Obtener reportes más recientes
    List<ReporteMensual> findTop10ByActivoTrueOrderByFechaGeneracionDesc();
}
