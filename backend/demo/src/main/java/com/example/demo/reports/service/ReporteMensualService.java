package com.example.demo.reports.service;

import com.example.demo.reports.dto.response.ReporteMensualResponseDTO;
import com.example.demo.reports.model.ReporteMensual;
import com.example.demo.reports.repository.ReporteMensualRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReporteMensualService {

    private final ReporteMensualRepository reporteMensualRepository;
    private final String UPLOAD_DIR = "uploads/reportes";

    /**
     * Guardar reporte generado en el sistema
     */
    public void guardarReporteGenerado(String tipoReporte, int mes, int año, byte[] contenidoPDF, String nombreArchivo) {
        log.info("🔍 [REPORTE-MENSUAL] Guardando reporte generado: {}", nombreArchivo);
        
        try {
            // Crear directorio si no existe
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("🔍 [REPORTE-MENSUAL] Directorio creado: {}", uploadPath);
            }
            
            // Guardar archivo PDF
            Path filePath = uploadPath.resolve(nombreArchivo);
            Files.write(filePath, contenidoPDF);
            log.info("🔍 [REPORTE-MENSUAL] Archivo guardado en: {}", filePath);
            
            // Crear registro en la base de datos
            ReporteMensual reporte = ReporteMensual.builder()
                    .tipoReporte(tipoReporte)
                    .mes(mes)
                    .año(año)
                    .nombreArchivo(nombreArchivo)
                    .rutaArchivo(filePath.toString())
                    .tamañoArchivo((long) contenidoPDF.length)
                    .fechaGeneracion(LocalDateTime.now())
                    .activo(true)
                    .build();
            
            reporteMensualRepository.save(reporte);
            log.info("🔍 [REPORTE-MENSUAL] Registro guardado en BD con ID: {}", reporte.getId());
            
        } catch (IOException e) {
            log.error("🔍 [REPORTE-MENSUAL] Error guardando archivo: {}", e.getMessage(), e);
            throw new RuntimeException("Error guardando archivo de reporte", e);
        }
    }

    /**
     * Obtener reportes mensuales
     */
    public List<ReporteMensualResponseDTO> obtenerReportesMensuales(int page, int size) {
        log.info("🔍 [REPORTE-MENSUAL] Obteniendo reportes mensuales - página: {}, tamaño: {}", page, size);
        
        List<ReporteMensual> reportes = reporteMensualRepository.findByActivoTrueOrderByFechaGeneracionDesc();
        
        // Aplicar paginación manual (en producción usar Pageable)
        int start = page * size;
        int end = Math.min(start + size, reportes.size());
        
        List<ReporteMensual> reportesPaginados = reportes.subList(start, end);
        
        return reportesPaginados.stream()
                .map(this::convertirAResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener reporte mensual por ID
     */
    public ReporteMensualResponseDTO obtenerReporteMensual(Long id) {
        log.info("🔍 [REPORTE-MENSUAL] Obteniendo reporte mensual ID: {}", id);
        
        return reporteMensualRepository.findById(id)
                .map(this::convertirAResponseDTO)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));
    }

    /**
     * Descargar reporte mensual
     */
    public byte[] descargarReporteMensual(Long id) {
        log.info("🔍 [REPORTE-MENSUAL] Descargando reporte mensual ID: {}", id);
        
        ReporteMensual reporte = reporteMensualRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));
        
        try {
            Path filePath = Paths.get(reporte.getRutaArchivo());
            if (!Files.exists(filePath)) {
                throw new RuntimeException("Archivo no encontrado: " + filePath);
            }
            
            byte[] contenido = Files.readAllBytes(filePath);
            log.info("🔍 [REPORTE-MENSUAL] Archivo descargado exitosamente: {} bytes", contenido.length);
            return contenido;
            
        } catch (IOException e) {
            log.error("🔍 [REPORTE-MENSUAL] Error descargando archivo: {}", e.getMessage(), e);
            throw new RuntimeException("Error descargando archivo", e);
        }
    }

    /**
     * Eliminar reporte mensual
     */
    public void eliminarReporteMensual(Long id) {
        log.info("🔍 [REPORTE-MENSUAL] Eliminando reporte mensual ID: {}", id);
        
        ReporteMensual reporte = reporteMensualRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));
        
        try {
            // Eliminar archivo físico
            Path filePath = Paths.get(reporte.getRutaArchivo());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("🔍 [REPORTE-MENSUAL] Archivo eliminado: {}", filePath);
            }
            
            // Marcar como inactivo en BD
            reporte.setActivo(false);
            reporteMensualRepository.save(reporte);
            log.info("🔍 [REPORTE-MENSUAL] Reporte marcado como inactivo");
            
        } catch (IOException e) {
            log.error("🔍 [REPORTE-MENSUAL] Error eliminando archivo: {}", e.getMessage(), e);
            throw new RuntimeException("Error eliminando archivo", e);
        }
    }

    /**
     * Convertir entidad a DTO de respuesta
     */
    private ReporteMensualResponseDTO convertirAResponseDTO(ReporteMensual reporte) {
        return ReporteMensualResponseDTO.builder()
                .id(reporte.getId())
                .mes(reporte.getMes().toString())
                .año(reporte.getAño())
                .totalTickets(0L) // Valor por defecto, se puede calcular si es necesario
                .ticketsResueltos(0L) // Valor por defecto
                .ticketsPendientes(0L) // Valor por defecto
                .ticketsEnProceso(0L) // Valor por defecto
                .tiempoPromedioResolucion(0.0) // Valor por defecto
                .satisfaccionPromedio(0.0) // Valor por defecto
                .topCategorias(List.of()) // Lista vacía en lugar de null
                .topTecnicos(List.of()) // Lista vacía en lugar de null
                .nombreArchivo(reporte.getNombreArchivo())
                .tamañoArchivo(reporte.getTamañoArchivo())
                .fechaGeneracion(reporte.getFechaGeneracion())
                .archivoUrl("/api/reports/mensuales/" + reporte.getId() + "/descargar")
                .build();
    }

    /**
     * Formatear tamaño de archivo
     */
    private String formatearTamaño(Long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }
}
