package com.example.demo.reports.service;

import com.example.demo.reports.model.ConfiguracionReporteAutomatico;
import com.example.demo.reports.repository.ConfiguracionReporteAutomaticoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReporteAutomaticoService {

    private final ConfiguracionReporteAutomaticoRepository configuracionRepository;
    private final ReportePDFService reportePDFService;
    private final ReporteMensualService reporteMensualService;

    /**
     * Tarea programada que se ejecuta cada minuto para verificar si hay reportes que generar
     */
    @Scheduled(fixedRate = 60000) // Cada minuto
    public void verificarYGenerarReportes() {
        log.info("🔍 [REPORTE-AUTOMATICO] Verificando reportes pendientes de generación");
        
        try {
            LocalDateTime ahora = LocalDateTime.now();
            List<ConfiguracionReporteAutomatico> configuraciones = 
                configuracionRepository.findConfiguracionesParaEjecutar(ahora);
            
            if (configuraciones.isEmpty()) {
                log.debug("🔍 [REPORTE-AUTOMATICO] No hay reportes pendientes de generación");
                return;
            }
            
            log.info("🔍 [REPORTE-AUTOMATICO] Encontradas {} configuraciones para ejecutar", configuraciones.size());
            
            for (ConfiguracionReporteAutomatico config : configuraciones) {
                generarReporteAutomatico(config);
            }
            
        } catch (Exception e) {
            log.error("🔍 [REPORTE-AUTOMATICO] Error en verificación de reportes automáticos: {}", e.getMessage(), e);
        }
    }

    /**
     * Generar reporte automático según la configuración
     */
    private void generarReporteAutomatico(ConfiguracionReporteAutomatico config) {
        log.info("🔍 [REPORTE-AUTOMATICO] Generando reporte automático tipo: {}", config.getTipoReporte());
        
        try {
            LocalDateTime ahora = LocalDateTime.now();
            int mes = ahora.getMonthValue();
            int año = ahora.getYear();
            
            byte[] contenidoPDF = null;
            String nombreArchivo = "";
            
            // Generar el tipo de reporte correspondiente
            switch (config.getTipoReporte()) {
                case "MENSUAL":
                    contenidoPDF = reportePDFService.generarReporteMensual(mes, año);
                    nombreArchivo = String.format("reporte_mensual_%02d_%d.pdf", mes, año);
                    break;
                case "SATISFACCION":
                    contenidoPDF = reportePDFService.generarReporteSatisfaccion(mes, año);
                    nombreArchivo = String.format("reporte_satisfaccion_%02d_%d.pdf", mes, año);
                    break;
                case "RENDIMIENTO":
                    contenidoPDF = reportePDFService.generarReporteRendimiento(mes, año);
                    nombreArchivo = String.format("reporte_rendimiento_%02d_%d.pdf", mes, año);
                    break;
                case "CATEGORIA":
                    contenidoPDF = reportePDFService.generarReporteCategoria(mes, año);
                    nombreArchivo = String.format("reporte_categoria_%02d_%d.pdf", mes, año);
                    break;
                default:
                    log.warn("🔍 [REPORTE-AUTOMATICO] Tipo de reporte no reconocido: {}", config.getTipoReporte());
                    return;
            }
            
            // Guardar el reporte en el sistema
            if (contenidoPDF != null) {
                reporteMensualService.guardarReporteGenerado(config.getTipoReporte(), mes, año, contenidoPDF, nombreArchivo);
                log.info("🔍 [REPORTE-AUTOMATICO] Reporte {} guardado exitosamente", nombreArchivo);
            }
            
            // Actualizar la configuración con la última generación
            config.setUltimaGeneracion(ahora);
            config.calcularProximaGeneracion();
            configuracionRepository.save(config);
            
            log.info("🔍 [REPORTE-AUTOMATICO] Próxima generación programada para: {}", config.getProximaGeneracion());
            
        } catch (Exception e) {
            log.error("🔍 [REPORTE-AUTOMATICO] Error generando reporte automático: {}", e.getMessage(), e);
        }
    }

    /**
     * Configurar reporte automático
     */
    public ConfiguracionReporteAutomatico configurarReporteAutomatico(
            String tipoReporte, Integer diaGeneracion, String horaGeneracion, 
            String emailDestinatarios, String observaciones) {
        
        log.info("🔍 [REPORTE-AUTOMATICO] Configurando reporte automático tipo: {}", tipoReporte);
        
        // Verificar si ya existe configuración para este tipo
        List<ConfiguracionReporteAutomatico> existentes = 
            configuracionRepository.findByTipoReporteAndActivoTrue(tipoReporte);
        
        if (!existentes.isEmpty()) {
            log.warn("🔍 [REPORTE-AUTOMATICO] Ya existe configuración activa para tipo: {}", tipoReporte);
            // Desactivar configuraciones existentes
            existentes.forEach(config -> {
                config.setActivo(false);
                configuracionRepository.save(config);
            });
        }
        
        // Crear nueva configuración
        ConfiguracionReporteAutomatico config = ConfiguracionReporteAutomatico.builder()
                .tipoReporte(tipoReporte)
                .diaGeneracion(diaGeneracion)
                .horaGeneracion(horaGeneracion)
                .emailDestinatarios(emailDestinatarios)
                .observaciones(observaciones)
                .activo(true)
                .build();
        
        // Calcular próxima generación
        config.calcularProximaGeneracion();
        
        ConfiguracionReporteAutomatico configGuardada = configuracionRepository.save(config);
        log.info("🔍 [REPORTE-AUTOMATICO] Configuración guardada con ID: {}", configGuardada.getId());
        log.info("🔍 [REPORTE-AUTOMATICO] Próxima generación: {}", configGuardada.getProximaGeneracion());
        
        return configGuardada;
    }

    /**
     * Obtener configuraciones activas
     */
    public List<ConfiguracionReporteAutomatico> obtenerConfiguracionesActivas() {
        return configuracionRepository.findByActivoTrue();
    }

    /**
     * Desactivar configuración
     */
    public void desactivarConfiguracion(Long id) {
        log.info("🔍 [REPORTE-AUTOMATICO] Desactivando configuración ID: {}", id);
        
        configuracionRepository.findById(id).ifPresent(config -> {
            config.setActivo(false);
            configuracionRepository.save(config);
            log.info("🔍 [REPORTE-AUTOMATICO] Configuración desactivada exitosamente");
        });
    }

    /**
     * Generar reporte manual (para testing)
     */
    public void generarReporteManual(String tipoReporte, int mes, int año) {
        log.info("🔍 [REPORTE-AUTOMATICO] Generando reporte manual tipo: {} para {}/{}", tipoReporte, mes, año);
        
        try {
            byte[] contenidoPDF = null;
            String nombreArchivo = "";
            
            switch (tipoReporte) {
                case "MENSUAL":
                    contenidoPDF = reportePDFService.generarReporteMensual(mes, año);
                    nombreArchivo = String.format("reporte_mensual_%02d_%d.pdf", mes, año);
                    break;
                case "SATISFACCION":
                    contenidoPDF = reportePDFService.generarReporteSatisfaccion(mes, año);
                    nombreArchivo = String.format("reporte_satisfaccion_%02d_%d.pdf", mes, año);
                    break;
                case "RENDIMIENTO":
                    contenidoPDF = reportePDFService.generarReporteRendimiento(mes, año);
                    nombreArchivo = String.format("reporte_rendimiento_%02d_%d.pdf", mes, año);
                    break;
                case "CATEGORIA":
                    contenidoPDF = reportePDFService.generarReporteCategoria(mes, año);
                    nombreArchivo = String.format("reporte_categoria_%02d_%d.pdf", mes, año);
                    break;
                default:
                    throw new IllegalArgumentException("Tipo de reporte no válido: " + tipoReporte);
            }
            
            if (contenidoPDF != null) {
                reporteMensualService.guardarReporteGenerado(tipoReporte, mes, año, contenidoPDF, nombreArchivo);
                log.info("🔍 [REPORTE-AUTOMATICO] Reporte manual {} generado exitosamente", nombreArchivo);
            }
            
        } catch (Exception e) {
            log.error("🔍 [REPORTE-AUTOMATICO] Error generando reporte manual: {}", e.getMessage(), e);
            throw new RuntimeException("Error generando reporte manual", e);
        }
    }
}
