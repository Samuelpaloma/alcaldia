package com.example.demo.reports.repository;

import com.example.demo.reports.model.ReporteUsuario;
import com.example.demo.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReporteUsuarioRepository extends JpaRepository<ReporteUsuario, Long> {
    
    // Buscar reportes por usuario ordenados por fecha de generación descendente
    List<ReporteUsuario> findByUsuarioAndActivoTrueOrderByFechaGeneracionDesc(Usuario usuario);
    
    // Buscar por usuario y tipo de período
    List<ReporteUsuario> findByUsuarioAndTipoPeriodoAndActivoTrueOrderByFechaGeneracionDesc(
            Usuario usuario, String tipoPeriodo);
    
    // Buscar por usuario en un rango de fechas
    @Query("SELECT r FROM ReporteUsuario r WHERE r.usuario = :usuario AND r.activo = true AND r.fechaGeneracion BETWEEN :fechaInicio AND :fechaFin ORDER BY r.fechaGeneracion DESC")
    List<ReporteUsuario> findByUsuarioAndFechaGeneracionBetweenAndActivoTrueOrderByFechaGeneracionDesc(
            Usuario usuario, LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    // Buscar por título (búsqueda de texto)
    @Query("SELECT r FROM ReporteUsuario r WHERE r.usuario = :usuario AND r.activo = true AND (LOWER(r.titulo) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR LOWER(r.subtitulo) LIKE LOWER(CONCAT('%', :busqueda, '%'))) ORDER BY r.fechaGeneracion DESC")
    List<ReporteUsuario> findByUsuarioAndTituloContainingIgnoreCaseAndActivoTrueOrderByFechaGeneracionDesc(
            Usuario usuario, String busqueda);
    
    // Contar reportes por usuario
    Long countByUsuarioAndActivoTrue(Usuario usuario);
    
    // Contar reportes por usuario y tipo de período
    Long countByUsuarioAndTipoPeriodoAndActivoTrue(Usuario usuario, String tipoPeriodo);
    
    // Obtener reportes más recientes del usuario
    List<ReporteUsuario> findTop10ByUsuarioAndActivoTrueOrderByFechaGeneracionDesc(Usuario usuario);
    
    // Buscar todos los reportes activos (para administradores)
    List<ReporteUsuario> findByActivoTrueOrderByFechaGeneracionDesc();
    
    // Buscar por usuario específico por ID
    List<ReporteUsuario> findByUsuarioIdAndActivoTrueOrderByFechaGeneracionDesc(Long usuarioId);
}

