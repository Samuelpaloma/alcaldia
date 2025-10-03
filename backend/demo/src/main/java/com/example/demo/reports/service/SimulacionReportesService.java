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
public class SimulacionReportesService {

    private final ConfiguracionReporteAutomaticoRepository configuracionRepository;
    private final ReporteAutomaticoService reporteAutomaticoService;
    private final ReporteMensualService reporteMensualService;

    /**
     * Simulación que se ejecuta cada 2 minutos para generar reportes
     * Solo se activa cuando está habilitada la simulación
     */
    @Scheduled(fixedRate = 120000) // Cada 2 minutos
    public void simularGeneracionReportes() {
        // Verificar si la simulación está habilitada
        if (!isSimulacionHabilitada()) {
            return;
        }

        log.info("🎭 [SIMULACION] Iniciando simulación de generación de reportes");
        
        try {
            // Obtener configuraciones activas
            List<ConfiguracionReporteAutomatico> configuraciones = 
                configuracionRepository.findByActivoTrue();
            
            if (configuraciones.isEmpty()) {
                log.info("🎭 [SIMULACION] No hay configuraciones activas, creando configuraciones de prueba");
                crearConfiguracionesDePrueba();
                return;
            }
            
            // Generar reportes para cada configuración
            for (ConfiguracionReporteAutomatico config : configuraciones) {
                generarReporteSimulado(config);
            }
            
        } catch (Exception e) {
            log.error("🎭 [SIMULACION] Error en simulación de reportes: {}", e.getMessage(), e);
        }
    }

    /**
     * Crear configuraciones de prueba para la simulación
     */
    private void crearConfiguracionesDePrueba() {
        log.info("🎭 [SIMULACION] Creando configuraciones de prueba");
        
        // Crear configuración para reporte mensual
        reporteAutomaticoService.configurarReporteAutomatico(
            "MENSUAL", 1, "09:00", "admin@alcaldia.com", "Simulación - Reporte mensual"
        );
        
        // Crear configuración para reporte de satisfacción
        reporteAutomaticoService.configurarReporteAutomatico(
            "SATISFACCION", 5, "10:00", "admin@alcaldia.com", "Simulación - Reporte de satisfacción"
        );
        
        // Crear configuración para reporte de rendimiento
        reporteAutomaticoService.configurarReporteAutomatico(
            "RENDIMIENTO", 10, "11:00", "admin@alcaldia.com", "Simulación - Reporte de rendimiento"
        );
        
        // Crear configuración para reporte por categoría
        reporteAutomaticoService.configurarReporteAutomatico(
            "CATEGORIA", 15, "12:00", "admin@alcaldia.com", "Simulación - Reporte por categoría"
        );
        
        log.info("🎭 [SIMULACION] Configuraciones de prueba creadas exitosamente");
    }

    /**
     * Generar reporte simulado
     */
    private void generarReporteSimulado(ConfiguracionReporteAutomatico config) {
        try {
            LocalDateTime ahora = LocalDateTime.now();
            int mes = ahora.getMonthValue();
            int año = ahora.getYear();
            
            log.info("🎭 [SIMULACION] Generando reporte simulado tipo: {} para {}/{}", 
                    config.getTipoReporte(), mes, año);
            
            // Generar el reporte manualmente
            reporteAutomaticoService.generarReporteManual(
                config.getTipoReporte(), mes, año);
            
            // Actualizar la configuración para simular que ya se ejecutó
            config.setUltimaGeneracion(ahora);
            config.calcularProximaGeneracion();
            configuracionRepository.save(config);
            
            log.info("🎭 [SIMULACION] Reporte {} generado exitosamente", config.getTipoReporte());
            
        } catch (Exception e) {
            log.error("🎭 [SIMULACION] Error generando reporte simulado: {}", e.getMessage(), e);
        }
    }

    /**
     * Verificar si la simulación está habilitada
     * Se puede controlar con una variable de entorno o propiedad
     */
    private boolean isSimulacionHabilitada() {
        // Por defecto habilitada para desarrollo
        // En producción se puede controlar con una variable de entorno
        String simulacionEnabled = System.getProperty("simulacion.reportes", "true");
        return "true".equalsIgnoreCase(simulacionEnabled);
    }

    /**
     * Habilitar/deshabilitar simulación
     */
    public void habilitarSimulacion(boolean habilitada) {
        System.setProperty("simulacion.reportes", String.valueOf(habilitada));
        log.info("🎭 [SIMULACION] Simulación {} {}", 
                habilitada ? "habilitada" : "deshabilitada");
    }

    /**
     * Generar reportes de prueba inmediatamente
     */
    public void generarReportesDePrueba() {
        log.info("🎭 [SIMULACION] Generando reportes de prueba inmediatamente");
        
        LocalDateTime ahora = LocalDateTime.now();
        int mes = ahora.getMonthValue();
        int año = ahora.getYear();
        
        try {
            // Generar todos los tipos de reportes
            reporteAutomaticoService.generarReporteManual("MENSUAL", mes, año);
            reporteAutomaticoService.generarReporteManual("SATISFACCION", mes, año);
            reporteAutomaticoService.generarReporteManual("RENDIMIENTO", mes, año);
            reporteAutomaticoService.generarReporteManual("CATEGORIA", mes, año);
            
            log.info("🎭 [SIMULACION] Todos los reportes de prueba generados exitosamente");
            
        } catch (Exception e) {
            log.error("🎭 [SIMULACION] Error generando reportes de prueba: {}", e.getMessage(), e);
        }
    }
}
