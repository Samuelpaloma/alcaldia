package com.example.demo.automation.service;

import com.example.demo.automation.dto.request.ReglaAutomatizacionRequestDTO;
import com.example.demo.automation.dto.response.ReglaAutomatizacionResponseDTO;
import com.example.demo.automation.model.ReglaAutomatizacion;
import com.example.demo.automation.repository.ReglaAutomatizacionRepository;
import com.example.demo.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ReglaAutomatizacionServiceImpl implements ReglaAutomatizacionService {
    
    private final ReglaAutomatizacionRepository reglaAutomatizacionRepository;
    
    @Override
    public ReglaAutomatizacionResponseDTO crearRegla(ReglaAutomatizacionRequestDTO request) {
        log.info("Creando nueva regla de automatización: {}", request.getNombre());
        
        ReglaAutomatizacion regla = ReglaAutomatizacion.builder()
            .nombre(request.getNombre().trim())
            .descripcion(request.getDescripcion() != null ? request.getDescripcion().trim() : null)
            .condicion(request.getCondicion().trim())
            .accion(request.getAccion().trim())
            .prioridad(request.getPrioridad() != null ? request.getPrioridad() : 1)
            .activa(request.getActiva() != null ? request.getActiva() : true)
            .creadoPor("Sistema") // TODO: Obtener del contexto de seguridad
            .ejecuciones(0)
            .build();
        
        ReglaAutomatizacion savedRegla = reglaAutomatizacionRepository.save(regla);
        
        log.info("Regla de automatización creada exitosamente: {} (ID: {})", savedRegla.getNombre(), savedRegla.getId());
        
        return convertirAReglaResponseDTO(savedRegla);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ReglaAutomatizacionResponseDTO obtenerReglaPorId(Long id) {
        log.info("Obteniendo regla de automatización por ID: {}", id);
        
        ReglaAutomatizacion regla = reglaAutomatizacionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Regla de automatización no encontrada con ID: " + id));
        
        return convertirAReglaResponseDTO(regla);
    }
    
    @Override
    public ReglaAutomatizacionResponseDTO actualizarRegla(Long id, ReglaAutomatizacionRequestDTO request) {
        log.info("Actualizando regla de automatización ID: {} con nombre: {}", id, request.getNombre());
        
        ReglaAutomatizacion regla = reglaAutomatizacionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Regla de automatización no encontrada con ID: " + id));
        
        regla.setNombre(request.getNombre().trim());
        regla.setDescripcion(request.getDescripcion() != null ? request.getDescripcion().trim() : null);
        regla.setCondicion(request.getCondicion().trim());
        regla.setAccion(request.getAccion().trim());
        regla.setPrioridad(request.getPrioridad() != null ? request.getPrioridad() : regla.getPrioridad());
        regla.setActiva(request.getActiva() != null ? request.getActiva() : regla.getActiva());
        
        ReglaAutomatizacion updatedRegla = reglaAutomatizacionRepository.save(regla);
        
        log.info("Regla de automatización actualizada exitosamente: {} (ID: {})", updatedRegla.getNombre(), updatedRegla.getId());
        
        return convertirAReglaResponseDTO(updatedRegla);
    }
    
    @Override
    public void eliminarRegla(Long id) {
        log.info("Eliminando regla de automatización ID: {}", id);
        
        ReglaAutomatizacion regla = reglaAutomatizacionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Regla de automatización no encontrada con ID: " + id));
        
        reglaAutomatizacionRepository.delete(regla);
        
        log.info("Regla de automatización eliminada exitosamente: {} (ID: {})", regla.getNombre(), regla.getId());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReglaAutomatizacionResponseDTO> obtenerTodasLasReglas() {
        log.info("Obteniendo todas las reglas de automatización");
        
        List<ReglaAutomatizacion> reglas = reglaAutomatizacionRepository.findAll();
        
        return reglas.stream()
            .map(this::convertirAReglaResponseDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReglaAutomatizacionResponseDTO> obtenerReglasConPaginacion(Pageable pageable) {
        log.info("Obteniendo reglas de automatización con paginación: {}", pageable);
        
        Page<ReglaAutomatizacion> reglasPage = reglaAutomatizacionRepository.findAll(pageable);
        
        List<ReglaAutomatizacionResponseDTO> reglasDTO = reglasPage.getContent().stream()
            .map(this::convertirAReglaResponseDTO)
            .collect(Collectors.toList());
        
        return PageResponse.<ReglaAutomatizacionResponseDTO>builder()
            .content(reglasDTO)
            .page(reglasPage.getNumber())
            .size(reglasPage.getSize())
            .totalElements(reglasPage.getTotalElements())
            .totalPages(reglasPage.getTotalPages())
            .first(reglasPage.isFirst())
            .last(reglasPage.isLast())
            .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReglaAutomatizacionResponseDTO> obtenerReglasActivas() {
        log.info("Obteniendo reglas de automatización activas");
        
        List<ReglaAutomatizacion> reglas = reglaAutomatizacionRepository.findByActivaTrueOrderByPrioridadDescFechaCreacionAsc();
        
        return reglas.stream()
            .map(this::convertirAReglaResponseDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReglaAutomatizacionResponseDTO> buscarReglas(String nombre, Boolean activa, Integer prioridad, Pageable pageable) {
        log.info("Buscando reglas de automatización con filtros: nombre={}, activa={}, prioridad={}", nombre, activa, prioridad);
        
        Page<ReglaAutomatizacion> reglasPage = reglaAutomatizacionRepository.findWithFilters(activa, nombre, prioridad, pageable);
        
        List<ReglaAutomatizacionResponseDTO> reglasDTO = reglasPage.getContent().stream()
            .map(this::convertirAReglaResponseDTO)
            .collect(Collectors.toList());
        
        return PageResponse.<ReglaAutomatizacionResponseDTO>builder()
            .content(reglasDTO)
            .page(reglasPage.getNumber())
            .size(reglasPage.getSize())
            .totalElements(reglasPage.getTotalElements())
            .totalPages(reglasPage.getTotalPages())
            .first(reglasPage.isFirst())
            .last(reglasPage.isLast())
            .build();
    }
    
    @Override
    public ReglaAutomatizacionResponseDTO toggleEstadoRegla(Long id) {
        log.info("Cambiando estado de regla de automatización ID: {}", id);
        
        ReglaAutomatizacion regla = reglaAutomatizacionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Regla de automatización no encontrada con ID: " + id));
        
        regla.setActiva(!regla.getActiva());
        ReglaAutomatizacion updatedRegla = reglaAutomatizacionRepository.save(regla);
        
        log.info("Estado de regla {} cambiado a: {}", updatedRegla.getNombre(), updatedRegla.getActiva() ? "ACTIVA" : "INACTIVA");
        
        return convertirAReglaResponseDTO(updatedRegla);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long contarReglasActivas() {
        return reglaAutomatizacionRepository.countByActivaTrue();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long contarEjecucionesTotales() {
        return reglaAutomatizacionRepository.sumEjecucionesActivas();
    }
    
    @Override
    public void ejecutarReglas() {
        log.info("Ejecutando todas las reglas de automatización activas");
        
        List<ReglaAutomatizacion> reglasActivas = reglaAutomatizacionRepository.findByActivaTrueOrderByPrioridadDescFechaCreacionAsc();
        
        for (ReglaAutomatizacion regla : reglasActivas) {
            try {
                ejecutarRegla(regla.getId());
            } catch (Exception e) {
                log.error("Error ejecutando regla {}: {}", regla.getNombre(), e.getMessage());
            }
        }
    }
    
    @Override
    public void ejecutarRegla(Long id) {
        log.info("Ejecutando regla de automatización ID: {}", id);
        
        ReglaAutomatizacion regla = reglaAutomatizacionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Regla de automatización no encontrada con ID: " + id));
        
        if (!regla.getActiva()) {
            log.warn("Regla {} está inactiva, no se ejecutará", regla.getNombre());
            return;
        }
        
        // TODO: Implementar lógica de ejecución de reglas
        // Por ahora solo incrementamos el contador de ejecuciones
        regla.incrementarEjecuciones();
        reglaAutomatizacionRepository.save(regla);
        
        log.info("Regla {} ejecutada exitosamente. Total ejecuciones: {}", regla.getNombre(), regla.getEjecuciones());
    }
    
    private ReglaAutomatizacionResponseDTO convertirAReglaResponseDTO(ReglaAutomatizacion regla) {
        return ReglaAutomatizacionResponseDTO.builder()
            .id(regla.getId())
            .nombre(regla.getNombre())
            .descripcion(regla.getDescripcion())
            .condicion(regla.getCondicion())
            .accion(regla.getAccion())
            .prioridad(regla.getPrioridad())
            .activa(regla.getActiva())
            .ejecuciones(regla.getEjecuciones())
            .ultimaEjecucion(regla.getUltimaEjecucion())
            .creadoPor(regla.getCreadoPor())
            .fechaCreacion(regla.getFechaCreacion())
            .build();
    }
}
