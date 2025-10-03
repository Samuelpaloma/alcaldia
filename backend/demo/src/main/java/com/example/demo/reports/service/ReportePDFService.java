package com.example.demo.reports.service;

import com.example.demo.encuesta.model.EncuestaSatisfaccion;
import com.example.demo.encuesta.repository.EncuestaSatisfaccionRepository;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportePDFService {

    private final TicketRepository ticketRepository;
    private final EncuestaSatisfaccionRepository encuestaRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Generar reporte mensual completo
     */
    public byte[] generarReporteMensual(int mes, int año) {
        log.info("🔍 [REPORTE-PDF] Generando reporte mensual para {}/{}", mes, año);
        
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            // Obtener datos del mes
            List<Ticket> ticketsDelMes = obtenerTicketsDelMes(mes, año);
            List<EncuestaSatisfaccion> encuestasDelMes = obtenerEncuestasDelMes(mes, año);
            
            // Generar contenido del PDF
            StringBuilder contenido = new StringBuilder();
            contenido.append(generarCabeceraReporteMensual(mes, año));
            contenido.append(generarResumenEjecutivo(ticketsDelMes, encuestasDelMes));
            contenido.append(generarEstadisticasTickets(ticketsDelMes));
            contenido.append(generarEstadisticasSatisfaccion(encuestasDelMes));
            contenido.append(generarAnalisisPorCategoria(ticketsDelMes));
            contenido.append(generarAnalisisPorTecnico(ticketsDelMes));
            contenido.append(generarTendenciasMensuales(ticketsDelMes));
            contenido.append(generarRecomendaciones(ticketsDelMes, encuestasDelMes));
            contenido.append(generarPieReporte());
            
            // Convertir a bytes (simulación - en producción usar iText o similar)
            String contenidoStr = contenido.toString();
            outputStream.write(contenidoStr.getBytes());
            
            log.info("🔍 [REPORTE-PDF] Reporte mensual generado exitosamente");
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            log.error("🔍 [REPORTE-PDF] Error generando reporte mensual: {}", e.getMessage(), e);
            throw new RuntimeException("Error generando reporte mensual", e);
        }
    }

    /**
     * Generar reporte de satisfacción
     */
    public byte[] generarReporteSatisfaccion(int mes, int año) {
        log.info("🔍 [REPORTE-PDF] Generando reporte de satisfacción para {}/{}", mes, año);
        
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            List<EncuestaSatisfaccion> encuestasDelMes = obtenerEncuestasDelMes(mes, año);
            
            StringBuilder contenido = new StringBuilder();
            contenido.append(generarCabeceraReporteSatisfaccion(mes, año));
            contenido.append(generarEstadisticasSatisfaccion(encuestasDelMes));
            contenido.append(generarAnalisisDetalladoSatisfaccion(encuestasDelMes));
            contenido.append(generarComentariosDestacados(encuestasDelMes));
            contenido.append(generarPieReporte());
            
            String contenidoStr = contenido.toString();
            outputStream.write(contenidoStr.getBytes());
            
            log.info("🔍 [REPORTE-PDF] Reporte de satisfacción generado exitosamente");
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            log.error("🔍 [REPORTE-PDF] Error generando reporte de satisfacción: {}", e.getMessage(), e);
            throw new RuntimeException("Error generando reporte de satisfacción", e);
        }
    }

    /**
     * Generar reporte de rendimiento
     */
    public byte[] generarReporteRendimiento(int mes, int año) {
        log.info("🔍 [REPORTE-PDF] Generando reporte de rendimiento para {}/{}", mes, año);
        
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            List<Ticket> ticketsDelMes = obtenerTicketsDelMes(mes, año);
            
            StringBuilder contenido = new StringBuilder();
            contenido.append(generarCabeceraReporteRendimiento(mes, año));
            contenido.append(generarMetricasRendimiento(ticketsDelMes));
            contenido.append(generarAnalisisPorTecnico(ticketsDelMes));
            contenido.append(generarTiemposResolucion(ticketsDelMes));
            contenido.append(generarSLACompliance(ticketsDelMes));
            contenido.append(generarPieReporte());
            
            String contenidoStr = contenido.toString();
            outputStream.write(contenidoStr.getBytes());
            
            log.info("🔍 [REPORTE-PDF] Reporte de rendimiento generado exitosamente");
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            log.error("🔍 [REPORTE-PDF] Error generando reporte de rendimiento: {}", e.getMessage(), e);
            throw new RuntimeException("Error generando reporte de rendimiento", e);
        }
    }

    /**
     * Generar reporte por categoría
     */
    public byte[] generarReporteCategoria(int mes, int año) {
        log.info("🔍 [REPORTE-PDF] Generando reporte por categoría para {}/{}", mes, año);
        
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            List<Ticket> ticketsDelMes = obtenerTicketsDelMes(mes, año);
            
            StringBuilder contenido = new StringBuilder();
            contenido.append(generarCabeceraReporteCategoria(mes, año));
            contenido.append(generarAnalisisPorCategoria(ticketsDelMes));
            contenido.append(generarTendenciasPorCategoria(ticketsDelMes));
            contenido.append(generarRecomendacionesCategoria(ticketsDelMes));
            contenido.append(generarPieReporte());
            
            String contenidoStr = contenido.toString();
            outputStream.write(contenidoStr.getBytes());
            
            log.info("🔍 [REPORTE-PDF] Reporte por categoría generado exitosamente");
            return outputStream.toByteArray();
            
        } catch (IOException e) {
            log.error("🔍 [REPORTE-PDF] Error generando reporte por categoría: {}", e.getMessage(), e);
            throw new RuntimeException("Error generando reporte por categoría", e);
        }
    }

    // Métodos auxiliares para obtener datos
    private List<Ticket> obtenerTicketsDelMes(int mes, int año) {
        return ticketRepository.findAll().stream()
                .filter(ticket -> {
                    LocalDateTime fechaCreacion = ticket.getCreatedAt();
                    return fechaCreacion != null && fechaCreacion.getMonthValue() == mes && fechaCreacion.getYear() == año;
                })
                .collect(Collectors.toList());
    }

    private List<EncuestaSatisfaccion> obtenerEncuestasDelMes(int mes, int año) {
        return encuestaRepository.findAll().stream()
                .filter(encuesta -> {
                    LocalDateTime fechaCreacion = encuesta.getFechaCreacion();
                    return fechaCreacion != null && fechaCreacion.getMonthValue() == mes && fechaCreacion.getYear() == año;
                })
                .collect(Collectors.toList());
    }

    // Métodos para generar contenido del PDF
    private String generarCabeceraReporteMensual(int mes, int año) {
        return String.format("""
            ================================================
            REPORTE MENSUAL DE GESTIÓN DE TICKETS
            %s %d
            ================================================
            
            """, obtenerNombreMes(mes), año);
    }

    private String generarCabeceraReporteSatisfaccion(int mes, int año) {
        return String.format("""
            ================================================
            REPORTE DE SATISFACCIÓN DEL CLIENTE
            %s %d
            ================================================
            
            """, obtenerNombreMes(mes), año);
    }

    private String generarCabeceraReporteRendimiento(int mes, int año) {
        return String.format("""
            ================================================
            REPORTE DE RENDIMIENTO DEL EQUIPO
            %s %d
            ================================================
            
            """, obtenerNombreMes(mes), año);
    }

    private String generarCabeceraReporteCategoria(int mes, int año) {
        return String.format("""
            ================================================
            REPORTE POR CATEGORÍAS
            %s %d
            ================================================
            
            """, obtenerNombreMes(mes), año);
    }

    private String generarResumenEjecutivo(List<Ticket> tickets, List<EncuestaSatisfaccion> encuestas) {
        long totalTickets = tickets.size();
        long ticketsResueltos = tickets.stream().filter(t -> "RESUELTO".equals(t.getStatus())).count();
        double satisfaccionPromedio = encuestas.stream().mapToInt(EncuestaSatisfaccion::getCalificacion).average().orElse(0.0);
        
        return String.format("""
            RESUMEN EJECUTIVO
            -----------------
            Total de Tickets: %d
            Tickets Resueltos: %d (%.1f%%)
            Satisfacción Promedio: %.1f/5.0
            Fecha de Generación: %s
            
            """, totalTickets, ticketsResueltos, 
                 totalTickets > 0 ? (ticketsResueltos * 100.0 / totalTickets) : 0.0,
                 satisfaccionPromedio, LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
    }

    private String generarEstadisticasTickets(List<Ticket> tickets) {
        long total = tickets.size();
        long resueltos = tickets.stream().filter(t -> "RESUELTO".equals(t.getStatus())).count();
        long pendientes = tickets.stream().filter(t -> "PENDIENTE".equals(t.getStatus())).count();
        long enProceso = tickets.stream().filter(t -> "EN_PROCESO".equals(t.getStatus())).count();
        
        return String.format("""
            ESTADÍSTICAS DE TICKETS
            ------------------------
            Total de Tickets: %d
            - Resueltos: %d (%.1f%%)
            - Pendientes: %d (%.1f%%)
            - En Proceso: %d (%.1f%%)
            
            """, total, resueltos, total > 0 ? (resueltos * 100.0 / total) : 0.0,
                 pendientes, total > 0 ? (pendientes * 100.0 / total) : 0.0,
                 enProceso, total > 0 ? (enProceso * 100.0 / total) : 0.0);
    }

    private String generarEstadisticasSatisfaccion(List<EncuestaSatisfaccion> encuestas) {
        if (encuestas.isEmpty()) {
            return "ESTADÍSTICAS DE SATISFACCIÓN\n---------------------------\nNo hay encuestas disponibles para este período.\n\n";
        }
        
        double promedio = encuestas.stream().mapToInt(EncuestaSatisfaccion::getCalificacion).average().orElse(0.0);
        long total = encuestas.size();
        
        Map<Integer, Long> conteos = encuestas.stream()
                .collect(Collectors.groupingBy(EncuestaSatisfaccion::getCalificacion, Collectors.counting()));
        
        StringBuilder sb = new StringBuilder();
        sb.append("ESTADÍSTICAS DE SATISFACCIÓN\n");
        sb.append("----------------------------\n");
        sb.append(String.format("Total de Encuestas: %d\n", total));
        sb.append(String.format("Satisfacción Promedio: %.1f/5.0\n\n", promedio));
        sb.append("Distribución por Calificación:\n");
        
        for (int i = 1; i <= 5; i++) {
            long cantidad = conteos.getOrDefault(i, 0L);
            double porcentaje = total > 0 ? (cantidad * 100.0 / total) : 0.0;
            sb.append(String.format("- %d estrella%s: %d (%.1f%%)\n", i, i != 1 ? "s" : "", cantidad, porcentaje));
        }
        sb.append("\n");
        
        return sb.toString();
    }

    private String generarAnalisisPorCategoria(List<Ticket> tickets) {
        Map<String, Long> porCategoria = tickets.stream()
                .collect(Collectors.groupingBy(
                    t -> t.getCategoryName() != null ? t.getCategoryName() : "Sin categoría",
                    Collectors.counting()
                ));
        
        StringBuilder sb = new StringBuilder();
        sb.append("ANÁLISIS POR CATEGORÍA\n");
        sb.append("----------------------\n");
        
        porCategoria.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .forEach(entry -> {
                    double porcentaje = tickets.size() > 0 ? (entry.getValue() * 100.0 / tickets.size()) : 0.0;
                    sb.append(String.format("- %s: %d tickets (%.1f%%)\n", entry.getKey(), entry.getValue(), porcentaje));
                });
        sb.append("\n");
        
        return sb.toString();
    }

    private String generarAnalisisPorTecnico(List<Ticket> tickets) {
        Map<String, Long> porTecnico = tickets.stream()
                .filter(t -> t.getAssignedTechnician() != null)
                .collect(Collectors.groupingBy(
                    t -> t.getAssignedTechnician().getFullName(),
                    Collectors.counting()
                ));
        
        StringBuilder sb = new StringBuilder();
        sb.append("ANÁLISIS POR TÉCNICO\n");
        sb.append("--------------------\n");
        
        if (porTecnico.isEmpty()) {
            sb.append("No hay tickets asignados a técnicos en este período.\n\n");
        } else {
            porTecnico.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .forEach(entry -> {
                        double porcentaje = tickets.size() > 0 ? (entry.getValue() * 100.0 / tickets.size()) : 0.0;
                        sb.append(String.format("- %s: %d tickets (%.1f%%)\n", entry.getKey(), entry.getValue(), porcentaje));
                    });
        }
        sb.append("\n");
        
        return sb.toString();
    }

    private String generarTendenciasMensuales(List<Ticket> tickets) {
        return "TENDENCIAS MENSUALES\n" +
               "--------------------\n" +
               "Análisis de tendencias y patrones del mes.\n" +
               "(Implementar análisis detallado según necesidades)\n\n";
    }

    private String generarRecomendaciones(List<Ticket> tickets, List<EncuestaSatisfaccion> encuestas) {
        return "RECOMENDACIONES\n" +
               "---------------\n" +
               "Basado en el análisis de tickets y satisfacción:\n" +
               "1. Continuar con las prácticas actuales que generan alta satisfacción\n" +
               "2. Revisar tickets pendientes para mejorar tiempos de respuesta\n" +
               "3. Capacitar al equipo en áreas con mayor volumen de tickets\n\n";
    }

    private String generarMetricasRendimiento(List<Ticket> tickets) {
        return "MÉTRICAS DE RENDIMIENTO\n" +
               "-----------------------\n" +
               "Análisis de productividad y eficiencia del equipo.\n" +
               "(Implementar métricas específicas según necesidades)\n\n";
    }

    private String generarTiemposResolucion(List<Ticket> tickets) {
        return "TIEMPOS DE RESOLUCIÓN\n" +
               "---------------------\n" +
               "Análisis de tiempos promedio de resolución por técnico y categoría.\n" +
               "(Implementar cálculos específicos según necesidades)\n\n";
    }

    private String generarSLACompliance(List<Ticket> tickets) {
        return "CUMPLIMIENTO DE SLA\n" +
               "-------------------\n" +
               "Análisis del cumplimiento de acuerdos de nivel de servicio.\n" +
               "(Implementar análisis específico según necesidades)\n\n";
    }

    private String generarAnalisisDetalladoSatisfaccion(List<EncuestaSatisfaccion> encuestas) {
        return "ANÁLISIS DETALLADO DE SATISFACCIÓN\n" +
               "----------------------------------\n" +
               "Análisis profundo de comentarios y aspectos positivos/negativos.\n" +
               "(Implementar análisis específico según necesidades)\n\n";
    }

    private String generarComentariosDestacados(List<EncuestaSatisfaccion> encuestas) {
        return "COMENTARIOS DESTACADOS\n" +
               "---------------------\n" +
               "Comentarios más relevantes de las encuestas de satisfacción.\n" +
               "(Implementar selección específica según necesidades)\n\n";
    }

    private String generarTendenciasPorCategoria(List<Ticket> tickets) {
        return "TENDENCIAS POR CATEGORÍA\n" +
               "------------------------\n" +
               "Análisis de tendencias y patrones por categoría de tickets.\n" +
               "(Implementar análisis específico según necesidades)\n\n";
    }

    private String generarRecomendacionesCategoria(List<Ticket> tickets) {
        return "RECOMENDACIONES POR CATEGORÍA\n" +
               "-----------------------------\n" +
               "Recomendaciones específicas para cada categoría de tickets.\n" +
               "(Implementar recomendaciones específicas según necesidades)\n\n";
    }

    private String generarPieReporte() {
        return "================================================\n" +
               "Reporte generado automáticamente el " + 
               LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + "\n" +
               "Sistema de Gestión de Tickets - Alcaldía\n" +
               "================================================\n";
    }

    private String obtenerNombreMes(int mes) {
        String[] meses = {"", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                         "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"};
        return meses[mes];
    }
}
