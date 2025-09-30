package com.example.demo.sla.service;

import com.example.demo.sla.dto.SLAConfigurationDTO;
import com.example.demo.sla.model.SLAConfiguration;
import com.example.demo.sla.repository.SLAConfigurationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SLAConfigurationService {
    
    private static final Logger log = LoggerFactory.getLogger(SLAConfigurationService.class);
    
    @Autowired
    private SLAConfigurationRepository slaConfigurationRepository;
    
    /**
     * Obtener todas las configuraciones SLA
     */
    @Transactional(readOnly = true)
    public List<SLAConfigurationDTO> obtenerTodasLasConfiguraciones() {
        log.info("Obteniendo todas las configuraciones SLA");
        List<SLAConfiguration> configuraciones = slaConfigurationRepository.findAll();
        return configuraciones.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener configuración SLA por ID
     */
    @Transactional(readOnly = true)
    public Optional<SLAConfigurationDTO> obtenerConfiguracionPorId(Long id) {
        log.info("Obteniendo configuración SLA con ID: {}", id);
        return slaConfigurationRepository.findById(id)
                .map(this::convertirADTO);
    }
    
    /**
     * Crear nueva configuración SLA
     */
    public SLAConfigurationDTO crearConfiguracion(SLAConfigurationDTO dto) {
        log.info("Creando nueva configuración SLA: {}", dto.getNombre());
        
        SLAConfiguration configuracion = new SLAConfiguration();
        configuracion.setNombre(dto.getNombre());
        configuracion.setDescripcion(dto.getDescripcion());
        configuracion.setCategoriaId(dto.getCategoriaId());
        configuracion.setCategoriaNombre(dto.getCategoriaNombre());
        configuracion.setPrioridad(dto.getPrioridad());
        configuracion.setTiempoRespuestaHoras(dto.getTiempoRespuestaHoras());
        configuracion.setTiempoResolucionHoras(dto.getTiempoResolucionHoras());
        configuracion.setTiempoAlertaHoras(dto.getTiempoAlertaHoras());
        configuracion.setActivo(dto.getActivo() != null ? dto.getActivo() : true);
        
        SLAConfiguration configuracionGuardada = slaConfigurationRepository.save(configuracion);
        log.info("Configuración SLA creada exitosamente con ID: {}", configuracionGuardada.getId());
        
        return convertirADTO(configuracionGuardada);
    }
    
    /**
     * Actualizar configuración SLA
     */
    public SLAConfigurationDTO actualizarConfiguracion(Long id, SLAConfigurationDTO dto) {
        log.info("Actualizando configuración SLA con ID: {}", id);
        
        SLAConfiguration configuracion = slaConfigurationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuración SLA no encontrada con ID: " + id));
        
        configuracion.setNombre(dto.getNombre());
        configuracion.setDescripcion(dto.getDescripcion());
        configuracion.setCategoriaId(dto.getCategoriaId());
        configuracion.setCategoriaNombre(dto.getCategoriaNombre());
        configuracion.setPrioridad(dto.getPrioridad());
        configuracion.setTiempoRespuestaHoras(dto.getTiempoRespuestaHoras());
        configuracion.setTiempoResolucionHoras(dto.getTiempoResolucionHoras());
        configuracion.setTiempoAlertaHoras(dto.getTiempoAlertaHoras());
        configuracion.setActivo(dto.getActivo());
        
        SLAConfiguration configuracionActualizada = slaConfigurationRepository.save(configuracion);
        log.info("Configuración SLA actualizada exitosamente con ID: {}", id);
        
        return convertirADTO(configuracionActualizada);
    }
    
    /**
     * Eliminar configuración SLA
     */
    public void eliminarConfiguracion(Long id) {
        log.info("Eliminando configuración SLA con ID: {}", id);
        
        if (!slaConfigurationRepository.existsById(id)) {
            throw new RuntimeException("Configuración SLA no encontrada con ID: " + id);
        }
        
        slaConfigurationRepository.deleteById(id);
        log.info("Configuración SLA eliminada exitosamente con ID: {}", id);
    }
    
    /**
     * Obtener configuraciones SLA activas
     */
    @Transactional(readOnly = true)
    public List<SLAConfigurationDTO> obtenerConfiguracionesActivas() {
        log.info("Obteniendo configuraciones SLA activas");
        List<SLAConfiguration> configuraciones = slaConfigurationRepository.findByActivoTrue();
        return configuraciones.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener configuraciones SLA por prioridad
     */
    @Transactional(readOnly = true)
    public List<SLAConfigurationDTO> obtenerConfiguracionesPorPrioridad(String prioridad) {
        log.info("Obteniendo configuraciones SLA por prioridad: {}", prioridad);
        List<SLAConfiguration> configuraciones = slaConfigurationRepository.findByPrioridad(prioridad);
        return configuraciones.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener configuraciones SLA por categoría
     */
    @Transactional(readOnly = true)
    public List<SLAConfigurationDTO> obtenerConfiguracionesPorCategoria(Long categoriaId) {
        log.info("Obteniendo configuraciones SLA por categoría ID: {}", categoriaId);
        List<SLAConfiguration> configuraciones = slaConfigurationRepository.findByCategoriaId(categoriaId);
        return configuraciones.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Buscar configuraciones SLA por nombre
     */
    @Transactional(readOnly = true)
    public List<SLAConfigurationDTO> buscarConfiguracionesPorNombre(String nombre) {
        log.info("Buscando configuraciones SLA por nombre: {}", nombre);
        List<SLAConfiguration> configuraciones = slaConfigurationRepository.findByNombreContainingIgnoreCase(nombre);
        return configuraciones.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener configuración SLA específica por categoría y prioridad
     */
    @Transactional(readOnly = true)
    public Optional<SLAConfigurationDTO> obtenerConfiguracionPorCategoriaYPrioridad(Long categoriaId, String prioridad) {
        log.info("Obteniendo configuración SLA por categoría ID: {} y prioridad: {}", categoriaId, prioridad);
        return slaConfigurationRepository.findByCategoriaIdAndPrioridadAndActivoTrue(categoriaId, prioridad)
                .map(this::convertirADTO);
    }
    
    /**
     * Obtener estadísticas de configuraciones SLA
     */
    @Transactional(readOnly = true)
    public SLAStatsDTO obtenerEstadisticas() {
        log.info("Obteniendo estadísticas de configuraciones SLA");
        
        long total = slaConfigurationRepository.count();
        long activas = slaConfigurationRepository.countByActivoTrue();
        long inactivas = slaConfigurationRepository.countByActivoFalse();
        
        return new SLAStatsDTO(total, activas, inactivas);
    }
    
    /**
     * Convertir entidad a DTO
     */
    private SLAConfigurationDTO convertirADTO(SLAConfiguration configuracion) {
        SLAConfigurationDTO dto = new SLAConfigurationDTO();
        dto.setId(configuracion.getId());
        dto.setNombre(configuracion.getNombre());
        dto.setDescripcion(configuracion.getDescripcion());
        dto.setCategoriaId(configuracion.getCategoriaId());
        dto.setCategoriaNombre(configuracion.getCategoriaNombre());
        dto.setPrioridad(configuracion.getPrioridad());
        dto.setTiempoRespuestaHoras(configuracion.getTiempoRespuestaHoras());
        dto.setTiempoResolucionHoras(configuracion.getTiempoResolucionHoras());
        dto.setTiempoAlertaHoras(configuracion.getTiempoAlertaHoras());
        dto.setActivo(configuracion.getActivo());
        dto.setFechaCreacion(configuracion.getFechaCreacion());
        dto.setFechaActualizacion(configuracion.getFechaActualizacion());
        return dto;
    }
    
    /**
     * DTO para estadísticas
     */
    public static class SLAStatsDTO {
        private long total;
        private long activas;
        private long inactivas;
        
        public SLAStatsDTO() {}
        
        public SLAStatsDTO(long total, long activas, long inactivas) {
            this.total = total;
            this.activas = activas;
            this.inactivas = inactivas;
        }
        
        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
        
        public long getActivas() { return activas; }
        public void setActivas(long activas) { this.activas = activas; }
        
        public long getInactivas() { return inactivas; }
        public void setInactivas(long inactivas) { this.inactivas = inactivas; }
    }
}
