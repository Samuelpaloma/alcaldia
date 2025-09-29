package com.example.demo.automatizacion.service;

import com.example.demo.automatizacion.dto.AutomationRuleDTO;
import com.example.demo.automatizacion.dto.AutomationStatsDTO;
import com.example.demo.automatizacion.model.AutomationRule;
import com.example.demo.automatizacion.repository.AutomationRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AutomationRuleService {

    @Autowired
    private AutomationRuleRepository automationRuleRepository;

    /**
     * Obtiene todas las reglas de automatización
     */
    public List<AutomationRuleDTO> obtenerTodasLasReglas() {
        System.out.println("📋 Obteniendo todas las reglas de automatización");
        return automationRuleRepository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene reglas activas
     */
    public List<AutomationRuleDTO> obtenerReglasActivas() {
        return automationRuleRepository.findByActivaTrue().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene una regla por ID
     */
    public Optional<AutomationRuleDTO> obtenerReglaPorId(Long id) {
        return automationRuleRepository.findById(id)
                .map(this::convertirADTO);
    }

    /**
     * Crea una nueva regla
     */
    public AutomationRuleDTO crearRegla(AutomationRuleDTO reglaDTO) {
        System.out.println("🔧 Creando nueva regla: " + reglaDTO.getNombre());
        System.out.println("🔧 DTO recibido: " + reglaDTO);
        
        try {
            AutomationRule regla = new AutomationRule();
            regla.setNombre(reglaDTO.getNombre());
            regla.setDescripcion(reglaDTO.getDescripcion());
            regla.setCondicion(reglaDTO.getCondicion());
            regla.setAccion(reglaDTO.getAccion());
            regla.setPrioridad(reglaDTO.getPrioridad());
            regla.setActiva(reglaDTO.getActiva() != null ? reglaDTO.getActiva() : true);
            
            System.out.println("🔧 Regla creada en memoria: " + regla);
            
            AutomationRule reglaGuardada = automationRuleRepository.save(regla);
            System.out.println("✅ Regla guardada con ID: " + reglaGuardada.getId());
            System.out.println("✅ Regla guardada completa: " + reglaGuardada);
            
            return convertirADTO(reglaGuardada);
        } catch (Exception e) {
            System.err.println("❌ Error al guardar regla: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Actualiza una regla existente
     */
    public AutomationRuleDTO actualizarRegla(Long id, AutomationRuleDTO reglaDTO) {
        Optional<AutomationRule> reglaOpt = automationRuleRepository.findById(id);
        if (reglaOpt.isEmpty()) {
            throw new RuntimeException("Regla no encontrada con ID: " + id);
        }

        AutomationRule regla = reglaOpt.get();
        regla.setNombre(reglaDTO.getNombre());
        regla.setDescripcion(reglaDTO.getDescripcion());
        regla.setCondicion(reglaDTO.getCondicion());
        regla.setAccion(reglaDTO.getAccion());
        regla.setPrioridad(reglaDTO.getPrioridad());
        regla.setActiva(reglaDTO.getActiva());
        regla.setFechaActualizacion(LocalDateTime.now());

        AutomationRule reglaActualizada = automationRuleRepository.save(regla);
        return convertirADTO(reglaActualizada);
    }

    /**
     * Elimina una regla
     */
    public void eliminarRegla(Long id) {
        System.out.println("🗑️ Eliminando regla con ID: " + id);
        
        if (!automationRuleRepository.existsById(id)) {
            throw new RuntimeException("Regla no encontrada con ID: " + id);
        }
        automationRuleRepository.deleteById(id);
        System.out.println("✅ Regla eliminada correctamente");
    }

    /**
     * Activa/desactiva una regla
     */
    public AutomationRuleDTO toggleRegla(Long id) {
        System.out.println("🔄 Cambiando estado de regla con ID: " + id);
        
        Optional<AutomationRule> reglaOpt = automationRuleRepository.findById(id);
        if (reglaOpt.isEmpty()) {
            throw new RuntimeException("Regla no encontrada con ID: " + id);
        }

        AutomationRule regla = reglaOpt.get();
        regla.setActiva(!regla.getActiva());
        regla.setFechaActualizacion(LocalDateTime.now());

        AutomationRule reglaActualizada = automationRuleRepository.save(regla);
        System.out.println("✅ Estado de regla actualizado: " + reglaActualizada.getActiva());
        
        return convertirADTO(reglaActualizada);
    }

    /**
     * Obtiene estadísticas de las reglas
     */
    public AutomationStatsDTO obtenerEstadisticas() {
        long totalReglas = automationRuleRepository.count();
        long reglasActivas = automationRuleRepository.countByActivaTrue();
        Long totalEjecuciones = automationRuleRepository.sumEjecucionesByActivaTrue();
        
        return new AutomationStatsDTO(
            totalReglas,
            reglasActivas,
            totalEjecuciones != null ? totalEjecuciones : 0
        );
    }

    /**
     * Busca reglas por nombre
     */
    public List<AutomationRuleDTO> buscarReglasPorNombre(String nombre) {
        return automationRuleRepository.findByNombreContainingIgnoreCase(nombre).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene reglas para ejecutar (usado por el motor de reglas)
     */
    public List<AutomationRule> obtenerReglasParaEjecutar() {
        return automationRuleRepository.findReglasParaEjecutar();
    }

    /**
     * Incrementa el contador de ejecuciones de una regla
     */
    public void incrementarEjecuciones(Long reglaId) {
        Optional<AutomationRule> reglaOpt = automationRuleRepository.findById(reglaId);
        if (reglaOpt.isPresent()) {
            AutomationRule regla = reglaOpt.get();
            regla.incrementarEjecuciones();
            automationRuleRepository.save(regla);
        }
    }

    /**
     * Convierte entidad a DTO
     */
    private AutomationRuleDTO convertirADTO(AutomationRule regla) {
        return new AutomationRuleDTO(
            regla.getId(),
            regla.getNombre(),
            regla.getDescripcion(),
            regla.getCondicion(),
            regla.getAccion(),
            regla.getPrioridad(),
            regla.getActiva(),
            regla.getFechaCreacion(),
            regla.getFechaActualizacion(),
            regla.getEjecuciones(),
            regla.getUltimaEjecucion()
        );
    }
}