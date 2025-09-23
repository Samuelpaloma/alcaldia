package com.example.demo.asignacion.service;

import com.example.demo.asignacion.dto.request.AsignarTicketRequestDTO;
import com.example.demo.asignacion.dto.response.AsignacionResponseDTO;
import com.example.demo.asignacion.model.HistorialAsignacion;
import com.example.demo.asignacion.repository.HistorialAsignacionRepository;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.model.TicketAcceso;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.ticket.repository.TicketAccesoRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AsignacionService {
    
    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;
    private final HistorialAsignacionRepository historialAsignacionRepository;
    private final TicketAccesoRepository ticketAccesoRepository;
    
    /**
     * Asignar ticket a técnico
     */
    public AsignacionResponseDTO asignarTicket(AsignarTicketRequestDTO request, String emailAsignador) {
        log.info("Asignando ticket {} a técnico {}", request.getTicketId(), request.getTecnicoId());
        
        // 1. Buscar ticket
        Ticket ticket = ticketRepository.findById(request.getTicketId())
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // 2. Buscar técnico
        Usuario tecnico = usuarioRepository.findById(request.getTecnicoId())
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        // 3. Verificar que sea técnico
        if (!tecnico.isTecnico()) {
            throw new RuntimeException("El usuario no es un técnico");
        }
        
        // 4. Buscar quien asigna
        Usuario asignador = usuarioRepository.findByEmail(emailAsignador)
            .orElseThrow(() -> new RuntimeException("Usuario asignador no encontrado"));
        
        // 5. Guardar estado anterior
        String estadoAnterior = ticket.getEstado();
        
        // 6. Asignar ticket
        ticket.setTecnicoAsignado(tecnico);
        ticket.setEstado("ASIGNADO");
        
        // 7. Actualizar prioridad si se proporciona
        if (request.getPrioridad() != null) {
            ticket.setPrioridad(request.getPrioridad());
        }
        
        // 8. Actualizar fecha de actualización
        ticket.setFechaActualizacion(LocalDateTime.now());
        
        // 9. Guardar ticket
        ticketRepository.save(ticket);
        
        // 10. Crear acceso del técnico al ticket
        crearAccesoTicket(ticket, tecnico, TicketAcceso.TipoAcceso.ASIGNADO, "Asignación inicial");
        
        // 11. Guardar en historial
        guardarHistorialAsignacion(ticket, tecnico, asignador, HistorialAsignacion.TipoOperacion.ASIGNAR, 
                                 estadoAnterior, "ASIGNADO", request.getComentario());
        
        log.info("Ticket {} asignado exitosamente a técnico {}", ticket.getId(), tecnico.getEmail());
        
        // 10. Crear respuesta
        return AsignacionResponseDTO.builder()
            .ticketId(ticket.getId())
            .ticketTitulo(ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : "Ticket")
            .tecnicoId(tecnico.getIdUsuario())
            .tecnicoNombre(tecnico.getNombreCompleto())
            .tecnicoEmail(tecnico.getEmail())
            .estadoAnterior(estadoAnterior)
            .estadoNuevo("ASIGNADO")
            .prioridad(ticket.getPrioridad())
            .comentario(request.getComentario())
            .fechaAsignacion(LocalDateTime.now())
            .asignadoPor(asignador.getNombreCompleto())
            .tipoOperacion("ASIGNAR")
            .build();
    }
    
    /**
     * Reasignar ticket a otro técnico
     */
    public AsignacionResponseDTO reasignarTicket(AsignarTicketRequestDTO request, String emailAsignador) {
        log.info("Reasignando ticket {} a técnico {}", request.getTicketId(), request.getTecnicoId());
        
        // 1. Buscar ticket
        Ticket ticket = ticketRepository.findById(request.getTicketId())
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // 2. Verificar que ya esté asignado
        if (ticket.getTecnicoAsignado() == null) {
            throw new RuntimeException("El ticket no está asignado");
        }
        
        // 3. Guardar técnico anterior
        Usuario tecnicoAnterior = ticket.getTecnicoAsignado();
        String estadoAnterior = ticket.getEstado();
        
        // 4. Asignar a nuevo técnico
        AsignacionResponseDTO response = asignarTicket(request, emailAsignador);
        // Cambiar el tipo de operación a REASIGNAR
        response.setTipoOperacion("REASIGNAR");
        return response;
    }
    
    /**
     * Escalar ticket a otro técnico (escalación por dificultad)
     */
    public AsignacionResponseDTO escalarTicket(AsignarTicketRequestDTO request, String emailEscalador) {
        log.info("Escalando ticket {} a técnico {}", request.getTicketId(), request.getTecnicoId());
        
        // 1. Buscar ticket
        Ticket ticket = ticketRepository.findById(request.getTicketId())
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // 2. Verificar que ya esté asignado
        if (ticket.getTecnicoAsignado() == null) {
            throw new RuntimeException("El ticket no está asignado para escalar");
        }
        
        // 3. Guardar técnico anterior
        Usuario tecnicoAnterior = ticket.getTecnicoAsignado();
        String estadoAnterior = ticket.getEstado();
        
        // 4. Buscar nuevo técnico
        Usuario nuevoTecnico = usuarioRepository.findById(request.getTecnicoId())
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        // 5. Verificar que sea técnico
        if (!nuevoTecnico.isTecnico()) {
            throw new RuntimeException("El usuario no es un técnico");
        }
        
        // 6. Buscar quien escala
        Usuario escalador = usuarioRepository.findByEmail(emailEscalador)
            .orElseThrow(() -> new RuntimeException("Usuario escalador no encontrado"));
        
        // 7. Cerrar acceso del técnico anterior
        cerrarAccesoTicket(ticket, tecnicoAnterior, "Ticket escalado a otro técnico");
        
        // 8. Escalar ticket (cambiar técnico y marcar como escalado)
        ticket.setTecnicoAsignado(nuevoTecnico);
        ticket.setEstado("ESCALADO"); // Marcar como escalado
        
        // 8. Actualizar prioridad si se proporciona
        if (request.getPrioridad() != null) {
            ticket.setPrioridad(request.getPrioridad());
        }
        
        // 9. Actualizar fecha de actualización
        ticket.setFechaActualizacion(LocalDateTime.now());
        
        // 10. Guardar ticket
        ticketRepository.save(ticket);
        
        // 11. Crear acceso del nuevo técnico al ticket
        crearAccesoTicket(ticket, nuevoTecnico, TicketAcceso.TipoAcceso.ESCALADO, "Ticket escalado");
        
        // 12. Guardar en historial
        guardarHistorialAsignacion(ticket, nuevoTecnico, escalador, HistorialAsignacion.TipoOperacion.ESCALAR, 
                                 estadoAnterior, "ESCALADO", 
                                 request.getComentario() != null ? request.getComentario() : "Ticket escalado por dificultad");
        
        log.info("Ticket {} escalado exitosamente de {} a {}", 
            ticket.getId(), tecnicoAnterior.getEmail(), nuevoTecnico.getEmail());
        
        // 11. Crear respuesta
        return AsignacionResponseDTO.builder()
            .ticketId(ticket.getId())
            .ticketTitulo(ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : "Ticket")
            .tecnicoId(nuevoTecnico.getIdUsuario())
            .tecnicoNombre(nuevoTecnico.getNombreCompleto())
            .tecnicoEmail(nuevoTecnico.getEmail())
            .estadoAnterior(estadoAnterior)
            .estadoNuevo("ESCALADO") // Marcar como escalado
            .prioridad(ticket.getPrioridad())
            .comentario(request.getComentario() != null ? request.getComentario() : "Ticket escalado por dificultad")
            .fechaAsignacion(LocalDateTime.now())
            .asignadoPor(escalador.getNombreCompleto())
            .tipoOperacion("ESCALAR")
            .build();
    }
    
    /**
     * Desasignar ticket
     */
    public AsignacionResponseDTO desasignarTicket(Long ticketId, String emailDesasignador) {
        log.info("Desasignando ticket {}", ticketId);
        
        // 1. Buscar ticket
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // 2. Verificar que esté asignado
        if (ticket.getTecnicoAsignado() == null) {
            throw new RuntimeException("El ticket no está asignado");
        }
        
        // 3. Buscar quien desasigna
        Usuario desasignador = usuarioRepository.findByEmail(emailDesasignador)
            .orElseThrow(() -> new RuntimeException("Usuario desasignador no encontrado"));
        
        // 4. Guardar información anterior
        Usuario tecnicoAnterior = ticket.getTecnicoAsignado();
        String estadoAnterior = ticket.getEstado();
        
        // 5. Desasignar
        ticket.setTecnicoAsignado(null);
        ticket.setEstado("PENDIENTE");
        ticket.setFechaActualizacion(LocalDateTime.now());
        
        // 6. Guardar
        ticketRepository.save(ticket);
        
        log.info("Ticket {} desasignado exitosamente", ticket.getId());
        
        // 7. Crear respuesta
        return AsignacionResponseDTO.builder()
            .ticketId(ticket.getId())
            .ticketTitulo(ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : "Ticket")
            .tecnicoId(null)
            .tecnicoNombre(null)
            .tecnicoEmail(null)
            .estadoAnterior(estadoAnterior)
            .estadoNuevo("PENDIENTE")
            .prioridad(ticket.getPrioridad())
            .comentario("Ticket desasignado")
            .fechaAsignacion(LocalDateTime.now())
            .asignadoPor(desasignador.getNombreCompleto())
            .tipoOperacion("DESASIGNAR")
            .build();
    }
    
    /**
     * Obtener tickets asignados a un técnico
     */
    @Transactional(readOnly = true)
    public List<AsignacionResponseDTO> obtenerTicketsAsignados(Long tecnicoId) {
        log.info("Obteniendo tickets asignados al técnico {}", tecnicoId);
        
        Usuario tecnico = usuarioRepository.findById(tecnicoId)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        List<Ticket> tickets = ticketRepository.findByTecnicoAsignado(tecnico);
        
        return tickets.stream()
            .map(ticket -> AsignacionResponseDTO.builder()
                .ticketId(ticket.getId())
                .ticketTitulo(ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : "Ticket")
                .tecnicoId(tecnico.getIdUsuario())
                .tecnicoNombre(tecnico.getNombreCompleto())
                .tecnicoEmail(tecnico.getEmail())
                .estadoAnterior("PENDIENTE")
                .estadoNuevo(ticket.getEstado())
                .prioridad(ticket.getPrioridad())
                .fechaAsignacion(ticket.getFechaActualizacion())
                .build())
            .collect(Collectors.toList());
    }
    
    /**
     * Obtener tickets sin asignar
     */
    @Transactional(readOnly = true)
    public List<AsignacionResponseDTO> obtenerTicketsSinAsignar() {
        log.info("Obteniendo tickets sin asignar");
        
        List<Ticket> tickets = ticketRepository.findByTecnicoAsignadoIsNull();
        
        return tickets.stream()
            .map(ticket -> AsignacionResponseDTO.builder()
                .ticketId(ticket.getId())
                .ticketTitulo(ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : "Ticket")
                .tecnicoId(null)
                .tecnicoNombre(null)
                .tecnicoEmail(null)
                .estadoAnterior("PENDIENTE")
                .estadoNuevo(ticket.getEstado())
                .prioridad(ticket.getPrioridad())
                .fechaAsignacion(ticket.getFechaCreacion())
                .build())
            .collect(Collectors.toList());
    }
    
    /**
     * Reabrir ticket cerrado
     */
    public AsignacionResponseDTO reabrirTicket(Long ticketId, String emailReabridor) {
        log.info("Reabriendo ticket {}", ticketId);
        
        // 1. Buscar ticket
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // 2. Verificar que esté cerrado
        if (!"CERRADO".equalsIgnoreCase(ticket.getEstado()) && !"TERMINADO".equalsIgnoreCase(ticket.getEstado())) {
            throw new RuntimeException("El ticket no está cerrado y no puede ser reabierto");
        }
        
        // 3. Buscar quien reabre
        Usuario reabridor = usuarioRepository.findByEmail(emailReabridor)
            .orElseThrow(() -> new RuntimeException("Usuario reabridor no encontrado"));
        
        // 4. Guardar estado anterior
        String estadoAnterior = ticket.getEstado();
        
        // 5. Reabrir ticket
        ticket.setEstado("PENDIENTE");
        ticket.setFechaActualizacion(LocalDateTime.now());
        
        // 6. Guardar ticket
        ticketRepository.save(ticket);
        
        log.info("Ticket {} reabierto exitosamente por {}", ticket.getId(), reabridor.getEmail());
        
        // 7. Crear respuesta
        return AsignacionResponseDTO.builder()
            .ticketId(ticket.getId())
            .ticketTitulo(ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : "Ticket")
            .tecnicoId(ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getIdUsuario() : null)
            .tecnicoNombre(ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getNombreCompleto() : null)
            .tecnicoEmail(ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getEmail() : null)
            .estadoAnterior(estadoAnterior)
            .estadoNuevo("PENDIENTE")
            .prioridad(ticket.getPrioridad())
            .comentario("Ticket reabierto por el cliente")
            .fechaAsignacion(LocalDateTime.now())
            .asignadoPor(reabridor.getNombreCompleto())
            .tipoOperacion("REABRIR")
            .build();
    }
    
    /**
     * Guardar entrada en el historial de asignaciones
     */
    private void guardarHistorialAsignacion(Ticket ticket, Usuario tecnico, Usuario usuarioQueAsigna, 
                                          HistorialAsignacion.TipoOperacion tipoOperacion, 
                                          String estadoAnterior, String estadoNuevo, String comentario) {
        HistorialAsignacion historial = new HistorialAsignacion();
        historial.setTicket(ticket);
        historial.setTecnico(tecnico);
        historial.setUsuarioQueAsigna(usuarioQueAsigna);
        historial.setTipoOperacion(tipoOperacion);
        historial.setEstadoAnterior(estadoAnterior);
        historial.setEstadoNuevo(estadoNuevo);
        historial.setComentario(comentario);
        
        historialAsignacionRepository.save(historial);
        log.info("Historial guardado para ticket {} - operación: {}", ticket.getId(), tipoOperacion);
    }
    
    /**
     * Crear acceso de técnico a ticket
     */
    private void crearAccesoTicket(Ticket ticket, Usuario tecnico, TicketAcceso.TipoAcceso tipoAcceso, String motivo) {
        TicketAcceso acceso = new TicketAcceso();
        acceso.setTicket(ticket);
        acceso.setTecnico(tecnico);
        acceso.setTipoAcceso(tipoAcceso);
        acceso.setActivo(true);
        acceso.setMotivoCierre(motivo);
        
        ticketAccesoRepository.save(acceso);
        log.info("Acceso creado para técnico {} al ticket {} - tipo: {}", tecnico.getEmail(), ticket.getId(), tipoAcceso);
    }
    
    /**
     * Cerrar acceso de técnico a ticket
     */
    private void cerrarAccesoTicket(Ticket ticket, Usuario tecnico, String motivo) {
        List<TicketAcceso> accesos = ticketAccesoRepository.findByTicketAndTecnico(ticket, tecnico);
        
        for (TicketAcceso acceso : accesos) {
            if (acceso.getActivo()) {
                acceso.setActivo(false);
                acceso.setFechaCierre(LocalDateTime.now());
                acceso.setMotivoCierre(motivo);
                ticketAccesoRepository.save(acceso);
                log.info("Acceso cerrado para técnico {} al ticket {} - motivo: {}", tecnico.getEmail(), ticket.getId(), motivo);
            }
        }
    }
}


