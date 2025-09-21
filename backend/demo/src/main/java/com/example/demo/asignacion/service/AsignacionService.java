package com.example.demo.asignacion.service;

import com.example.demo.asignacion.dto.request.AsignarTicketRequestDTO;
import com.example.demo.asignacion.dto.response.AsignacionResponseDTO;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
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
        return asignarTicket(request, emailAsignador);
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
}


