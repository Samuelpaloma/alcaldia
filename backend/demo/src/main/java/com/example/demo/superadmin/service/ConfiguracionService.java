package com.example.demo.superadmin.service;

import com.example.demo.superadmin.dto.request.ConfiguracionRequestDTO;
import com.example.demo.superadmin.dto.response.ConfiguracionResponseDTO;
import com.example.demo.superadmin.model.ConfiguracionSistema;
import com.example.demo.superadmin.repository.ConfiguracionSistemaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ConfiguracionService {
    
    private final ConfiguracionSistemaRepository configuracionRepository;
    
    /**
     * Obtener todas las configuraciones activas
     */
    public List<ConfiguracionResponseDTO> obtenerTodasLasConfiguraciones() {
        log.info("Obteniendo todas las configuraciones activas");
        List<ConfiguracionSistema> configuraciones = configuracionRepository.findByActivaTrueOrderByCategoriaAsc();
        return configuraciones.stream()
            .map(this::convertirAResponseDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtener configuraciones por categoría
     */
    public List<ConfiguracionResponseDTO> obtenerConfiguracionesPorCategoria(String categoria) {
        log.info("Obteniendo configuraciones de categoría: {}", categoria);
        List<ConfiguracionSistema> configuraciones = configuracionRepository.findByCategoriaAndActivaTrue(categoria);
        return configuraciones.stream()
            .map(this::convertirAResponseDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtener configuraciones agrupadas (colores, logo, general)
     */
    public Map<String, Map<String, String>> obtenerConfiguracionesAgrupadas() {
        log.info("Obteniendo configuraciones agrupadas");
        
        Map<String, Map<String, String>> configuraciones = new HashMap<>();
        
        // Colores
        List<ConfiguracionSistema> colores = configuracionRepository.findColoresActivos();
        Map<String, String> coloresMap = colores.stream()
            .collect(Collectors.toMap(ConfiguracionSistema::getClave, ConfiguracionSistema::getValor));
        configuraciones.put("colores", coloresMap);
        
        // Logo
        List<ConfiguracionSistema> logo = configuracionRepository.findLogoActivo();
        Map<String, String> logoMap = logo.stream()
            .collect(Collectors.toMap(ConfiguracionSistema::getClave, ConfiguracionSistema::getValor));
        configuraciones.put("logo", logoMap);
        
        // General
        List<ConfiguracionSistema> general = configuracionRepository.findConfiguracionesGenerales();
        Map<String, String> generalMap = general.stream()
            .collect(Collectors.toMap(ConfiguracionSistema::getClave, ConfiguracionSistema::getValor));
        configuraciones.put("general", generalMap);
        
        return configuraciones;
    }
    
    /**
     * Obtener una configuración específica
     */
    public ConfiguracionResponseDTO obtenerConfiguracion(String clave) {
        log.info("Obteniendo configuración: {}", clave);
        ConfiguracionSistema configuracion = configuracionRepository.findByClave(clave)
            .orElseThrow(() -> new RuntimeException("Configuración no encontrada: " + clave));
        return convertirAResponseDTO(configuracion);
    }
    
    /**
     * Crear o actualizar configuración
     */
    public ConfiguracionResponseDTO crearOActualizarConfiguracion(ConfiguracionRequestDTO request) {
        log.info("Creando/actualizando configuración: {}", request.getClave());
        
        ConfiguracionSistema configuracion = configuracionRepository.findByClave(request.getClave())
            .orElse(ConfiguracionSistema.builder()
                .clave(request.getClave())
                .categoria(request.getCategoria())
                .activa(true)
                .build());
        
        configuracion.setValor(request.getValor());
        configuracion.setDescripcion(request.getDescripcion());
        
        ConfiguracionSistema savedConfig = configuracionRepository.save(configuracion);
        
        log.info("Configuración {} guardada exitosamente", savedConfig.getClave());
        return convertirAResponseDTO(savedConfig);
    }
    
    /**
     * Actualizar colores del sistema
     */
    public void actualizarColores(String colorPrimario, String colorSecundario, String colorFondo) {
        log.info("Actualizando colores del sistema");
        
        if (colorPrimario != null) {
            crearOActualizarConfiguracion(ConfiguracionRequestDTO.builder()
                .clave("color_primario")
                .valor(colorPrimario)
                .categoria("colores")
                .descripcion("Color primario del sistema")
                .build());
        }
        
        if (colorSecundario != null) {
            crearOActualizarConfiguracion(ConfiguracionRequestDTO.builder()
                .clave("color_secundario")
                .valor(colorSecundario)
                .categoria("colores")
                .descripcion("Color secundario del sistema")
                .build());
        }
        
        if (colorFondo != null) {
            crearOActualizarConfiguracion(ConfiguracionRequestDTO.builder()
                .clave("color_fondo")
                .valor(colorFondo)
                .categoria("colores")
                .descripcion("Color de fondo del sistema")
                .build());
        }
    }
    
    /**
     * Actualizar logo del sistema
     */
    public void actualizarLogo(String logoUrl, String nombreApp) {
        log.info("Actualizando logo del sistema");
        
        if (logoUrl != null) {
            crearOActualizarConfiguracion(ConfiguracionRequestDTO.builder()
                .clave("logo_url")
                .valor(logoUrl)
                .categoria("logo")
                .descripcion("URL del logo del sistema")
                .build());
        }
        
        if (nombreApp != null) {
            crearOActualizarConfiguracion(ConfiguracionRequestDTO.builder()
                .clave("nombre_app")
                .valor(nombreApp)
                .categoria("logo")
                .descripcion("Nombre de la aplicación")
                .build());
        }
    }
    
    /**
     * Eliminar configuración (soft delete)
     */
    public void eliminarConfiguracion(String clave) {
        log.info("Eliminando configuración: {}", clave);
        ConfiguracionSistema configuracion = configuracionRepository.findByClave(clave)
            .orElseThrow(() -> new RuntimeException("Configuración no encontrada: " + clave));
        
        configuracion.setActiva(false);
        configuracionRepository.save(configuracion);
        
        log.info("Configuración {} eliminada exitosamente", clave);
    }
    
    /**
     * Crear configuraciones por defecto
     */
    public void crearConfiguracionesPorDefecto() {
        log.info("Creando configuraciones por defecto");
        
        // Colores por defecto
        actualizarColores("#1976d2", "#dc004e", "#f5f5f5");
        
        // Logo por defecto
        actualizarLogo("/images/logo-sena.png", "Sistema de Gestión de Tickets");
        
        // Configuraciones generales
        crearOActualizarConfiguracion(ConfiguracionRequestDTO.builder()
            .clave("version")
            .valor("1.0.0")
            .categoria("general")
            .descripcion("Versión de la aplicación")
            .build());
    }
    
    // Método auxiliar para convertir a DTO
    private ConfiguracionResponseDTO convertirAResponseDTO(ConfiguracionSistema configuracion) {
        return ConfiguracionResponseDTO.builder()
            .idConfiguracion(configuracion.getIdConfiguracion())
            .clave(configuracion.getClave())
            .valor(configuracion.getValor())
            .descripcion(configuracion.getDescripcion())
            .categoria(configuracion.getCategoria())
            .activa(configuracion.getActiva())
            .fechaCreacion(configuracion.getFechaCreacion())
            .fechaActualizacion(configuracion.getFechaActualizacion())
            .build();
    }
}


