package com.example.demo.notificacion.service;

import com.example.demo.notificacion.dto.request.CreateNotificacionRequest;
import com.example.demo.notificacion.model.Notificacion;
import com.example.demo.notificacion.repository.NotificacionRepository;
import com.example.demo.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificacionServiceImpl implements NotificacionService {
    
    private final NotificacionRepository notificacionRepository;
    
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
}
