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
import com.example.demo.asignacion.model.AsignacionTicket;
import com.example.demo.asignacion.repository.AsignacionTicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
    private final AsignacionTicketRepository asignacionTicketRepository;
    private final NotificacionAutomaticaService notificacionAutomaticaService;
    private final NotificacionServiceSimple notificacionServiceSimple;
    private final ComentarioService comentarioService;
    
    /**
     * Obtener tickets asignados a un técnico
     */
    @Transactional(readOnly = true)
    public List<TicketTecnicoResponseDTO> obtenerTicketsAsignados(String emailTecnico) {
        log.info("🔍 [TECNICO] Obteniendo tickets asignados para técnico: {}", emailTecnico);
        
        Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        log.info("🔍 [TECNICO] Técnico encontrado: {} (ID: {})", tecnico.getEmail(), tecnico.getId());
        
        List<Ticket> tickets = ticketRepository.findByAssignedTechnicianOrderByCreatedAtDesc(tecnico);
        
        log.info("🔍 [TECNICO] Tickets encontrados: {} tickets asignados a {}", tickets.size(), emailTecnico);
        
        // Log de cada ticket encontrado
        for (Ticket ticket : tickets) {
            log.info("🔍 [TECNICO] Ticket {} - Estado: {}, Técnico: {}", 
                ticket.getId(), 
                ticket.getStatus(), 
                ticket.getAssignedTechnicianEmail());
        }
        
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
        
        // Verificar que el ticket esté actualmente asignado al técnico
        boolean tieneAcceso = false;
        
        // Verificar asignación directa en la tabla tickets
        if (ticket.getAssignedTechnician() != null && ticket.getAssignedTechnician().getId().equals(tecnico.getId())) {
            log.info("Técnico {} tiene acceso directo al ticket {} (asignado en tabla tickets)", 
                tecnico.getId(), ticketId);
            tieneAcceso = true;
        }
        
        // Verificar asignación activa en tabla asignaciones_tickets
        Optional<AsignacionTicket> asignacionActiva = asignacionTicketRepository.findByTicketIdAndActivaTrue(ticketId);
        if (asignacionActiva.isPresent() && asignacionActiva.get().getTecnicoId().equals(tecnico.getId())) {
            log.info("Técnico {} tiene acceso al ticket {} (asignación activa)", 
                tecnico.getId(), ticketId);
            tieneAcceso = true;
        }
        
        if (!tieneAcceso) {
            log.warn("Técnico {} intentó acceder al ticket {} pero no tiene asignación activa", 
                tecnico.getId(), ticketId);
            throw new RuntimeException("Este ticket no está asignado actualmente o ha sido completado.");
        }
        
        // Verificar si el ticket está asignado a otro técnico (solo si hay asignación activa)
        if (asignacionActiva.isPresent() && !asignacionActiva.get().getTecnicoId().equals(tecnico.getId())) {
            // El ticket está asignado a otro técnico
            log.warn("Técnico {} no tiene acceso al ticket {}. Asignado actualmente al técnico {}", 
                tecnico.getId(), ticketId, asignacionActiva.get().getTecnicoId());
            
            // Verificar si fue escalado o reasignado
            String tipoOperacion = asignacionActiva.get().getTipoOperacion();
            String mensaje = "Este ticket fue ";
            
            if ("ESCALAMIENTO".equals(tipoOperacion)) {
                mensaje += "escalado a otro técnico especializado. Ya no tienes acceso a él.";
            } else if ("REASIGNAR".equals(tipoOperacion)) {
                mensaje += "reasignado a otro técnico. Ya no tienes acceso a él.";
            } else {
                mensaje += "asignado a otro técnico. Solo el técnico actualmente asignado puede verlo.";
            }
            
            throw new RuntimeException(mensaje);
        }
        
        return convertirTicketAResponseDTO(ticket);
    }
    
    /**
     * Cambiar estado de un ticket
     */
    public TicketTecnicoResponseDTO cambiarEstadoTicket(CambiarEstadoTicketRequestDTO request, String emailTecnico) {
        log.info("🔄 [CAMBIO ESTADO] ===== INICIANDO CAMBIO DE ESTADO =====");
        log.info("🔄 [CAMBIO ESTADO] Ticket ID: {}", request.getTicketId());
        log.info("🔄 [CAMBIO ESTADO] Nuevo estado solicitado: {}", request.getNuevoEstado());
        log.info("🔄 [CAMBIO ESTADO] Técnico email: {}", emailTecnico);
        log.info("🔄 [CAMBIO ESTADO] Comentario: {}", request.getComentario());
        
        // 1. Buscar ticket
        log.info("🔍 [CAMBIO ESTADO] Paso 1: Buscando ticket...");
        Ticket ticket = ticketRepository.findById(request.getTicketId())
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        log.info("✅ [CAMBIO ESTADO] Ticket encontrado - Estado actual: {}", ticket.getStatus());
        
        // 2. Buscar técnico
        log.info("🔍 [CAMBIO ESTADO] Paso 2: Buscando técnico...");
        Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        log.info("✅ [CAMBIO ESTADO] Técnico encontrado - ID: {}, Nombre: {}", tecnico.getId(), tecnico.getFullName());
        
        // 3. Verificar que el ticket esté actualmente asignado al técnico mediante asignación activa
        log.info("🔍 [CAMBIO ESTADO] Paso 3: Verificando asignación activa...");
        Optional<AsignacionTicket> asignacionActiva = asignacionTicketRepository.findByTicketIdAndActivaTrue(request.getTicketId());
        
        if (asignacionActiva.isEmpty()) {
            log.error("❌ [CAMBIO ESTADO] No hay asignación activa para el ticket {}", request.getTicketId());
            throw new RuntimeException("Este ticket no está asignado actualmente o ha sido completado.");
        }
        
        log.info("✅ [CAMBIO ESTADO] Asignación activa encontrada - Técnico asignado ID: {}", asignacionActiva.get().getTecnicoId());
        
        if (!asignacionActiva.get().getTecnicoId().equals(tecnico.getId())) {
            log.error("❌ [CAMBIO ESTADO] El técnico {} no coincide con el asignado {}", 
                tecnico.getId(), asignacionActiva.get().getTecnicoId());
            
            String tipoOperacion = asignacionActiva.get().getTipoOperacion();
            String mensaje = "Este ticket fue ";
            
            if ("ESCALAMIENTO".equals(tipoOperacion)) {
                mensaje += "escalado a otro técnico especializado. Ya no puedes modificarlo.";
            } else if ("REASIGNAR".equals(tipoOperacion)) {
                mensaje += "reasignado a otro técnico. Ya no puedes modificarlo.";
            } else {
                mensaje += "asignado a otro técnico. Solo el técnico actualmente asignado puede cambiar su estado.";
            }
            
            throw new RuntimeException(mensaje);
        }
        
        log.info("✅ [CAMBIO ESTADO] Verificación de permisos exitosa");
        
        // 4. Validar transición de estado
        String estadoAnterior = ticket.getStatus();
        String estadoNuevo = request.getNuevoEstado();
        
        log.info("🔍 [CAMBIO ESTADO] Paso 4: Validando transición de estado...");
        log.info("🔍 [CAMBIO ESTADO] Estado anterior: {}", estadoAnterior);
        log.info("🔍 [CAMBIO ESTADO] Estado nuevo: {}", estadoNuevo);
        
        boolean transicionValida = esTransicionValida(estadoAnterior, estadoNuevo);
        log.info("🔍 [CAMBIO ESTADO] Transición válida: {}", transicionValida);
        
        if (!transicionValida) {
            log.error("❌ [CAMBIO ESTADO] Transición no válida: {} → {}", estadoAnterior, estadoNuevo);
            throw new RuntimeException("Transición de estado no válida: " + estadoAnterior + " → " + estadoNuevo);
        }
        
        log.info("✅ [CAMBIO ESTADO] Transición de estado validada correctamente");
        
        // 5. Actualizar estado
        log.info("🔄 [CAMBIO ESTADO] Paso 5: Actualizando estado en la base de datos...");
        ticket.setStatus(estadoNuevo);
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
        log.info("✅ [CAMBIO ESTADO] Estado actualizado en BD - Nuevo estado: {}", ticket.getStatus());
        
        // 6. Crear historial
        log.info("🔄 [CAMBIO ESTADO] Paso 6: Creando entrada en el historial...");
        HistorialEstadoTicket historial = HistorialEstadoTicket.builder()
            .ticket(ticket)
            .cambiadoPor(tecnico)
            .estadoAnterior(estadoAnterior)
            .estadoNuevo(estadoNuevo)
            .comentario(request.getComentario())
            .observaciones(request.getObservaciones())
            .tipoUsuario("TECNICO")
            .build();
        
        HistorialEstadoTicket historialGuardado = historialRepository.save(historial);
        log.info("✅ [CAMBIO ESTADO] Historial guardado exitosamente");
        
        // 7. Enviar notificaciones (esto se hace automáticamente por los listeners)
        log.info("🔔 [CAMBIO ESTADO] Paso 7: Las notificaciones se enviarán automáticamente");
        log.info("🔔 [CAMBIO ESTADO] Notificando cambio de estado a:");
        log.info("   - Cliente del ticket");
        log.info("   - Administradores");
        log.info("   - Técnico asignado");
        
        log.info("✅ [CAMBIO ESTADO] ===== CAMBIO DE ESTADO COMPLETADO =====");
        log.info("✅ [CAMBIO ESTADO] Ticket {} - Estado actualizado: {} → {}", 
            ticket.getId(), estadoAnterior, estadoNuevo);
        
        TicketTecnicoResponseDTO response = convertirTicketAResponseDTO(ticket);
        log.info("✅ [CAMBIO ESTADO] Response DTO creado - Estado confirmado: {}", response.getEstado());
        
        return response;
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
        
        // 3. Verificar que el ticket esté actualmente asignado al técnico mediante asignación activa
        Optional<AsignacionTicket> asignacionActiva = asignacionTicketRepository.findByTicketIdAndActivaTrue(request.getTicketId());
        
        if (asignacionActiva.isEmpty()) {
            log.warn("Técnico {} intentó subir evidencia al ticket {} pero no hay asignación activa", 
                tecnico.getId(), request.getTicketId());
            throw new RuntimeException("Este ticket no está asignado actualmente o ha sido completado.");
        }
        
        if (!asignacionActiva.get().getTecnicoId().equals(tecnico.getId())) {
            log.warn("Técnico {} no tiene acceso para subir evidencias al ticket {}", 
                tecnico.getId(), request.getTicketId());
            
            String tipoOperacion = asignacionActiva.get().getTipoOperacion();
            String mensaje = "Este ticket fue ";
            
            if ("ESCALAMIENTO".equals(tipoOperacion)) {
                mensaje += "escalado a otro técnico especializado. Ya no puedes agregar evidencias.";
            } else if ("REASIGNAR".equals(tipoOperacion)) {
                mensaje += "reasignado a otro técnico. Ya no puedes agregar evidencias.";
            } else {
                mensaje += "asignado a otro técnico. Solo el técnico actualmente asignado puede subir evidencias.";
            }
            
            throw new RuntimeException(mensaje);
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
            .subidoPor(tecnico.getFullName())
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
        List<Ticket> tickets = ticketRepository.findByAssignedTechnician(tecnico);
        
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
        
        long totalTickets = ticketRepository.countByAssignedTechnician(tecnico);
        long ticketsPendientes = ticketRepository.findByAssignedTechnician(tecnico).stream()
            .filter(t -> "PENDIENTE".equals(t.getStatus()))
            .count();
        long ticketsEnEjecucion = ticketRepository.findByAssignedTechnician(tecnico).stream()
            .filter(t -> "EN_PROCESO".equals(t.getStatus()))
            .count();
        long ticketsTerminados = ticketRepository.findByAssignedTechnician(tecnico).stream()
            .filter(t -> "COMPLETADO".equals(t.getStatus()))
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
        estadisticas.setTecnicoNombre(tecnico.getFullName());
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
        if (!ticket.getAssignedTechnician().getId().equals(tecnico.getId())) {
            throw new RuntimeException("El ticket no está asignado a este técnico");
        }
        
        // Verificar que el ticket esté en estado PENDIENTE
        if (!"PENDIENTE".equals(ticket.getStatus())) {
            throw new RuntimeException("Solo se pueden aceptar tickets en estado PENDIENTE");
        }
        
        // Cambiar estado a EN_PROCESO
        String estadoAnterior = ticket.getStatus();
        ticket.setStatus("EN_PROCESO");
        ticket.setUpdatedAt(LocalDateTime.now());
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
        if (!ticket.getAssignedTechnician().getId().equals(tecnico.getId())) {
            throw new RuntimeException("El ticket no está asignado a este técnico");
        }
        
        // Verificar que el ticket esté en estado EN_PROCESO
        if (!"EN_PROCESO".equals(ticket.getStatus())) {
            throw new RuntimeException("Solo se pueden finalizar tickets en estado EN_PROCESO");
        }
        
        // Cambiar estado a COMPLETADO
        String estadoAnterior = ticket.getStatus();
        ticket.setStatus("COMPLETADO");
        ticket.setUpdatedAt(LocalDateTime.now());
        if (descripcion != null && !descripcion.trim().isEmpty()) {
            ticket.setDescription(ticket.getDescription() + "\n\nFinalización: " + descripcion);
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
                ticket.setAttachedFile(nombreArchivo);
                
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
        response.setTitulo(ticket.getSubject() != null ? ticket.getSubject() : "Ticket");
        response.setDescripcion(ticket.getDescription());
        response.setEstado(ticket.getStatus());
        response.setPrioridad(ticket.getPriority());
        response.setUbicacion(ticket.getLocation());
        response.setConsulta(ticket.getQuery());
        response.setCategoria(ticket.getCategory() != null ? ticket.getCategory().getName() : ticket.getCategoryString());
        response.setCreadorNombre(ticket.getCreator().getFullName());
        response.setCreadorEmail(ticket.getCreator().getEmail());
        response.setFechaCreacion(ticket.getCreatedAt());
        response.setFechaActualizacion(ticket.getUpdatedAt());
        response.setArchivoAdjunto(ticket.getAttachedFile());
        response.setNombreArchivo(ticket.getFileName());
        response.setTecnicoId(ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getId() : null);
        response.setTecnicoNombre(ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getFullName() : null);
        response.setTecnicoEmail(ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getEmail() : null);
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
            .subidoPor(evidencia.getSubidoPor().getFullName())
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
            .cambiadoPor(historial.getCambiadoPor().getFullName())
            .cambiadoPorEmail(historial.getCambiadoPor().getEmail())
            .tipoUsuario(historial.getTipoUsuario())
            .build();
    }
    
    private boolean esTransicionValida(String estadoAnterior, String estadoNuevo) {
        // Definir transiciones válidas
        switch (estadoAnterior) {
            case "PENDIENTE":
                return "EN_PROCESO".equals(estadoNuevo) || "EN_EJECUCION".equals(estadoNuevo);
            case "ASIGNADO":
                return "EN_PROCESO".equals(estadoNuevo) || "EN_EJECUCION".equals(estadoNuevo);
            case "EN_PROCESO":
            case "EN_EJECUCION":
                return "RESUELTO".equals(estadoNuevo) || "TERMINADO".equals(estadoNuevo) || "PENDIENTE".equals(estadoNuevo);
            case "ESCALADO":
                return "EN_PROCESO".equals(estadoNuevo) || "EN_EJECUCION".equals(estadoNuevo) || "RESUELTO".equals(estadoNuevo) || "TERMINADO".equals(estadoNuevo);
            case "RESUELTO":
            case "TERMINADO":
                return "EN_PROCESO".equals(estadoNuevo) || "EN_EJECUCION".equals(estadoNuevo) || "CERRADO".equals(estadoNuevo); // Permitir reabrir o cerrar
            case "CERRADO":
                return false; // No permitir cambios desde cerrado
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
            List<Ticket> tickets = ticketRepository.findByAssignedTechnician(tecnico);
            long totalEvidencias = 0;
            
            for (Ticket ticket : tickets) {
                // Contar evidencias de la tabla evidencias
                long evidenciasTabla = evidenciaRepository.findActivasByTicket(ticket).size();
                totalEvidencias += evidenciasTabla;
                
                // Contar archivo adjunto si existe
                if (ticket.getAttachedFile() != null && !ticket.getAttachedFile().trim().isEmpty()) {
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
            return notificacionServiceSimple.contarNotificacionesNoLeidas(tecnico.getId());
        } catch (Exception e) {
            log.error("Error calculando total de notificaciones", e);
            return 0;
        }
    }
}
