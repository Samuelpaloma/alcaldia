package com.example.demo.asignacion.service;

import com.example.demo.asignacion.dto.request.AsignarTicketRequestDTO;
import com.example.demo.asignacion.dto.response.AsignacionResponseDTO;
import com.example.demo.asignacion.model.AsignacionTicket;
import com.example.demo.asignacion.model.HistorialAsignacion;
import com.example.demo.asignacion.repository.AsignacionTicketRepository;
import com.example.demo.asignacion.repository.HistorialAsignacionRepository;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AsignacionService {
    
    @Autowired
    private AsignacionTicketRepository asignacionTicketRepository;
    
    @Autowired
    private HistorialAsignacionRepository historialAsignacionRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
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
        
        AsignacionTicket asignacionGuardada = asignacionTicketRepository.save(asignacion);
        
        ticket.setEstado("ASIGNADO");
        ticket.setTecnicoAsignado(tecnico);
        ticket.setTecnicoEmail(tecnico.getEmail());
        ticketRepository.save(ticket);
        
        guardarHistorialAsignacion(request.getTicketId(), request.getTecnicoId(), 
                                 emailAsignador, "ASIGNACION", request.getComentario());
        
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
        
        AsignacionTicket asignacionGuardada = asignacionTicketRepository.save(nuevaAsignacion);
        
        Ticket ticket = ticketOpt.get();
        Usuario tecnico = tecnicoOpt.get();
        ticket.setTecnicoAsignado(tecnico);
        ticket.setTecnicoEmail(tecnico.getEmail());
        ticketRepository.save(ticket);
        
        guardarHistorialAsignacion(ticketId, nuevoTecnicoId, emailReasignador, "REASIGNACION", null);
        
        return convertirADTO(asignacionGuardada, ticket, tecnico);
    }
    
    public AsignacionResponseDTO escalarTicket(Long ticketId, Long tecnicoId, String emailEscalador, String comentario) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket no encontrado con ID: " + ticketId);
        }
        
        Optional<Usuario> tecnicoOpt = usuarioRepository.findById(tecnicoId);
        if (tecnicoOpt.isEmpty()) {
            throw new RuntimeException("Técnico no encontrado con ID: " + tecnicoId);
        }
        
        Optional<AsignacionTicket> asignacionAnterior = asignacionTicketRepository
            .findByTicketIdAndActivaTrue(ticketId);
        
        if (asignacionAnterior.isPresent()) {
            AsignacionTicket anterior = asignacionAnterior.get();
            anterior.setActiva(false);
            asignacionTicketRepository.save(anterior);
        }
        
        AsignacionTicket escalacion = new AsignacionTicket();
        escalacion.setTicketId(ticketId);
        escalacion.setTecnicoId(tecnicoId);
        escalacion.setFechaAsignacion(LocalDateTime.now());
        escalacion.setActiva(true);
        escalacion.setComentario(comentario);
        
        AsignacionTicket escalacionGuardada = asignacionTicketRepository.save(escalacion);
        
        Ticket ticket = ticketOpt.get();
        Usuario tecnico = tecnicoOpt.get();
        ticket.setEstado("ESCALADO");
        ticket.setTecnicoAsignado(tecnico);
        ticket.setTecnicoEmail(tecnico.getEmail());
        ticketRepository.save(ticket);
        
        guardarHistorialAsignacion(ticketId, tecnicoId, emailEscalador, "ESCALAMIENTO", comentario);
        
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
            ticket.setEstado("PENDIENTE");
            ticket.setTecnicoEmail(null);
            ticketRepository.save(ticket);
        }
        
        guardarHistorialAsignacion(ticketId, null, emailDesasignador, "DESASIGNACION", null);
    }
    
    public void reabrirTicket(Long ticketId, String emailReabridor) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            ticket.setEstado("REABIERTO");
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
        Long usuarioQueAsignaId = usuarioAsignador.map(usuario -> usuario.getIdUsuario()).orElse(1L); // Fallback a ID 1
        
        // Obtener el estado anterior del ticket
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        String estadoAnterior = ticketOpt.map(Ticket::getEstado).orElse("PENDIENTE");
        
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
        dto.setTecnicoNombre(tecnico.getNombre() + " " + tecnico.getApellido());
        dto.setTecnicoEmail(tecnico.getEmail());
        dto.setFechaAsignacion(asignacion.getFechaAsignacion());
        dto.setActiva(asignacion.getActiva());
        dto.setComentario(asignacion.getComentario());
        dto.setTicketAsunto(ticket.getAsunto());
        dto.setTicketEstado(ticket.getEstado());
        return dto;
    }
    
    private AsignacionResponseDTO convertirADTOBasico(AsignacionTicket asignacion) {
        AsignacionResponseDTO dto = new AsignacionResponseDTO();
        dto.setId(asignacion.getId());
        dto.setTicketId(asignacion.getTicketId());
        dto.setTecnicoId(asignacion.getTecnicoId());
        dto.setFechaAsignacion(asignacion.getFechaAsignacion());
        dto.setActiva(asignacion.getActiva());
        dto.setComentario(asignacion.getComentario());
        return dto;
    }
}






