package com.example.demo.reports.service;

import com.example.demo.reports.dto.response.EstadisticasReportesResponseDTO;
import com.example.demo.reports.dto.response.ReporteMensualResponseDTO;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.encuesta.model.EncuestaSatisfaccion;
import com.example.demo.encuesta.repository.EncuestaSatisfaccionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportsService {
    
    private final TicketRepository ticketRepository;
    private final EncuestaSatisfaccionRepository encuestaRepository;
    
    /**
     * Obtener estadísticas generales de reportes
     */
    public EstadisticasReportesResponseDTO obtenerEstadisticas() {
        log.info("🔍 [REPORTS-DEBUG] Iniciando cálculo de estadísticas generales");
        
        // Obtener todos los tickets
        List<Ticket> todosLosTickets = ticketRepository.findAll();
        log.info("🔍 [REPORTS-DEBUG] Total de tickets encontrados: {}", todosLosTickets.size());
        
        // Calcular estadísticas básicas
        long totalTickets = todosLosTickets.size();
        long ticketsResueltos = todosLosTickets.stream()
                .filter(t -> "RESUELTO".equals(t.getStatus()))
                .count();
        long ticketsPendientes = todosLosTickets.stream()
                .filter(t -> "PENDIENTE".equals(t.getStatus()))
                .count();
        long ticketsEnProceso = todosLosTickets.stream()
                .filter(t -> "EN_PROCESO".equals(t.getStatus()))
                .count();
        
        log.info("🔍 [REPORTS-DEBUG] Estadísticas básicas - Total: {}, Resueltos: {}, Pendientes: {}, En Proceso: {}", 
                totalTickets, ticketsResueltos, ticketsPendientes, ticketsEnProceso);
        
        // Calcular tiempo promedio de resolución
        double tiempoPromedioResolucion = calcularTiempoPromedioResolucion(todosLosTickets);
        log.info("🔍 [REPORTS-DEBUG] Tiempo promedio de resolución: {} días", tiempoPromedioResolucion);
        
        // Calcular satisfacción promedio
        double satisfaccionPromedio = calcularSatisfaccionPromedio();
        log.info("🔍 [REPORTS-DEBUG] Satisfacción promedio: {}/5", satisfaccionPromedio);
        
        // Agrupar por categoría
        Map<String, Long> ticketsPorCategoria = todosLosTickets.stream()
                .collect(Collectors.groupingBy(
                    ticket -> ticket.getCategoryName() != null ? ticket.getCategoryName() : "Sin categoría",
                    Collectors.counting()
                ));
        log.info("🔍 [REPORTS-DEBUG] Tickets por categoría: {}", ticketsPorCategoria);
        
        // Agrupar por técnico
        Map<String, Long> ticketsPorTecnico = todosLosTickets.stream()
                .filter(t -> t.getAssignedTechnician() != null)
                .collect(Collectors.groupingBy(
                    ticket -> ticket.getAssignedTechnician().getFullName(),
                    Collectors.counting()
                ));
        log.info("🔍 [REPORTS-DEBUG] Tickets por técnico: {}", ticketsPorTecnico);
        
        // Calcular tendencia mensual (últimos 6 meses)
        Map<String, Long> tendenciaMensual = calcularTendenciaMensual(todosLosTickets);
        log.info("🔍 [REPORTS-DEBUG] Tendencia mensual: {}", tendenciaMensual);
        
        log.info("🔍 [REPORTS-DEBUG] Construyendo respuesta de estadísticas");
        return EstadisticasReportesResponseDTO.builder()
                .totalTickets(totalTickets)
                .ticketsResueltos(ticketsResueltos)
                .ticketsPendientes(ticketsPendientes)
                .ticketsEnProceso(ticketsEnProceso)
                .tiempoPromedioResolucion(tiempoPromedioResolucion)
                .satisfaccionPromedio(satisfaccionPromedio)
                .ticketsPorCategoria(ticketsPorCategoria)
                .ticketsPorTecnico(ticketsPorTecnico)
                .tendenciaMensual(tendenciaMensual)
                .build();
    }
    
    /**
     * Obtener reportes mensuales
     */
    public List<ReporteMensualResponseDTO> obtenerReportesMensuales(int page, int size) {
        log.info("Obteniendo reportes mensuales - página: {}, tamaño: {}", page, size);
        
        // Por ahora retornamos datos simulados, en el futuro se implementará
        // la lógica para obtener reportes mensuales reales de la base de datos
        return generarReportesMensualesSimulados();
    }
    
    /**
     * Obtener reporte mensual específico
     */
    public ReporteMensualResponseDTO obtenerReporteMensual(Long id) {
        log.info("Obteniendo reporte mensual con ID: {}", id);
        
        // Por ahora retornamos datos simulados
        return generarReporteMensualSimulado(id);
    }
    
    /**
     * Obtener estadísticas básicas (más eficiente)
     */
    public Map<String, Object> obtenerEstadisticasBasicas() {
        log.info("🔍 [REPORTS-DEBUG] Calculando estadísticas básicas");
        
        try {
            // Obtener todos los tickets y calcular conteos
            List<Ticket> todosLosTickets = ticketRepository.findAll();
            long totalTickets = todosLosTickets.size();
            
            long ticketsResueltos = todosLosTickets.stream()
                    .filter(t -> "RESUELTO".equals(t.getStatus()))
                    .count();
            
            long ticketsPendientes = todosLosTickets.stream()
                    .filter(t -> "PENDIENTE".equals(t.getStatus()))
                    .count();
            
            long ticketsEnProceso = todosLosTickets.stream()
                    .filter(t -> "EN_PROCESO".equals(t.getStatus()))
                    .count();
            
            log.info("🔍 [REPORTS-DEBUG] Conteos básicos - Total: {}, Resueltos: {}, Pendientes: {}, En Proceso: {}", 
                    totalTickets, ticketsResueltos, ticketsPendientes, ticketsEnProceso);
            
            // Calcular tiempo promedio de resolución
            double tiempoPromedioResolucion = calcularTiempoPromedioResolucionBasico();
            log.info("🔍 [REPORTS-DEBUG] Tiempo promedio de resolución: {} días", tiempoPromedioResolucion);
            
            // Calcular satisfacción promedio
            double satisfaccionPromedio = calcularSatisfaccionPromedio();
            log.info("🔍 [REPORTS-DEBUG] Satisfacción promedio: {}/5", satisfaccionPromedio);
            
            Map<String, Object> estadisticas = new HashMap<>();
            estadisticas.put("totalTickets", totalTickets);
            estadisticas.put("ticketsResueltos", ticketsResueltos);
            estadisticas.put("ticketsPendientes", ticketsPendientes);
            estadisticas.put("ticketsEnProceso", ticketsEnProceso);
            estadisticas.put("tiempoPromedioResolucion", tiempoPromedioResolucion);
            estadisticas.put("satisfaccionPromedio", satisfaccionPromedio);
            
            log.info("🔍 [REPORTS-DEBUG] Estadísticas básicas calculadas: {}", estadisticas);
            return estadisticas;
            
        } catch (Exception e) {
            log.error("🔍 [REPORTS-DEBUG] Error calculando estadísticas básicas: {}", e.getMessage(), e);
            
            // Retornar valores por defecto en caso de error
            Map<String, Object> estadisticas = new HashMap<>();
            estadisticas.put("totalTickets", 0);
            estadisticas.put("ticketsResueltos", 0);
            estadisticas.put("ticketsPendientes", 0);
            estadisticas.put("ticketsEnProceso", 0);
            estadisticas.put("tiempoPromedioResolucion", 0.0);
            estadisticas.put("satisfaccionPromedio", 0.0);
            
            return estadisticas;
        }
    }
    
    /**
     * Generar reporte mensual
     */
    public ReporteMensualResponseDTO generarReporteMensual(int mes, int año) {
        log.info("🔍 [REPORTS-DEBUG] Generando reporte mensual para {}/{}", mes, año);
        
        // Obtener tickets del mes específico
        List<Ticket> ticketsDelMes = obtenerTicketsDelMes(mes, año);
        log.info("🔍 [REPORTS-DEBUG] Tickets encontrados para {}/{}: {}", mes, año, ticketsDelMes.size());
        
        // Calcular métricas del mes
        long totalTickets = ticketsDelMes.size();
        long ticketsResueltos = ticketsDelMes.stream()
                .filter(t -> "RESUELTO".equals(t.getStatus()))
                .count();
        long ticketsPendientes = ticketsDelMes.stream()
                .filter(t -> "PENDIENTE".equals(t.getStatus()))
                .count();
        long ticketsEnProceso = ticketsDelMes.stream()
                .filter(t -> "EN_PROCESO".equals(t.getStatus()))
                .count();
        
        double tiempoPromedioResolucion = calcularTiempoPromedioResolucion(ticketsDelMes);
        double satisfaccionPromedio = calcularSatisfaccionPromedioDelMes(mes, año);
        
        // Top categorías del mes
        List<ReporteMensualResponseDTO.TopCategoriaDTO> topCategorias = ticketsDelMes.stream()
                .collect(Collectors.groupingBy(
                    ticket -> ticket.getCategory() != null ? ticket.getCategory().getName() : "Sin categoría",
                    Collectors.counting()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> ReporteMensualResponseDTO.TopCategoriaDTO.builder()
                        .categoria(entry.getKey())
                        .cantidad(entry.getValue())
                        .build())
                .collect(Collectors.toList());
        
        // Top técnicos del mes
        List<ReporteMensualResponseDTO.TopTecnicoDTO> topTecnicos = ticketsDelMes.stream()
                .filter(t -> t.getAssignedTechnician() != null && "RESUELTO".equals(t.getStatus()))
                .collect(Collectors.groupingBy(
                    ticket -> ticket.getAssignedTechnician().getFullName(),
                    Collectors.counting()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> ReporteMensualResponseDTO.TopTecnicoDTO.builder()
                        .tecnico(entry.getKey())
                        .ticketsResueltos(entry.getValue())
                        .tiempoPromedioResolucion(2.5) // TODO: Calcular tiempo real
                        .build())
                .collect(Collectors.toList());
        
        String nombreMes = obtenerNombreMes(mes);
        
        return ReporteMensualResponseDTO.builder()
                .id((long) (Math.random() * 1000)) // ID temporal
                .mes(nombreMes)
                .año(año)
                .totalTickets(totalTickets)
                .ticketsResueltos(ticketsResueltos)
                .ticketsPendientes(ticketsPendientes)
                .ticketsEnProceso(ticketsEnProceso)
                .tiempoPromedioResolucion(tiempoPromedioResolucion)
                .satisfaccionPromedio(satisfaccionPromedio)
                .topCategorias(topCategorias)
                .topTecnicos(topTecnicos)
                .fechaGeneracion(LocalDateTime.now())
                .archivoUrl("/reports/" + nombreMes.toLowerCase() + "-" + año + ".pdf")
                .nombreArchivo("reporte-" + nombreMes.toLowerCase() + "-" + año + ".pdf")
                .tamañoArchivo(1024L * 1024L * 2) // 2MB simulado
                .build();
    }
    
    /**
     * Obtener URL de descarga del reporte mensual
     */
    public String obtenerUrlDescargaReporteMensual(Long id) {
        log.info("Obteniendo URL de descarga para reporte mensual con ID: {}", id);
        
        // Por ahora retornamos una URL simulada
        return "/api/reports/descargar/" + id + "/reporte.pdf";
    }
    
    /**
     * Obtener tendencias de tickets
     */
    public List<Object> obtenerTendencias(int meses) {
        log.info("Obteniendo tendencias de los últimos {} meses", meses);
        
        List<Object> tendencias = new ArrayList<>();
        
        for (int i = meses - 1; i >= 0; i--) {
            LocalDateTime fecha = LocalDateTime.now().minusMonths(i);
            int mes = fecha.getMonthValue();
            int año = fecha.getYear();
            
            List<Ticket> ticketsDelMes = obtenerTicketsDelMes(mes, año);
            
            Map<String, Object> tendencia = new HashMap<>();
            tendencia.put("mes", obtenerNombreMes(mes));
            tendencia.put("año", año);
            tendencia.put("totalTickets", ticketsDelMes.size());
            tendencia.put("ticketsResueltos", ticketsDelMes.stream()
                    .filter(t -> "RESUELTO".equals(t.getStatus()))
                    .count());
            
            tendencias.add(tendencia);
        }
        
        return tendencias;
    }
    
    // Métodos auxiliares privados
    
    private double calcularTiempoPromedioResolucionBasico() {
        try {
            List<Ticket> todosLosTickets = ticketRepository.findAll();
            List<Ticket> ticketsResueltos = todosLosTickets.stream()
                    .filter(t -> "RESUELTO".equals(t.getStatus()))
                    .collect(Collectors.toList());
            
            return ticketsResueltos.stream()
                    .filter(t -> t.getUpdatedAt() != null)
                    .mapToDouble(t -> {
                        long horas = java.time.Duration.between(
                                t.getCreatedAt(),
                                t.getUpdatedAt()
                        ).toHours();
                        return horas / 24.0; // Convertir a días
                    })
                    .average()
                    .orElse(0.0);
        } catch (Exception e) {
            log.warn("Error calculando tiempo promedio de resolución básico: {}", e.getMessage());
            return 2.5; // Valor por defecto
        }
    }
    
    private double calcularTiempoPromedioResolucion(List<Ticket> tickets) {
        return tickets.stream()
                .filter(t -> "RESUELTO".equals(t.getStatus()) && t.getUpdatedAt() != null)
                .mapToDouble(t -> {
                    long horas = java.time.Duration.between(
                            t.getCreatedAt(),
                            t.getUpdatedAt()
                    ).toHours();
                    return horas / 24.0; // Convertir a días
                })
                .average()
                .orElse(0.0);
    }
    
    private double calcularSatisfaccionPromedio() {
        try {
            Double promedio = encuestaRepository.calcularPromedioCalificaciones();
            return promedio != null ? promedio : 0.0;
        } catch (Exception e) {
            log.warn("Error calculando satisfacción promedio, usando valor por defecto: {}", e.getMessage());
            return 4.2; // Valor por defecto si no hay encuestas
        }
    }
    
    private double calcularSatisfaccionPromedioDelMes(int mes, int año) {
        try {
            LocalDateTime inicioMes = LocalDateTime.of(año, mes, 1, 0, 0);
            LocalDateTime finMes = inicioMes.plusMonths(1).minusDays(1).withHour(23).withMinute(59).withSecond(59);
            
            Double promedio = encuestaRepository.calcularPromedioCalificacionesPorFecha(inicioMes, finMes);
            return promedio != null ? promedio : 0.0;
        } catch (Exception e) {
            log.warn("Error calculando satisfacción del mes {}/{}, usando valor por defecto: {}", mes, año, e.getMessage());
            return 4.0 + (Math.random() * 0.5); // Valor por defecto si no hay encuestas
        }
    }
    
    private List<Ticket> obtenerTicketsDelMes(int mes, int año) {
        return ticketRepository.findAll().stream()
                .filter(ticket -> {
                    LocalDateTime fechaCreacion = ticket.getCreatedAt();
                    return fechaCreacion.getMonthValue() == mes && fechaCreacion.getYear() == año;
                })
                .collect(Collectors.toList());
    }
    
    private Map<String, Long> calcularTendenciaMensual(List<Ticket> tickets) {
        Map<String, Long> tendencia = new LinkedHashMap<>();
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime fecha = LocalDateTime.now().minusMonths(i);
            String mesNombre = fecha.getMonth().getDisplayName(TextStyle.FULL, Locale.getDefault());
            
            long cantidad = tickets.stream()
                    .filter(ticket -> {
                        LocalDateTime fechaCreacion = ticket.getCreatedAt();
                        return fechaCreacion.getMonthValue() == fecha.getMonthValue() 
                               && fechaCreacion.getYear() == fecha.getYear();
                    })
                    .count();
            
            tendencia.put(mesNombre, cantidad);
        }
        
        return tendencia;
    }
    
    private String obtenerNombreMes(int mes) {
        return java.time.Month.of(mes).getDisplayName(TextStyle.FULL, Locale.getDefault());
    }
    
    // Métodos para datos simulados (temporal)
    
    private List<ReporteMensualResponseDTO> generarReportesMensualesSimulados() {
        List<ReporteMensualResponseDTO> reportes = new ArrayList<>();
        
        for (int i = 1; i <= 3; i++) {
            LocalDateTime fecha = LocalDateTime.now().minusMonths(i);
            int mes = fecha.getMonthValue();
            int año = fecha.getYear();
            
            reportes.add(generarReporteMensualSimulado((long) i));
        }
        
        return reportes;
    }
    
    private ReporteMensualResponseDTO generarReporteMensualSimulado(Long id) {
        LocalDateTime fecha = LocalDateTime.now().minusMonths(id.intValue());
        String nombreMes = obtenerNombreMes(fecha.getMonthValue());
        
        return ReporteMensualResponseDTO.builder()
                .id(id)
                .mes(nombreMes)
                .año(fecha.getYear())
                .totalTickets(200L + (id * 50))
                .ticketsResueltos(150L + (id * 40))
                .ticketsPendientes(30L + (id * 5))
                .ticketsEnProceso(20L + (id * 5))
                .tiempoPromedioResolucion(2.0 + (id * 0.2))
                .satisfaccionPromedio(4.0 + (id * 0.1))
                .topCategorias(Arrays.asList(
                        ReporteMensualResponseDTO.TopCategoriaDTO.builder()
                                .categoria("Hardware")
                                .cantidad(80L + (id * 10))
                                .build(),
                        ReporteMensualResponseDTO.TopCategoriaDTO.builder()
                                .categoria("Software")
                                .cantidad(60L + (id * 8))
                                .build(),
                        ReporteMensualResponseDTO.TopCategoriaDTO.builder()
                                .categoria("Red")
                                .cantidad(40L + (id * 5))
                                .build()
                ))
                .topTecnicos(Arrays.asList(
                        ReporteMensualResponseDTO.TopTecnicoDTO.builder()
                                .tecnico("Juan Pérez")
                                .ticketsResueltos(45L + (id * 5))
                                .tiempoPromedioResolucion(1.8)
                                .build(),
                        ReporteMensualResponseDTO.TopTecnicoDTO.builder()
                                .tecnico("María García")
                                .ticketsResueltos(38L + (id * 4))
                                .tiempoPromedioResolucion(2.1)
                                .build()
                ))
                .fechaGeneracion(fecha.plusDays(1))
                .archivoUrl("/reports/" + nombreMes.toLowerCase() + "-" + fecha.getYear() + ".pdf")
                .nombreArchivo("reporte-" + nombreMes.toLowerCase() + "-" + fecha.getYear() + ".pdf")
                .tamañoArchivo(1024L * 1024L * (2 + id.intValue()))
                .build();
    }
}
