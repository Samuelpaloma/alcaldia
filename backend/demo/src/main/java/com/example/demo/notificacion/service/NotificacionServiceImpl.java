package com.example.demo.notificacion.service;

import com.example.demo.notificacion.dto.NotificacionDTO;
import com.example.demo.notificacion.dto.PreferenciasNotificacionDTO;
import com.example.demo.notificacion.dto.request.CreateNotificacionRequest;
import com.example.demo.notificacion.model.Notificacion;
import com.example.demo.notificacion.model.NotificacionMejorada;
import com.example.demo.notificacion.model.PreferenciasNotificacion;
import com.example.demo.notificacion.repository.NotificacionRepository;
import com.example.demo.notificacion.repository.NotificacionMejoradaRepository;
import com.example.demo.notificacion.repository.PreferenciasNotificacionRepository;
import com.example.demo.shared.dto.PageResponse;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificacionServiceImpl implements NotificacionService {
    
    private final NotificacionRepository notificacionRepository;
    private final NotificacionMejoradaRepository notificacionMejoradaRepository;
    private final PreferenciasNotificacionRepository preferenciasNotificacionRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Override
    public PageResponse<Notificacion> obtenerNotificacionesPorUsuario(String emailUsuario, Pageable pageable, Boolean leida) {
        log.info("Obteniendo notificaciones para usuario: {}, leída: {}", emailUsuario, leida);
        
        Page<Notificacion> page;
        if (leida != null) {
            page = notificacionRepository.findByUsuarioEmailAndLeidaOrderByFechaCreacionDesc(emailUsuario, leida, pageable);
        } else {
            page = notificacionRepository.findByUsuarioEmailOrderByFechaCreacionDesc(emailUsuario, pageable);
        }
        
        return PageResponse.fromPage(page);
    }
    
    @Override
    public List<Notificacion> obtenerNotificacionesNoLeidas(String emailUsuario) {
        log.info("Obteniendo notificaciones no leídas para usuario: {}", emailUsuario);
        return notificacionRepository.findByUsuarioEmailAndLeidaFalseOrderByFechaCreacionDesc(emailUsuario);
    }
    
    @Override
    @Transactional
    public Notificacion marcarComoLeida(Long id, String emailUsuario) {
        log.info("Marcando notificación {} como leída para usuario: {}", id, emailUsuario);
        
        Notificacion notificacion = notificacionRepository.findByIdAndUsuarioEmail(id, emailUsuario)
            .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        
        notificacion.setLeida(true);
        notificacion.setFechaLeida(LocalDateTime.now());
        
        return notificacionRepository.save(notificacion);
    }
    
    @Override
    @Transactional
    public int marcarTodasComoLeidas(String emailUsuario) {
        log.info("Marcando todas las notificaciones como leídas para usuario: {}", emailUsuario);
        
        List<Notificacion> notificacionesNoLeidas = notificacionRepository
            .findByUsuarioEmailAndLeidaFalseOrderByFechaCreacionDesc(emailUsuario);
        
        LocalDateTime ahora = LocalDateTime.now();
        notificacionesNoLeidas.forEach(notificacion -> {
            notificacion.setLeida(true);
            notificacion.setFechaLeida(ahora);
        });
        
        notificacionRepository.saveAll(notificacionesNoLeidas);
        
        return notificacionesNoLeidas.size();
    }
    
    @Override
    @Transactional
    public Notificacion crearNotificacion(CreateNotificacionRequest request, String emailCreador) {
        log.info("Creando notificación: {} para usuario: {}", request.getTitulo(), request.getUsuarioEmail());
        
        Notificacion notificacion = new Notificacion();
        notificacion.setTitulo(request.getTitulo());
        notificacion.setMensaje(request.getMensaje());
        notificacion.setTipo(request.getTipo());
        notificacion.setUsuarioEmail(request.getUsuarioEmail());
        notificacion.setLeida(false);
        notificacion.setFechaCreacion(LocalDateTime.now());
        notificacion.setCreadorEmail(emailCreador);
        
        return notificacionRepository.save(notificacion);
    }
    
    @Override
    public Notificacion crearNotificacion(Notificacion notificacion) {
        log.info("Creando notificación directamente: {} para usuario: {}", notificacion.getTitulo(), notificacion.getUsuarioEmail());
        
        // Asegurar que los campos requeridos estén establecidos
        if (notificacion.getFechaCreacion() == null) {
            notificacion.setFechaCreacion(LocalDateTime.now());
        }
        if (notificacion.getLeida() == null) {
            notificacion.setLeida(false);
        }
        
        return notificacionRepository.save(notificacion);
    }
    
    @Override
    @Transactional
    public void eliminarNotificacion(Long id, String emailUsuario) {
        log.info("Eliminando notificación {} para usuario: {}", id, emailUsuario);
        
        Notificacion notificacion = notificacionRepository.findByIdAndUsuarioEmail(id, emailUsuario)
            .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        
        notificacionRepository.delete(notificacion);
    }
    
    @Override
    public NotificacionService.NotificacionStatsResponseDTO obtenerEstadisticas(String emailUsuario) {
        log.info("Obteniendo estadísticas de notificaciones para usuario: {}", emailUsuario);
        
        long totalNotificaciones = notificacionRepository.countByUsuarioEmail(emailUsuario);
        long notificacionesNoLeidas = notificacionRepository.countByUsuarioEmailAndLeidaFalse(emailUsuario);
        long notificacionesLeidas = totalNotificaciones - notificacionesNoLeidas;
        
        LocalDateTime hoy = LocalDateTime.now().truncatedTo(ChronoUnit.DAYS);
        long notificacionesHoy = notificacionRepository.countByUsuarioEmailAndFechaCreacionAfter(emailUsuario, hoy);
        
        LocalDateTime inicioSemana = hoy.minusDays(7);
        long notificacionesEstaSemana = notificacionRepository.countByUsuarioEmailAndFechaCreacionAfter(emailUsuario, inicioSemana);
        
        return new NotificacionService.NotificacionStatsResponseDTO(
            totalNotificaciones,
            notificacionesNoLeidas,
            notificacionesLeidas,
            notificacionesHoy,
            notificacionesEstaSemana
        );
    }
    
    @Override
    public List<NotificacionDTO> getNotificacionesByUsuario(Long usuarioId) {
        log.info("Obteniendo notificaciones para usuario ID: {}", usuarioId);
        
        List<Notificacion> notificaciones = notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId);
        return notificaciones.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<NotificacionDTO> getNotificacionesNoLeidasByUsuario(Long usuarioId) {
        log.info("Obteniendo notificaciones no leídas para usuario ID: {}", usuarioId);
        
        List<Notificacion> notificaciones = notificacionRepository.findByUsuarioIdAndLeidaFalseOrderByFechaCreacionDesc(usuarioId);
        return notificaciones.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void marcarComoLeida(Long notificacionId, Long usuarioId) {
        log.info("Marcando notificación {} como leída para usuario ID: {}", notificacionId, usuarioId);
        
        Notificacion notificacion = notificacionRepository.findByIdAndUsuarioId(notificacionId, usuarioId)
            .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        
        notificacion.setLeida(true);
        notificacion.setFechaLeida(LocalDateTime.now());
        
        notificacionRepository.save(notificacion);
    }
    
    @Override
    public long contarNotificacionesNoLeidas(Long usuarioId) {
        log.info("Contando notificaciones no leídas para usuario ID: {}", usuarioId);
        return notificacionRepository.countByUsuarioIdAndLeidaFalse(usuarioId);
    }
    
    @Override
    public PreferenciasNotificacionDTO getPreferenciasByUsuario(Long usuarioId) {
        log.info("Obteniendo preferencias para usuario ID: {}", usuarioId);
        
        PreferenciasNotificacion preferencias = preferenciasNotificacionRepository.findByUsuarioId(usuarioId)
            .orElseGet(() -> {
                // Crear preferencias por defecto si no existen
                PreferenciasNotificacion nuevasPreferencias = new PreferenciasNotificacion();
                nuevasPreferencias.setUsuarioId(usuarioId);
                return preferenciasNotificacionRepository.save(nuevasPreferencias);
            });
        
        return convertToPreferenciasDTO(preferencias);
    }
    
    @Override
    @Transactional
    public PreferenciasNotificacionDTO actualizarPreferencias(Long usuarioId, PreferenciasNotificacionDTO preferenciasDTO) {
        log.info("Actualizando preferencias para usuario ID: {}", usuarioId);
        
        PreferenciasNotificacion preferencias = preferenciasNotificacionRepository.findByUsuarioId(usuarioId)
            .orElseGet(() -> {
                PreferenciasNotificacion nuevasPreferencias = new PreferenciasNotificacion();
                nuevasPreferencias.setUsuarioId(usuarioId);
                return nuevasPreferencias;
            });
        
        // Actualizar campos
        preferencias.setPushActivo(preferenciasDTO.getPushActivo());
        preferencias.setEmailActivo(preferenciasDTO.getEmailActivo());
        preferencias.setNotificacionesTicketAsignado(preferenciasDTO.getNotificacionesTicketAsignado());
        preferencias.setNotificacionesTicketEnProceso(preferenciasDTO.getNotificacionesTicketEnProceso());
        preferencias.setNotificacionesTicketResuelto(preferenciasDTO.getNotificacionesTicketResuelto());
        preferencias.setNotificacionesComentarios(preferenciasDTO.getNotificacionesComentarios());
        preferencias.setNotificacionesEvidencias(preferenciasDTO.getNotificacionesEvidencias());
        preferencias.setNotificacionesSla(preferenciasDTO.getNotificacionesSla());
        preferencias.setNotificacionesSistema(preferenciasDTO.getNotificacionesSistema());
        preferencias.setFrecuenciaEmail(preferenciasDTO.getFrecuenciaEmail());
        
        PreferenciasNotificacion saved = preferenciasNotificacionRepository.save(preferencias);
        return convertToPreferenciasDTO(saved);
    }
    
    private NotificacionDTO convertToDTO(Notificacion notificacion) {
        NotificacionDTO dto = new NotificacionDTO();
        dto.setId(notificacion.getId());
        dto.setTitulo(notificacion.getTitulo());
        dto.setMensaje(notificacion.getMensaje());
        dto.setTipo(notificacion.getTipo());
        dto.setLeida(notificacion.getLeida());
        dto.setUsuarioId(notificacion.getUsuarioId());
        dto.setUsuarioEmail(notificacion.getUsuarioEmail());
        dto.setCreadorEmail(notificacion.getCreadorEmail());
        dto.setTicketId(notificacion.getTicketId());
        dto.setFechaCreacion(notificacion.getFechaCreacion());
        dto.setFechaLeida(notificacion.getFechaLeida());
        dto.setFechaActualizacion(notificacion.getFechaActualizacion());
        
        // Campos adicionales para el frontend
        dto.setPrioridad("normal"); // Por defecto
        dto.setUsuarioActorEmail(notificacion.getCreadorEmail());
        
        return dto;
    }
    
    private PreferenciasNotificacionDTO convertToPreferenciasDTO(PreferenciasNotificacion preferencias) {
        PreferenciasNotificacionDTO dto = new PreferenciasNotificacionDTO();
        dto.setId(preferencias.getId());
        dto.setUsuarioId(preferencias.getUsuarioId());
        dto.setPushActivo(preferencias.getPushActivo());
        dto.setEmailActivo(preferencias.getEmailActivo());
        dto.setNotificacionesTicketAsignado(preferencias.getNotificacionesTicketAsignado());
        dto.setNotificacionesTicketEnProceso(preferencias.getNotificacionesTicketEnProceso());
        dto.setNotificacionesTicketResuelto(preferencias.getNotificacionesTicketResuelto());
        dto.setNotificacionesComentarios(preferencias.getNotificacionesComentarios());
        dto.setNotificacionesEvidencias(preferencias.getNotificacionesEvidencias());
        dto.setNotificacionesSla(preferencias.getNotificacionesSla());
        dto.setNotificacionesSistema(preferencias.getNotificacionesSistema());
        dto.setFrecuenciaEmail(preferencias.getFrecuenciaEmail());
        
        return dto;
    }
    
    // ===== MÉTODOS ADICIONALES DE ALCALDIA =====
    
    @Override
    @Transactional
    public NotificacionMejorada crearNotificacion(String tipo, String mensaje, List<Integer> destinatariosIds, 
                                                  Long ticketId, Integer usuarioActorId, String prioridad) {
        try {
            // Convertir lista de IDs a JSON
            String destinatariosJson = objectMapper.writeValueAsString(destinatariosIds);
            
            // Obtener información del usuario actor
            Usuario usuarioActor = usuarioRepository.findById(usuarioActorId.longValue()).orElse(null);
            String usuarioActorEmail = usuarioActor != null ? usuarioActor.getEmail() : null;
            String usuarioActorNombre = usuarioActor != null ? usuarioActor.getNombre() : null;
            
            NotificacionMejorada notificacion = new NotificacionMejorada();
            notificacion.setTipo(tipo);
            notificacion.setMensaje(mensaje);
            notificacion.setDestinatarios(destinatariosJson);
            notificacion.setTicketId(ticketId);
            notificacion.setUsuarioActorId(usuarioActorId.longValue());
            notificacion.setUsuarioActorEmail(usuarioActorEmail);
            notificacion.setUsuarioActorNombre(usuarioActorNombre);
            notificacion.setPrioridad(prioridad != null ? prioridad : NotificacionMejorada.PRIORIDAD_NORMAL);
            notificacion.setLeida(false);
            notificacion.setFechaCreacion(LocalDateTime.now());
            
            return notificacionMejoradaRepository.save(notificacion);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error al crear notificación", e);
        }
    }

    @Override
    public NotificacionMejorada crearNotificacionSiPushActivo(String tipo, String mensaje, List<Integer> destinatariosIds, 
                                                              Long ticketId, Integer usuarioActorId, String prioridad) {
        // Verificar si al menos un destinatario tiene push activo
        boolean algunPushActivo = false;
        for (Integer destinatarioId : destinatariosIds) {
            PreferenciasNotificacion preferencias = preferenciasNotificacionRepository.findByUsuarioId(destinatarioId.longValue()).orElse(null);
            if (preferencias != null && preferencias.getPushActivo()) {
                algunPushActivo = true;
                break;
            }
        }
        
        // Si ningún destinatario tiene push activo, no crear notificación en BD
        if (!algunPushActivo) {
            System.out.println("⚠️ [BD] Ningún destinatario tiene push activo - no se guarda notificación en BD");
            return null;
        }
        
        // Si al menos uno tiene push activo, crear la notificación
        return crearNotificacion(tipo, mensaje, destinatariosIds, ticketId, usuarioActorId, prioridad);
    }
    
}
