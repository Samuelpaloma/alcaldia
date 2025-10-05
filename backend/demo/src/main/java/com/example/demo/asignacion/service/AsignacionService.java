package com.example.demo.asignacion.service;

import com.example.demo.asignacion.dto.request.AsignarTicketRequestDTO;
import com.example.demo.asignacion.dto.response.AsignacionResponseDTO;
import com.example.demo.asignacion.model.AsignacionTicket;
import com.example.demo.asignacion.model.HistorialAsignacion;
import com.example.demo.asignacion.repository.AsignacionTicketRepository;
import com.example.demo.asignacion.repository.HistorialAsignacionRepository;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.model.HistorialEstadoTicket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.ticket.repository.HistorialEstadoTicketRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.example.demo.notificacion.service.NotificationRoleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@Slf4j
public class AsignacionService {
    
    @Autowired
    private AsignacionTicketRepository asignacionTicketRepository;
    
    @Autowired
    private HistorialAsignacionRepository historialAsignacionRepository;
    
    @Autowired
    private HistorialEstadoTicketRepository historialEstadoTicketRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    
    @Autowired
    private NotificationRoleService notificationRoleService;
    
    public AsignacionResponseDTO asignarTicket(AsignarTicketRequestDTO request, String emailAsignador) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(request.getTicketId());
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket no encontrado con ID: " + request.getTicketId());
        }
        
        Optional<Usuario> tecnicoOpt = usuarioRepository.findById(request.getTecnicoId());
        if (tecnicoOpt.isEmpty()) {
            throw new RuntimeException("Técnico no encontrado con ID: " + request.getTecnicoId());
        }
        
        Ticket ticket = ticketOpt.get();
        Usuario tecnico = tecnicoOpt.get();
        
        Optional<AsignacionTicket> asignacionExistente = asignacionTicketRepository
            .findByTicketIdAndActivaTrue(request.getTicketId());
        
        if (asignacionExistente.isPresent()) {
            throw new RuntimeException("El ticket ya está asignado a otro técnico");
        }
        
        AsignacionTicket asignacion = new AsignacionTicket();
        asignacion.setTicketId(request.getTicketId());
        asignacion.setTecnicoId(request.getTecnicoId());
        asignacion.setFechaAsignacion(LocalDateTime.now());
        asignacion.setActiva(true);
        asignacion.setComentario(request.getComentario());
        asignacion.setTipoOperacion("ASIGNACION");
        
        AsignacionTicket asignacionGuardada = asignacionTicketRepository.save(asignacion);
        
        ticket.setStatus("ASIGNADO");
        ticket.setAssignedTechnician(tecnico);
        ticket.setAssignedTechnicianEmail(tecnico.getEmail());
        ticketRepository.save(ticket);
        
        guardarHistorialAsignacion(request.getTicketId(), request.getTecnicoId(), 
                                 emailAsignador, "ASIGNACION", request.getComentario());
        
        // Enviar notificaciones por roles
        Usuario admin = usuarioRepository.findByEmail(emailAsignador).orElse(null);
        if (admin != null) {
            notificationRoleService.notificarAsignacionTicket(ticket.getId(), admin.getId(), tecnico.getId());
        }
        
        return convertirADTO(asignacionGuardada, ticket, tecnico);
    }
    
    public AsignacionResponseDTO reasignarTicket(Long ticketId, Long nuevoTecnicoId, String emailReasignador) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket no encontrado con ID: " + ticketId);
        }
        
        Optional<Usuario> tecnicoOpt = usuarioRepository.findById(nuevoTecnicoId);
        if (tecnicoOpt.isEmpty()) {
            throw new RuntimeException("Técnico no encontrado con ID: " + nuevoTecnicoId);
        }
        
        Optional<AsignacionTicket> asignacionAnterior = asignacionTicketRepository
            .findByTicketIdAndActivaTrue(ticketId);
        
        if (asignacionAnterior.isPresent()) {
            AsignacionTicket anterior = asignacionAnterior.get();
            anterior.setActiva(false);
            asignacionTicketRepository.save(anterior);
        }
        
        AsignacionTicket nuevaAsignacion = new AsignacionTicket();
        nuevaAsignacion.setTicketId(ticketId);
        nuevaAsignacion.setTecnicoId(nuevoTecnicoId);
        nuevaAsignacion.setFechaAsignacion(LocalDateTime.now());
        nuevaAsignacion.setActiva(true);
        nuevaAsignacion.setTipoOperacion("REASIGNAR");
        
        AsignacionTicket asignacionGuardada = asignacionTicketRepository.save(nuevaAsignacion);
        
        Ticket ticket = ticketOpt.get();
        Usuario tecnico = tecnicoOpt.get();
        ticket.setAssignedTechnician(tecnico);
        ticket.setAssignedTechnicianEmail(tecnico.getEmail());
        ticketRepository.save(ticket);
        
        guardarHistorialAsignacion(ticketId, nuevoTecnicoId, emailReasignador, "REASIGNACION", null);
        
        // Enviar notificaciones por roles
        Usuario admin = usuarioRepository.findByEmail(emailReasignador).orElse(null);
        if (admin != null) {
            notificationRoleService.notificarAsignacionTicket(ticket.getId(), admin.getId(), tecnico.getId());
        }
        
        return convertirADTO(asignacionGuardada, ticket, tecnico);
    }
    
    public AsignacionResponseDTO escalarTicket(Long ticketId, Long tecnicoId, String emailEscalador, String comentario) {
        log.info("🚀 [ESCALACION] ===== INICIANDO ESCALACIÓN =====");
        log.info("🚀 [ESCALACION] Ticket ID: {}", ticketId);
        log.info("🚀 [ESCALACION] Nuevo técnico ID: {}", tecnicoId);
        log.info("🚀 [ESCALACION] Escalado por: {}", emailEscalador);
        log.info("🚀 [ESCALACION] Comentario: {}", comentario);
        
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket no encontrado con ID: " + ticketId);
        }
        
        Optional<Usuario> tecnicoOpt = usuarioRepository.findById(tecnicoId);
        if (tecnicoOpt.isEmpty()) {
            throw new RuntimeException("Técnico no encontrado con ID: " + tecnicoId);
        }
        
        Ticket ticket = ticketOpt.get();
        
        // Verificar que no se esté escalando al mismo técnico ya asignado
        if (ticket.getAssignedTechnician() != null && ticket.getAssignedTechnician().getId().equals(tecnicoId)) {
            throw new RuntimeException("No se puede escalar un ticket al mismo técnico que ya está asignado: " + ticket.getAssignedTechnician().getEmail());
        }
        
        // DESACTIVAR la asignación anterior para evitar duplicados
        Optional<AsignacionTicket> asignacionAnterior = asignacionTicketRepository
            .findAsignacionActivaMasReciente(ticketId);
        
        if (asignacionAnterior.isPresent()) {
            AsignacionTicket anterior = asignacionAnterior.get();
            log.info("📋 [ESCALACION] Desactivando asignación anterior - Técnico ID: {}", 
                anterior.getTecnicoId());
            
            // DESACTIVAR la asignación anterior para evitar conflictos
            anterior.setActiva(false);
            asignacionTicketRepository.save(anterior);
            
            log.info("✅ [ESCALACION] Asignación anterior desactivada correctamente");
        }
        
        AsignacionTicket escalacion = new AsignacionTicket();
        escalacion.setTicketId(ticketId);
        escalacion.setTecnicoId(tecnicoId);
        escalacion.setFechaAsignacion(LocalDateTime.now());
        escalacion.setActiva(true);
        escalacion.setComentario(comentario);
        escalacion.setTipoOperacion("ESCALAMIENTO");
        
        AsignacionTicket escalacionGuardada = asignacionTicketRepository.save(escalacion);
        
        Usuario tecnico = tecnicoOpt.get();
        
        // Obtener estado anterior antes de cambiarlo
        String estadoAnterior = ticket.getStatus();
        
        // ASIGNAR el ticket al técnico escalado
        log.info("🔄 [ESCALACION] Asignando ticket al técnico escalado: {} (cambiar)", 
            tecnico.getEmail());
        
        // CAMBIAR el técnico asignado al técnico escalado
        ticket.setAssignedTechnician(tecnico);
        ticket.setAssignedTechnicianEmail(tecnico.getEmail());
        
        // Cambiar estado a ESCALADO cuando se hace una escalación
        String nuevoEstado = "ESCALADO";
        
        log.info("🔄 [ESCALACION] Cambiando estado: {} → {} (escalación)", estadoAnterior, nuevoEstado);
        ticket.setStatus(nuevoEstado);
        
        ticketRepository.save(ticket);
        
        log.info("✅ [ESCALACION] Ticket {} escalado correctamente. Técnico escalado: {} ({}). Estado: {} → {}", 
            ticketId, tecnico.getFullName(), tecnico.getEmail(), estadoAnterior, nuevoEstado);
        
        // Verificar que se guardó correctamente
        Ticket ticketVerificado = ticketRepository.findById(ticketId).orElse(null);
        if (ticketVerificado != null) {
            log.info("✅ [ESCALACION] Verificación - Ticket {} guardado con técnico escalado: {} y estado: {}", 
                ticketId, 
                ticketVerificado.getAssignedTechnicianEmail(), 
                ticketVerificado.getStatus());
        } else {
            log.error("❌ [ESCALACION] Error - No se pudo verificar el ticket {} después de guardar", ticketId);
        }
        
        // Guardar historial de asignación
        guardarHistorialAsignacion(ticketId, tecnicoId, emailEscalador, "ESCALAMIENTO", comentario);
        
        // Guardar historial de cambio de estado solo si cambió
        if (!estadoAnterior.equals(nuevoEstado)) {
            guardarHistorialEstadoTicket(ticketId, estadoAnterior, nuevoEstado, 
                "Ticket escalado a técnico de mayor nivel: " + comentario, 
                emailEscalador, "ADMINISTRADOR");
        }
        
        // Enviar notificaciones por roles específicas para escalación
        Usuario admin = usuarioRepository.findByEmail(emailEscalador).orElse(null);
        if (admin != null) {
            notificationRoleService.notificarEscalacionTicket(ticket.getId(), admin.getId(), tecnico.getId());
        }
        
        return convertirADTO(escalacionGuardada, ticket, tecnico);
    }
    
    public void desasignarTicket(Long ticketId, String emailDesasignador) {
        Optional<AsignacionTicket> asignacionActiva = asignacionTicketRepository
            .findByTicketIdAndActivaTrue(ticketId);
        
        if (asignacionActiva.isPresent()) {
            AsignacionTicket asignacion = asignacionActiva.get();
            asignacion.setActiva(false);
            asignacionTicketRepository.save(asignacion);
        }
        
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            ticket.setStatus("PENDIENTE");
            ticket.setAssignedTechnicianEmail(null);
            ticketRepository.save(ticket);
        }
        
        guardarHistorialAsignacion(ticketId, null, emailDesasignador, "DESASIGNACION", null);
    }
    
    public void reabrirTicket(Long ticketId, String emailReabridor) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            ticket.setStatus("REABIERTO");
            ticketRepository.save(ticket);
            
            guardarHistorialAsignacion(ticketId, null, emailReabridor, "REAPERTURA", null);
        }
    }
    
    public List<AsignacionResponseDTO> obtenerAsignacionesPorTicket(Long ticketId) {
        List<AsignacionTicket> asignaciones = asignacionTicketRepository.findByTicketIdOrderByFechaAsignacionDesc(ticketId);
        return asignaciones.stream()
                .map(this::convertirADTOBasico)
                .toList();
    }
    
    public List<AsignacionResponseDTO> obtenerAsignacionesActivasPorTecnico(Long tecnicoId) {
        List<AsignacionTicket> asignaciones = asignacionTicketRepository.findByTecnicoIdAndActivaTrue(tecnicoId);
        return asignaciones.stream()
                .map(this::convertirADTOBasico)
                .toList();
    }
    
    private void guardarHistorialAsignacion(Long ticketId, Long tecnicoId, String emailUsuario, 
                                          String tipoAccion, String comentario) {
        // Obtener el ID del usuario que asigna
        Optional<Usuario> usuarioAsignador = usuarioRepository.findByEmail(emailUsuario);
        Long usuarioQueAsignaId = usuarioAsignador.map(usuario -> usuario.getId()).orElse(1L); // Fallback a ID 1
        
        // Obtener el estado anterior del ticket
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        String estadoAnterior = ticketOpt.map(Ticket::getStatus).orElse("PENDIENTE");
        
        // Determinar el estado nuevo basado en el tipo de acción
        String estadoNuevo = determinarEstadoNuevo(tipoAccion);
        
        HistorialAsignacion historial = new HistorialAsignacion();
        historial.setTicketId(ticketId);
        historial.setTecnicoId(tecnicoId);
        historial.setUsuarioQueAsignaId(usuarioQueAsignaId);
        historial.setEmailUsuario(emailUsuario != null ? emailUsuario : "sistema@admin.com");
        historial.setTipoOperacion(tipoAccion != null ? tipoAccion : "ASIGNACION");
        historial.setTipoAccion(tipoAccion != null ? tipoAccion : "ASIGNACION"); // También establecer tipo_accion
        historial.setEstadoAnterior(estadoAnterior != null ? estadoAnterior : "PENDIENTE");
        historial.setEstadoNuevo(estadoNuevo != null ? estadoNuevo : "PENDIENTE");
        historial.setComentario(comentario != null ? comentario : "");
        // fechaOperacion se establece automáticamente por @CreationTimestamp
        
        historialAsignacionRepository.save(historial);
    }
    
    /**
     * Obtiene el técnico asignado actual (más reciente) de un ticket
     */
    public Usuario obtenerTecnicoAsignado(Long ticketId) {
        // Buscar la asignación activa más reciente
        Optional<AsignacionTicket> asignacionActiva = asignacionTicketRepository
            .findAsignacionActivaMasReciente(ticketId);
        
        if (asignacionActiva.isPresent()) {
            return usuarioRepository.findById(asignacionActiva.get().getTecnicoId()).orElse(null);
        }
        
        // Fallback: usar el técnico asignado actual del ticket
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        return ticketOpt.map(Ticket::getAssignedTechnician).orElse(null);
    }
    
    /**
     * Obtiene el técnico asignado original (primera asignación) de un ticket
     */
    public Usuario obtenerTecnicoAsignadoOriginal(Long ticketId) {
        // Buscar la primera asignación del ticket (la original)
        List<HistorialAsignacion> historial = historialAsignacionRepository
            .findByTicketIdOrderByFechaOperacionAsc(ticketId);
        
        if (!historial.isEmpty()) {
            // Buscar la primera asignación (no escalamiento ni reasignación)
            for (HistorialAsignacion h : historial) {
                if ("ASIGNACION".equals(h.getTipoOperacion())) {
                    return usuarioRepository.findById(h.getTecnicoId()).orElse(null);
                }
            }
        }
        
        // Fallback: usar el técnico asignado actual del ticket
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        return ticketOpt.map(Ticket::getAssignedTechnician).orElse(null);
    }
    
    private String determinarEstadoNuevo(String tipoAccion) {
        switch (tipoAccion.toUpperCase()) {
            case "ASIGNACION":
                return "ASIGNADO";
            case "REASIGNACION":
                return "ASIGNADO";
            case "ESCALAMIENTO":
                return "ESCALADO";
            case "DESASIGNACION":
                return "PENDIENTE";
            case "REAPERTURA":
                return "REABIERTO";
            default:
                return "PENDIENTE";
        }
    }
    
    private AsignacionResponseDTO convertirADTO(AsignacionTicket asignacion, Ticket ticket, Usuario tecnico) {
        AsignacionResponseDTO dto = new AsignacionResponseDTO();
        dto.setId(asignacion.getId());
        dto.setTicketId(asignacion.getTicketId());
        dto.setTecnicoId(asignacion.getTecnicoId());
        dto.setTecnicoNombre(tecnico.getFullName() + " " + tecnico.getLastName());
        dto.setTecnicoEmail(tecnico.getEmail());
        dto.setFechaAsignacion(asignacion.getFechaAsignacion());
        dto.setActiva(asignacion.getActiva());
        dto.setComentario(asignacion.getComentario());
        dto.setTicketAsunto(ticket.getSubject());
        dto.setTicketEstado(ticket.getStatus());
        return dto;
    }
    
    private AsignacionResponseDTO convertirADTOBasico(AsignacionTicket asignacion) {
        AsignacionResponseDTO dto = new AsignacionResponseDTO();
        dto.setId(asignacion.getId());
        dto.setTicketId(asignacion.getTicketId());
        dto.setTecnicoId(asignacion.getTecnicoId());
        
        // Obtener información del técnico
        Optional<Usuario> tecnicoOpt = usuarioRepository.findById(asignacion.getTecnicoId());
        if (tecnicoOpt.isPresent()) {
            Usuario tecnico = tecnicoOpt.get();
            dto.setTecnicoNombre(tecnico.getFullName() + " " + tecnico.getLastName());
            dto.setTecnicoEmail(tecnico.getEmail());
        }
        
        dto.setFechaAsignacion(asignacion.getFechaAsignacion());
        dto.setActiva(asignacion.getActiva());
        dto.setComentario(asignacion.getComentario());
        dto.setTipoOperacion(asignacion.getTipoOperacion());
        return dto;
    }
    
    /**
     * Guardar historial de cambio de estado
     */
    private void guardarHistorialEstadoTicket(Long ticketId, String estadoAnterior, String estadoNuevo, 
                                            String comentario, String emailUsuario, String tipoUsuario) {
        try {
            Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(emailUsuario);
            
            if (ticketOpt.isPresent() && usuarioOpt.isPresent()) {
                HistorialEstadoTicket historial = HistorialEstadoTicket.builder()
                    .ticket(ticketOpt.get())
                    .cambiadoPor(usuarioOpt.get())
                    .estadoAnterior(estadoAnterior)
                    .estadoNuevo(estadoNuevo)
                    .comentario(comentario)
                    .tipoUsuario(tipoUsuario)
                    .build();
                
                historialEstadoTicketRepository.save(historial);
                
                log.info("📝 [HISTORIAL] Guardado cambio de estado: {} → {} por {}", 
                    estadoAnterior, estadoNuevo, tipoUsuario);
            }
        } catch (Exception e) {
            log.error("❌ [HISTORIAL] Error guardando historial de estado: {}", e.getMessage());
        }
    }
}


