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
import com.example.demo.notificacion.service.NotificationRoleService;
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
import java.util.ArrayList;
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
    private final NotificationRoleService notificationRoleService;
    
    /**
     * Obtener tickets asignados a un técnico
     * Usa la tabla de asignaciones para manejar correctamente el escalamiento
     */
    @Transactional(readOnly = true)
    public List<TicketTecnicoResponseDTO> obtenerTicketsAsignados(String emailTecnico) {
        log.info("🔍 [TECNICO] Obteniendo tickets asignados para técnico: {}", emailTecnico);
        
        Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        log.info("🔍 [TECNICO] Técnico encontrado: {} (ID: {})", tecnico.getEmail(), tecnico.getId());
        
        // Buscar asignaciones activas del técnico
        List<AsignacionTicket> asignacionesActivas = asignacionTicketRepository.findByTecnicoIdAndActivaTrue(tecnico.getId());
        
        log.info("🔍 [TECNICO] Asignaciones activas encontradas: {} para técnico {}", asignacionesActivas.size(), emailTecnico);
        
        List<Ticket> tickets = new ArrayList<>();
        
        // Obtener los tickets de las asignaciones activas
        for (AsignacionTicket asignacion : asignacionesActivas) {
            Optional<Ticket> ticketOpt = ticketRepository.findById(asignacion.getTicketId());
            if (ticketOpt.isPresent()) {
                Ticket ticket = ticketOpt.get();
                tickets.add(ticket);
                log.info("🔍 [TECNICO] Ticket {} - Estado: {}, Técnico asignado: {}, Tipo operación: {}", 
                    ticket.getId(), 
                    ticket.getStatus(), 
                    ticket.getAssignedTechnicianEmail(),
                    asignacion.getTipoOperacion());
            }
        }
        
        // Ordenar por fecha de creación descendente
        tickets.sort((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()));
        
        log.info("🔍 [TECNICO] Tickets finales encontrados: {} tickets asignados a {}", tickets.size(), emailTecnico);
        
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
        
        historialRepository.save(historial);
        log.info("✅ [CAMBIO ESTADO] Historial guardado exitosamente");
        
        // 7. Enviar notificaciones
        log.info("🔔 [CAMBIO ESTADO] Paso 7: Enviando notificaciones...");
        
        // Notificar según el tipo de cambio de estado
        if ("EN_PROCESO".equals(estadoNuevo)) {
            notificationRoleService.notificarTicketEnProceso(ticket.getId(), tecnico.getId());
        } else if ("RESUELTO".equals(estadoNuevo)) {
            notificationRoleService.notificarResolucionTicket(ticket.getId(), tecnico.getId());
        } else if ("CERRADO".equals(estadoNuevo)) {
            notificationRoleService.notificarCierreTicket(ticket.getId(), tecnico.getId());
        }
        
        log.info("🔔 [CAMBIO ESTADO] Notificaciones enviadas para cambio: {} → {}", estadoAnterior, estadoNuevo);
        
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
     * Incluye todos los tickets que ha manejado el técnico (activos y terminados)
     */
    @Transactional(readOnly = true)
    public List<TicketTecnicoResponseDTO> obtenerHistorialTickets(String emailTecnico) {
        log.info("Obteniendo historial de tickets para técnico: {}", emailTecnico);
        
        Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        // Buscar todas las asignaciones del técnico (activas e inactivas)
        List<AsignacionTicket> asignaciones = asignacionTicketRepository.findByTecnicoIdOrderByFechaAsignacionDesc(tecnico.getId());
        
        log.info("🔍 [HISTORIAL] Asignaciones encontradas: {} para técnico {}", asignaciones.size(), emailTecnico);
        
        List<Ticket> tickets = new ArrayList<>();
        
        // Obtener los tickets de todas las asignaciones
        for (AsignacionTicket asignacion : asignaciones) {
            log.info("🔍 [HISTORIAL] Procesando asignación ID: {}, Ticket ID: {}, Activa: {}", 
                asignacion.getId(), asignacion.getTicketId(), asignacion.getActiva());
            
            Optional<Ticket> ticketOpt = ticketRepository.findById(asignacion.getTicketId());
            if (ticketOpt.isPresent()) {
                Ticket ticket = ticketOpt.get();
                tickets.add(ticket);
                log.info("🔍 [HISTORIAL] Ticket {} - Estado: {}, Activa: {}, Tipo: {}", 
                    ticket.getId(), 
                    ticket.getStatus(), 
                    asignacion.getActiva(),
                    asignacion.getTipoOperacion());
            } else {
                log.warn("⚠️ [HISTORIAL] Ticket {} no encontrado para asignación ID: {}", 
                    asignacion.getTicketId(), asignacion.getId());
            }
        }
        
        // Ordenar por fecha de creación descendente
        tickets.sort((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()));
        
        log.info("🔍 [HISTORIAL] Tickets finales encontrados: {} tickets para {}", tickets.size(), emailTecnico);
        
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
        
        try {
            Usuario tecnico = usuarioRepository.findByEmail(emailTecnico)
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
            
            // Obtener todos los tickets del técnico de una vez para optimizar consultas
            List<Ticket> tickets = ticketRepository.findByAssignedTechnician(tecnico);
            
            long totalTickets = tickets.size();
            long ticketsPendientes = tickets.stream()
                .filter(t -> "PENDIENTE".equals(t.getStatus()))
                .count();
            long ticketsEnEjecucion = tickets.stream()
                .filter(t -> "EN_PROCESO".equals(t.getStatus()) || "EN_EJECUCION".equals(t.getStatus()))
                .count();
            long ticketsTerminados = tickets.stream()
                .filter(t -> "COMPLETADO".equals(t.getStatus()) || "TERMINADO".equals(t.getStatus()) || "RESUELTO".equals(t.getStatus()))
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
            
            log.info("Estadísticas calculadas para técnico {}: {} tickets totales, {} pendientes, {} en ejecución, {} terminados", 
                emailTecnico, totalTickets, ticketsPendientes, ticketsEnEjecucion, ticketsTerminados);
            
            return estadisticas;
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas para técnico {}: {}", emailTecnico, e.getMessage(), e);
            throw new RuntimeException("Error obteniendo estadísticas del técnico: " + e.getMessage());
        }
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
        
        // Verificar que el ticket esté actualmente asignado al técnico mediante asignación activa
        Optional<AsignacionTicket> asignacionActiva = asignacionTicketRepository.findByTicketIdAndActivaTrue(ticketId);
        
        if (asignacionActiva.isEmpty()) {
            log.error("❌ [ACEPTAR TICKET] No hay asignación activa para el ticket {}", ticketId);
            throw new RuntimeException("Este ticket no está asignado actualmente o ha sido completado.");
        }
        
        if (!asignacionActiva.get().getTecnicoId().equals(tecnico.getId())) {
            log.error("❌ [ACEPTAR TICKET] El técnico {} no coincide con el asignado {}", 
                tecnico.getId(), asignacionActiva.get().getTecnicoId());
            throw new RuntimeException("Este ticket no está asignado a este técnico");
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
        
        // Verificar que el ticket esté actualmente asignado al técnico mediante asignación activa
        Optional<AsignacionTicket> asignacionActiva = asignacionTicketRepository.findByTicketIdAndActivaTrue(ticketId);
        
        if (asignacionActiva.isEmpty()) {
            log.error("❌ [FINALIZAR TICKET] No hay asignación activa para el ticket {}", ticketId);
            throw new RuntimeException("Este ticket no está asignado actualmente o ha sido completado.");
        }
        
        if (!asignacionActiva.get().getTecnicoId().equals(tecnico.getId())) {
            log.error("❌ [FINALIZAR TICKET] El técnico {} no coincide con el asignado {}", 
                tecnico.getId(), asignacionActiva.get().getTecnicoId());
            throw new RuntimeException("Este ticket no está asignado a este técnico");
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
        try {
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
            
            // Determinar el rol del técnico y permisos
            determinarRolTecnico(response, ticket);
            
            return response;
        } catch (Exception e) {
            log.error("Error convirtiendo ticket {} a DTO: {}", ticket.getId(), e.getMessage(), e);
            // Retornar un DTO básico en caso de error
            TicketTecnicoResponseDTO response = new TicketTecnicoResponseDTO();
            response.setId(ticket.getId());
            response.setTitulo(ticket.getSubject() != null ? ticket.getSubject() : "Ticket");
            response.setDescripcion(ticket.getDescription());
            response.setEstado(ticket.getStatus());
            response.setPrioridad(ticket.getPriority());
            response.setFechaCreacion(ticket.getCreatedAt());
            response.setFechaActualizacion(ticket.getUpdatedAt());
            response.setEvidencias(List.of());
            response.setHistorialEstados(List.of());
            response.setComentarios(List.of());
            return response;
        }
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
                return "RESUELTO".equals(estadoNuevo) || "TERMINADO".equals(estadoNuevo) || 
                       "COMPLETADO".equals(estadoNuevo) || "PENDIENTE".equals(estadoNuevo);
            case "ESCALADO":
                return "EN_PROCESO".equals(estadoNuevo) || "EN_EJECUCION".equals(estadoNuevo) || 
                       "RESUELTO".equals(estadoNuevo) || "TERMINADO".equals(estadoNuevo) || 
                       "COMPLETADO".equals(estadoNuevo);
            case "RESUELTO":
            case "TERMINADO":
            case "COMPLETADO":
                return "EN_PROCESO".equals(estadoNuevo) || "EN_EJECUCION".equals(estadoNuevo) || 
                       "CERRADO".equals(estadoNuevo); // Permitir reabrir o cerrar
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
    
    /**
     * Determina el rol del técnico en un ticket y sus permisos
     */
    private void determinarRolTecnico(TicketTecnicoResponseDTO response, Ticket ticket) {
        try {
            // Obtener asignaciones del ticket
            List<AsignacionTicket> asignaciones = asignacionTicketRepository.findByTicketIdOrderByFechaAsignacionDesc(ticket.getId());
            
            if (asignaciones.isEmpty()) {
                log.warn("No hay asignaciones para el ticket {}", ticket.getId());
                response.setRolTecnico("SIN_ASIGNAR");
                response.setPuedeCambiarEstado(false);
                response.setEsTecnicoEscalado(false);
                return;
            }
            
            // Obtener la asignación activa (la más reciente)
            AsignacionTicket asignacionActiva = asignaciones.stream()
                .filter(AsignacionTicket::getActiva)
                .findFirst()
                .orElse(null);
            
            // Obtener la asignación original (la primera)
            AsignacionTicket asignacionOriginal = asignaciones.get(asignaciones.size() - 1);
            
            if (asignacionActiva == null) {
                log.warn("No hay asignación activa para el ticket {}", ticket.getId());
                response.setRolTecnico("SIN_ASIGNAR");
                response.setPuedeCambiarEstado(false);
                response.setEsTecnicoEscalado(false);
                return;
            }
            
            // Determinar si es técnico escalado o asignado
            boolean esEscalado = !asignacionActiva.getId().equals(asignacionOriginal.getId());
            
            if (esEscalado) {
                response.setRolTecnico("ESCALADO");
                response.setEsTecnicoEscalado(true);
                response.setPuedeCambiarEstado(true); // El técnico escalado puede cambiar estado
                log.info("Ticket {} - Técnico escalado (ID: {})", ticket.getId(), asignacionActiva.getTecnicoId());
            } else {
                response.setRolTecnico("ASIGNADO");
                response.setEsTecnicoEscalado(false);
                response.setPuedeCambiarEstado(true); // El técnico asignado puede cambiar estado
                log.info("Ticket {} - Técnico asignado (ID: {})", ticket.getId(), asignacionActiva.getTecnicoId());
            }
            
        } catch (Exception e) {
            log.error("Error determinando rol del técnico para ticket {}: {}", ticket.getId(), e.getMessage());
            response.setRolTecnico("SIN_ASIGNAR");
            response.setPuedeCambiarEstado(false);
            response.setEsTecnicoEscalado(false);
        }
    }
}

