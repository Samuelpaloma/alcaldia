package com.example.demo.encuesta.repository;

import com.example.demo.encuesta.model.EncuestaSatisfaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EncuestaSatisfaccionRepository extends JpaRepository<EncuestaSatisfaccion, Long> {
    
    // Buscar encuestas por ticket
    List<EncuestaSatisfaccion> findByTicketIdAndActivoTrue(Long ticketId);
    
    // Buscar encuestas por usuario
    List<EncuestaSatisfaccion> findByUsuarioIdUsuarioAndActivoTrue(Long idUsuario);
    
    // Buscar encuestas en un rango de fechas
    List<EncuestaSatisfaccion> findByFechaCreacionBetweenAndActivoTrue(
            LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    // Calcular promedio de calificaciones
    @Query("SELECT AVG(e.calificacion) FROM EncuestaSatisfaccion e WHERE e.activo = true")
    Double calcularPromedioCalificaciones();
    
    // Calcular promedio de calificaciones en un rango de fechas
    @Query("SELECT AVG(e.calificacion) FROM EncuestaSatisfaccion e WHERE e.activo = true AND e.fechaCreacion BETWEEN :fechaInicio AND :fechaFin")
    Double calcularPromedioCalificacionesPorFecha(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                                  @Param("fechaFin") LocalDateTime fechaFin);
    
    // Contar encuestas por calificación
    @Query("SELECT e.calificacion, COUNT(e) FROM EncuestaSatisfaccion e WHERE e.activo = true GROUP BY e.calificacion ORDER BY e.calificacion")
    List<Object[]> contarEncuestasPorCalificacion();
    
    // Obtener encuestas recientes
    List<EncuestaSatisfaccion> findTop10ByActivoTrueOrderByFechaCreacionDesc();
}
