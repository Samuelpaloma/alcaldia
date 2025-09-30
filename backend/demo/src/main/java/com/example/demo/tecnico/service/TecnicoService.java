package com.example.demo.tecnico.service;

import com.example.demo.tecnico.dto.request.CambiarEstadoTicketRequestDTO;
import com.example.demo.tecnico.dto.request.SubirEvidenciaRequestDTO;
import com.example.demo.tecnico.dto.response.TicketTecnicoResponseDTO;
import com.example.demo.tecnico.dto.response.EstadisticasTecnicoResponseDTO;
import com.example.demo.ticket.dto.response.EvidenciaResponseDTO;
import com.example.demo.ticket.dto.response.HistorialEstadoResponseDTO;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.ticket.repository.HistorialEstadoTicketRepository;
import com.example.demo.ticket.model.HistorialEstadoTicket;
import com.example.demo.evidencia.model.Evidencia;
import com.example.demo.evidencia.repository.EvidenciaRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.example.demo.notificacion.service.NotificacionAutomaticaService;
import com.example.demo.notificacion.service.NotificacionServiceSimple;
import com.example.demo.ticket.service.ComentarioService;
import com.example.demo.ticket.dto.response.ComentarioResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TecnicoService {
    
    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;
    private final EvidenciaRepository evidenciaRepository;
    private final HistorialEstadoTicketRepository historialRepository;
    private final NotificacionAutomaticaService notificacionAutomaticaService;
    private final NotificacionServiceSimple notificacionServiceSimple;
    private final ComentarioService comentarioService;
    
    /**
     * Obtener tickets asignados a un técnico
     */
    @Transactional(readOnly = true)
    public List<TicketTecnicoResponseDTO> obtenerTicketsAsignados(String emailTecnico) {
        log.info("Obteniendo tickets asignados para técnico: {}", emailTecnico);
        
        Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        List<Ticket> tickets = ticketRepository.findByTecnicoAsignadoOrderByFechaCreacionDesc(tecnico);
        
        return tickets.stream()
            .map(this::convertirTicketAResponseDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtener un ticket específico con evidencias e historial
     */
    @Transactional(readOnly = true)
    public TicketTecnicoResponseDTO obtenerTicketDetallado(Long ticketId, String emailTecnico) {
        log.info("Obteniendo ticket detallado {} para técnico: {}", ticketId, emailTecnico);
        
        Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // Verificar que el ticket esté asignado al técnico
        if (!ticket.getTecnicoAsignado().getIdUsuario().equals(tecnico.getIdUsuario())) {
            throw new RuntimeException("No tienes acceso a este ticket");
        }
        
        return convertirTicketAResponseDTO(ticket);
    }
    
    /**
     * Cambiar estado de un ticket
     */
    public TicketTecnicoResponseDTO cambiarEstadoTicket(CambiarEstadoTicketRequestDTO request, String emailTecnico) {
        log.info("Cambiando estado del ticket {} a {} por técnico: {}", 
            request.getTicketId(), request.getNuevoEstado(), emailTecnico);
        
        // 1. Buscar ticket
        Ticket ticket = ticketRepository.findById(request.getTicketId())
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // 2. Buscar técnico
        Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        // 3. Verificar que el ticket esté asignado al técnico
        if (!ticket.getTecnicoAsignado().getIdUsuario().equals(tecnico.getIdUsuario())) {
            throw new RuntimeException("No tienes acceso a este ticket");
        }
        
        // 4. Validar transición de estado
        String estadoAnterior = ticket.getEstado();
        String estadoNuevo = request.getNuevoEstado();
        
        if (!esTransicionValida(estadoAnterior, estadoNuevo)) {
            throw new RuntimeException("Transición de estado no válida: " + estadoAnterior + " → " + estadoNuevo);
        }
        
        // 5. Actualizar estado
        ticket.setEstado(estadoNuevo);
        ticket.setFechaActualizacion(LocalDateTime.now());
        ticketRepository.save(ticket);
        
        // 6. Crear historial
        HistorialEstadoTicket historial = HistorialEstadoTicket.builder()
            .ticket(ticket)
            .cambiadoPor(tecnico)
            .estadoAnterior(estadoAnterior)
            .estadoNuevo(estadoNuevo)
            .comentario(request.getComentario())
            .observaciones(request.getObservaciones())
            .tipoUsuario("TECNICO")
            .build();
        
        historialRepository.save(historial);
        
        log.info("Estado del ticket {} cambiado exitosamente de {} a {}", 
            ticket.getId(), estadoAnterior, estadoNuevo);
        
        return convertirTicketAResponseDTO(ticket);
    }
    
    /**
     * Subir evidencia a un ticket
     */
    public EvidenciaResponseDTO subirEvidencia(SubirEvidenciaRequestDTO request, String emailTecnico) {
        log.info("Subiendo evidencia al ticket {} por técnico: {}", request.getTicketId(), emailTecnico);
        
        // 1. Buscar ticket
        Ticket ticket = ticketRepository.findById(request.getTicketId())
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // 2. Buscar técnico
        Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        // 3. Verificar que el ticket esté asignado al técnico
        if (!ticket.getTecnicoAsignado().getIdUsuario().equals(tecnico.getIdUsuario())) {
            throw new RuntimeException("No tienes acceso a este ticket");
        }
        
        // 4. Procesar archivo (simplificado - en producción usar servicio de archivos)
        String nombreArchivo = request.getNombreArchivo();
        String extension = request.getExtensionArchivo();
        String rutaArchivo = generarRutaArchivo(ticket.getId(), nombreArchivo);
        
        // 5. Crear evidencia
        Evidencia evidencia = Evidencia.builder()
            .ticket(ticket)
            .subidoPor(tecnico)
            .tipoEvidencia(request.getTipoEvidencia())
            .descripcion(request.getDescripcion())
            .nombreArchivo(nombreArchivo)
            .extensionArchivo(extension)
            .tamanioArchivo(request.getTamanioArchivo())
            .urlArchivo("/api/evidencias/descargar/" + ticket.getId() + "/" + nombreArchivo)
            .rutaArchivo(rutaArchivo)
            .activa(true)
            .build();
        
        evidenciaRepository.save(evidencia);
        
        log.info("Evidencia subida exitosamente al ticket {}", ticket.getId());
        
        return EvidenciaResponseDTO.builder()
            .idEvidencia(evidencia.getIdEvidencia())
            .ticketId(ticket.getId())
            .tipoEvidencia(evidencia.getTipoEvidencia())
            .descripcion(evidencia.getDescripcion())
            .nombreArchivo(evidencia.getNombreArchivo())
            .extensionArchivo(evidencia.getExtensionArchivo())
            .tamanioArchivo(evidencia.getTamanioArchivo())
            .urlArchivo(evidencia.getUrlArchivo())
            .fechaSubida(evidencia.getFechaSubida())
            .subidoPor(tecnico.getNombreCompleto())
            .build();
    }
    
    /**
     * Obtener historial de tickets del técnico
     */
    @Transactional(readOnly = true)
    public List<TicketTecnicoResponseDTO> obtenerHistorialTickets(String emailTecnico) {
        log.info("Obteniendo historial de tickets para técnico: {}", emailTecnico);
        
        Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        // Buscar todos los tickets que ha manejado el técnico (incluyendo terminados)
        List<Ticket> tickets = ticketRepository.findByTecnicoAsignado(tecnico);
        
        return tickets.stream()
            .map(this::convertirTicketAResponseDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtener estadísticas del técnico
     */
    @Transactional(readOnly = true)
    public EstadisticasTecnicoResponseDTO obtenerEstadisticasTecnico(String emailTecnico) {
        log.info("Obteniendo estadísticas para técnico: {}", emailTecnico);
        
        Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        long totalTickets = ticketRepository.countByTecnicoAsignado(tecnico);
        long ticketsPendientes = ticketRepository.findByTecnicoAsignado(tecnico).stream()
            .filter(t -> "PENDIENTE".equals(t.getEstado()))
            .count();
        long ticketsEnEjecucion = ticketRepository.findByTecnicoAsignado(tecnico).stream()
            .filter(t -> "EN_PROCESO".equals(t.getEstado()))
            .count();
        long ticketsTerminados = ticketRepository.findByTecnicoAsignado(tecnico).stream()
            .filter(t -> "COMPLETADO".equals(t.getEstado()))
            .count();
        
        // Calcular total de evidencias (evidencias + archivos adjuntos)
        long totalEvidencias = calcularTotalEvidencias(tecnico);
        
        // Calcular total de notificaciones no leídas
        long totalNotificaciones = calcularTotalNotificaciones(tecnico);
        
        EstadisticasTecnicoResponseDTO estadisticas = new EstadisticasTecnicoResponseDTO();
        estadisticas.setTotalTickets(totalTickets);
        estadisticas.setTicketsPendientes(ticketsPendientes);
        estadisticas.setTicketsEnEjecucion(ticketsEnEjecucion);
        estadisticas.setTicketsTerminados(ticketsTerminados);
        estadisticas.setTotalEvidencias(totalEvidencias);
        estadisticas.setTotalNotificaciones(totalNotificaciones);
        estadisticas.setTecnicoNombre(tecnico.getNombreCompleto());
        estadisticas.setTecnicoEmail(tecnico.getEmail());
        return estadisticas;
    }
    
    /**
     * Aceptar un ticket (PENDIENTE -> EN_PROCESO)
     */
    @Transactional
    public TicketTecnicoResponseDTO aceptarTicket(Long ticketId, String emailTecnico) {
        log.info("Aceptando ticket {} para técnico: {}", ticketId, emailTecnico);
        
        Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // Verificar que el ticket esté asignado al técnico
        if (!ticket.getTecnicoAsignado().getIdUsuario().equals(tecnico.getIdUsuario())) {
            throw new RuntimeException("El ticket no está asignado a este técnico");
        }
        
        // Verificar que el ticket esté en estado PENDIENTE
        if (!"PENDIENTE".equals(ticket.getEstado())) {
            throw new RuntimeException("Solo se pueden aceptar tickets en estado PENDIENTE");
        }
        
        // Cambiar estado a EN_PROCESO
        String estadoAnterior = ticket.getEstado();
        ticket.setEstado("EN_PROCESO");
        ticket.setFechaActualizacion(LocalDateTime.now());
        ticketRepository.save(ticket);
        
        // Crear registro en historial
        HistorialEstadoTicket historial = new HistorialEstadoTicket();
        historial.setTicket(ticket);
        historial.setEstadoAnterior(estadoAnterior);
        historial.setEstadoNuevo("EN_PROCESO");
        historial.setComentario("Ticket aceptado por el técnico");
        historial.setFechaCambio(LocalDateTime.now());
        historial.setCambiadoPor(tecnico);
        historial.setTipoUsuario("TECNICO");
        historialRepository.save(historial);
        
        log.info("Ticket {} aceptado exitosamente por técnico {}", ticketId, emailTecnico);
        
        // Enviar notificación de ticket en proceso
        try {
            notificacionAutomaticaService.notificarTicketEnProceso(ticket, tecnico);
        } catch (Exception e) {
            log.error("Error enviando notificación de ticket en proceso", e);
        }
        
        return convertirTicketAResponseDTO(ticket);
    }
    
    /**
     * Finalizar un ticket (EN_PROCESO -> COMPLETADO)
     */
    @Transactional
    public TicketTecnicoResponseDTO finalizarTicket(Long ticketId, String emailTecnico, String descripcion, MultipartFile archivoAdjunto) {
        log.info("Finalizando ticket {} para técnico: {}", ticketId, emailTecnico);
        
        Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // Verificar que el ticket esté asignado al técnico
        if (!ticket.getTecnicoAsignado().getIdUsuario().equals(tecnico.getIdUsuario())) {
            throw new RuntimeException("El ticket no está asignado a este técnico");
        }
        
        // Verificar que el ticket esté en estado EN_PROCESO
        if (!"EN_PROCESO".equals(ticket.getEstado())) {
            throw new RuntimeException("Solo se pueden finalizar tickets en estado EN_PROCESO");
        }
        
        // Cambiar estado a COMPLETADO
        String estadoAnterior = ticket.getEstado();
        ticket.setEstado("COMPLETADO");
        ticket.setFechaActualizacion(LocalDateTime.now());
        if (descripcion != null && !descripcion.trim().isEmpty()) {
            ticket.setDescripcion(ticket.getDescripcion() + "\n\nFinalización: " + descripcion);
        }
        
        // Manejar archivo adjunto si se proporciona
        if (archivoAdjunto != null && !archivoAdjunto.isEmpty()) {
            log.info("Guardando archivo adjunto: {}", archivoAdjunto.getOriginalFilename());
            try {
                // Validar tamaño del archivo (máximo 10MB)
                if (archivoAdjunto.getSize() > 10 * 1024 * 1024) {
                    throw new RuntimeException("El archivo no puede ser mayor a 10MB");
                }
                
                // Validar tipo de archivo
                String contentType = archivoAdjunto.getContentType();
                if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("application/pdf") && !contentType.startsWith("video/") && !contentType.startsWith("audio/"))) {
                    throw new RuntimeException("Solo se permiten archivos de imagen, PDF, video o audio");
                }
                
                // Guardar el nombre del archivo en el ticket
                String nombreArchivo = archivoAdjunto.getOriginalFilename();
                ticket.setArchivoAdjunto(nombreArchivo);
                
                log.info("Archivo adjunto guardado: {}", nombreArchivo);
            } catch (Exception e) {
                log.error("Error guardando archivo adjunto", e);
                throw new RuntimeException("Error al guardar el archivo adjunto: " + e.getMessage());
            }
        }
        
        ticketRepository.save(ticket);
        
        // Crear registro en historial
        HistorialEstadoTicket historial = new HistorialEstadoTicket();
        historial.setTicket(ticket);
        historial.setEstadoAnterior(estadoAnterior);
        historial.setEstadoNuevo("COMPLETADO");
        historial.setComentario("Ticket finalizado por el técnico");
        historial.setObservaciones(descripcion);
        historial.setFechaCambio(LocalDateTime.now());
        historial.setCambiadoPor(tecnico);
        historial.setTipoUsuario("TECNICO");
        historialRepository.save(historial);
        
        log.info("Ticket {} finalizado exitosamente por técnico {}", ticketId, emailTecnico);
        
        // Enviar notificación de ticket finalizado
        try {
            notificacionAutomaticaService.notificarTicketFinalizado(ticket, tecnico);
        } catch (Exception e) {
            log.error("Error enviando notificación de ticket finalizado", e);
        }
        
        return convertirTicketAResponseDTO(ticket);
    }
    
    // ========== MÉTODOS AUXILIARES ==========
    
    private TicketTecnicoResponseDTO convertirTicketAResponseDTO(Ticket ticket) {
        // Obtener evidencias
        List<Evidencia> evidencias = evidenciaRepository.findActivasByTicket(ticket);
        List<EvidenciaResponseDTO> evidenciasDTO = evidencias.stream()
            .map(this::convertirEvidenciaAResponseDTO)
            .collect(Collectors.toList());
        
        // Obtener historial de estados
        List<HistorialEstadoTicket> historial = historialRepository.findByTicketOrderByFechaCambioDesc(ticket);
        List<HistorialEstadoResponseDTO> historialDTO = historial.stream()
            .map(this::convertirHistorialAResponseDTO)
            .collect(Collectors.toList());
        
        TicketTecnicoResponseDTO response = new TicketTecnicoResponseDTO();
        response.setId(ticket.getId());
        response.setTitulo(ticket.getAsunto() != null ? ticket.getAsunto() : "Ticket");
        response.setDescripcion(ticket.getDescripcion());
        response.setEstado(ticket.getEstado());
        response.setPrioridad(ticket.getPrioridad());
        response.setUbicacion(ticket.getUbicacion());
        response.setConsulta(ticket.getConsulta());
        response.setCategoria(ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : ticket.getCategoriaString());
        response.setCreadorNombre(ticket.getCreador().getNombreCompleto());
        response.setCreadorEmail(ticket.getCreador().getEmail());
        response.setFechaCreacion(ticket.getFechaCreacion());
        response.setFechaActualizacion(ticket.getFechaActualizacion());
        response.setArchivoAdjunto(ticket.getArchivoAdjunto());
        response.setNombreArchivo(ticket.getNombreArchivo());
        response.setTecnicoId(ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getIdUsuario() : null);
        response.setTecnicoNombre(ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getNombreCompleto() : null);
        response.setTecnicoEmail(ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getEmail() : null);
        response.setEvidencias(evidenciasDTO);
        response.setHistorialEstados(historialDTO);
        
        // Obtener comentarios del ticket
        List<ComentarioResponseDTO> comentariosDTO = comentarioService.obtenerComentariosPorTicket(ticket.getId());
        response.setComentarios(comentariosDTO);
        
        return response;
    }
    
    private EvidenciaResponseDTO convertirEvidenciaAResponseDTO(Evidencia evidencia) {
        return EvidenciaResponseDTO.builder()
            .idEvidencia(evidencia.getIdEvidencia())
            .ticketId(evidencia.getTicket().getId())
            .tipoEvidencia(evidencia.getTipoEvidencia())
            .descripcion(evidencia.getDescripcion())
            .nombreArchivo(evidencia.getNombreArchivo())
            .extensionArchivo(evidencia.getExtensionArchivo())
            .tamanioArchivo(evidencia.getTamanioArchivo())
            .urlArchivo(evidencia.getUrlArchivo())
            .fechaSubida(evidencia.getFechaSubida())
            .subidoPor(evidencia.getSubidoPor().getNombreCompleto())
            .subidoPorEmail(evidencia.getSubidoPor().getEmail())
            .build();
    }
    
    private HistorialEstadoResponseDTO convertirHistorialAResponseDTO(HistorialEstadoTicket historial) {
        return HistorialEstadoResponseDTO.builder()
            .idHistorial(historial.getIdHistorial())
            .ticketId(historial.getTicket().getId())
            .estadoAnterior(historial.getEstadoAnterior())
            .estadoNuevo(historial.getEstadoNuevo())
            .comentario(historial.getComentario())
            .observaciones(historial.getObservaciones())
            .fechaCambio(historial.getFechaCambio())
            .cambiadoPor(historial.getCambiadoPor().getNombreCompleto())
            .cambiadoPorEmail(historial.getCambiadoPor().getEmail())
            .tipoUsuario(historial.getTipoUsuario())
            .build();
    }
    
    private boolean esTransicionValida(String estadoAnterior, String estadoNuevo) {
        // Definir transiciones válidas
        switch (estadoAnterior) {
            case "PENDIENTE":
                return "EN_EJECUCION".equals(estadoNuevo);
            case "ASIGNADO":
                return "EN_EJECUCION".equals(estadoNuevo);
            case "EN_EJECUCION":
                return "TERMINADO".equals(estadoNuevo) || "PENDIENTE".equals(estadoNuevo);
            case "TERMINADO":
                return "EN_EJECUCION".equals(estadoNuevo); // Permitir reabrir
            default:
                return false;
        }
    }
    
    private String generarRutaArchivo(Long ticketId, String nombreArchivo) {
        return "/uploads/evidencias/ticket_" + ticketId + "/" + nombreArchivo;
    }
    
    /**
     * Calcular total de evidencias del técnico
     */
    private long calcularTotalEvidencias(Usuario tecnico) {
        try {
            // Obtener todos los tickets del técnico
            List<Ticket> tickets = ticketRepository.findByTecnicoAsignado(tecnico);
            long totalEvidencias = 0;
            
            for (Ticket ticket : tickets) {
                // Contar evidencias de la tabla evidencias
                long evidenciasTabla = evidenciaRepository.findActivasByTicket(ticket).size();
                totalEvidencias += evidenciasTabla;
                
                // Contar archivo adjunto si existe
                if (ticket.getArchivoAdjunto() != null && !ticket.getArchivoAdjunto().trim().isEmpty()) {
                    totalEvidencias += 1;
                }
            }
            
            log.info("Total evidencias calculadas para técnico {}: {}", tecnico.getEmail(), totalEvidencias);
            return totalEvidencias;
        } catch (Exception e) {
            log.error("Error calculando total de evidencias", e);
            return 0;
        }
    }
    
    /**
     * Calcular total de notificaciones no leídas del técnico
     */
    private long calcularTotalNotificaciones(Usuario tecnico) {
        try {
            // Usar el servicio de notificaciones para obtener el contador
            return notificacionServiceSimple.contarNotificacionesNoLeidas(tecnico.getIdUsuario());
        } catch (Exception e) {
            log.error("Error calculando total de notificaciones", e);
            return 0;
        }
    }
}
