package com.example.demo.notificacion.service;

import com.example.demo.notificacion.model.PreferenciasNotificacion;
import com.example.demo.notificacion.repository.PreferenciasNotificacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreferenciasNotificacionService {
    
    private final PreferenciasNotificacionRepository preferenciasRepository;
    
    /**
     * Obtener preferencias de notificación por ID de usuario
     */
    public Map<String, Object> obtenerPreferenciasPorUsuario(Long usuarioId) {
        log.info("Obteniendo preferencias para usuario ID: {}", usuarioId);
        
        Optional<PreferenciasNotificacion> preferenciasOpt = preferenciasRepository.findByUsuarioId(usuarioId);
        
        if (preferenciasOpt.isPresent()) {
            PreferenciasNotificacion preferencias = preferenciasOpt.get();
            log.info("Preferencias encontradas para usuario ID: {}", usuarioId);
            return convertirAMap(preferencias);
        } else {
            log.info("No se encontraron preferencias para usuario ID: {}, creando por defecto", usuarioId);
            // Crear preferencias por defecto
            PreferenciasNotificacion preferenciasPorDefecto = crearPreferenciasPorDefecto(usuarioId);
            PreferenciasNotificacion preferenciasGuardadas = preferenciasRepository.save(preferenciasPorDefecto);
            return convertirAMap(preferenciasGuardadas);
        }
    }
    
    /**
     * Actualizar preferencias de notificación
     */
    @Transactional
    public Map<String, Object> actualizarPreferencias(Long usuarioId, Map<String, Object> preferenciasData) {
        log.info("Actualizando preferencias para usuario ID: {}", usuarioId);
        
        Optional<PreferenciasNotificacion> preferenciasOpt = preferenciasRepository.findByUsuarioId(usuarioId);
        
        PreferenciasNotificacion preferencias;
        if (preferenciasOpt.isPresent()) {
            preferencias = preferenciasOpt.get();
            log.info("Actualizando preferencias existentes");
        } else {
            preferencias = crearPreferenciasPorDefecto(usuarioId);
            log.info("Creando nuevas preferencias");
        }
        
        // Actualizar solo los campos permitidos (no pushActivo que siempre debe ser true)
        if (preferenciasData.containsKey("emailActivo")) {
            preferencias.setEmailActivo((Boolean) preferenciasData.get("emailActivo"));
        }
        
        if (preferenciasData.containsKey("notificacionesTicketAsignado")) {
            preferencias.setNotificacionesTicketAsignado((Boolean) preferenciasData.get("notificacionesTicketAsignado"));
        }
        
        if (preferenciasData.containsKey("notificacionesTicketEnProceso")) {
            preferencias.setNotificacionesTicketEnProceso((Boolean) preferenciasData.get("notificacionesTicketEnProceso"));
        }
        
        if (preferenciasData.containsKey("notificacionesTicketResuelto")) {
            preferencias.setNotificacionesTicketResuelto((Boolean) preferenciasData.get("notificacionesTicketResuelto"));
        }
        
        if (preferenciasData.containsKey("notificacionesComentarios")) {
            preferencias.setNotificacionesComentarios((Boolean) preferenciasData.get("notificacionesComentarios"));
        }
        
        if (preferenciasData.containsKey("notificacionesEvidencias")) {
            preferencias.setNotificacionesEvidencias((Boolean) preferenciasData.get("notificacionesEvidencias"));
        }
        
        if (preferenciasData.containsKey("notificacionesSla")) {
            preferencias.setNotificacionesSla((Boolean) preferenciasData.get("notificacionesSla"));
        }
        
        if (preferenciasData.containsKey("notificacionesSistema")) {
            preferencias.setNotificacionesSistema((Boolean) preferenciasData.get("notificacionesSistema"));
        }
        
        if (preferenciasData.containsKey("frecuenciaEmail")) {
            preferencias.setFrecuenciaEmail((String) preferenciasData.get("frecuenciaEmail"));
        }
        
        // Asegurar que pushActivo siempre sea true
        preferencias.setPushActivo(true);
        
        PreferenciasNotificacion preferenciasActualizadas = preferenciasRepository.save(preferencias);
        log.info("Preferencias actualizadas exitosamente para usuario ID: {}", usuarioId);
        
        return convertirAMap(preferenciasActualizadas);
    }
    
    /**
     * Crear preferencias por defecto para un usuario
     */
    private PreferenciasNotificacion crearPreferenciasPorDefecto(Long usuarioId) {
        PreferenciasNotificacion preferencias = new PreferenciasNotificacion();
        preferencias.setUsuarioId(usuarioId);
        preferencias.setPushActivo(true); // Siempre activo
        preferencias.setEmailActivo(false); // Por defecto desactivado
        preferencias.setNotificacionesTicketAsignado(true);
        preferencias.setNotificacionesTicketEnProceso(true);
        preferencias.setNotificacionesTicketResuelto(true);
        preferencias.setNotificacionesComentarios(true);
        preferencias.setNotificacionesEvidencias(true);
        preferencias.setNotificacionesSla(true);
        preferencias.setNotificacionesSistema(true);
        preferencias.setFrecuenciaEmail("inmediata");
        
        return preferencias;
    }
    
    /**
     * Convertir entidad a Map para respuesta
     */
    private Map<String, Object> convertirAMap(PreferenciasNotificacion preferencias) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", preferencias.getId());
        map.put("usuarioId", preferencias.getUsuarioId());
        map.put("pushActivo", preferencias.getPushActivo());
        map.put("emailActivo", preferencias.getEmailActivo());
        map.put("notificacionesTicketAsignado", preferencias.getNotificacionesTicketAsignado());
        map.put("notificacionesTicketEnProceso", preferencias.getNotificacionesTicketEnProceso());
        map.put("notificacionesTicketResuelto", preferencias.getNotificacionesTicketResuelto());
        map.put("notificacionesComentarios", preferencias.getNotificacionesComentarios());
        map.put("notificacionesEvidencias", preferencias.getNotificacionesEvidencias());
        map.put("notificacionesSla", preferencias.getNotificacionesSla());
        map.put("notificacionesSistema", preferencias.getNotificacionesSistema());
        map.put("frecuenciaEmail", preferencias.getFrecuenciaEmail());
        map.put("createdAt", preferencias.getFechaCreacion());
        map.put("updatedAt", preferencias.getFechaActualizacion());
        
        return map;
    }
}