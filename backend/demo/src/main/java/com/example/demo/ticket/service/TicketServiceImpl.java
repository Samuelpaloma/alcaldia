package com.example.demo.ticket.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.ticket.dto.request.TicketRequestDTO;
import com.example.demo.ticket.dto.response.HistorialTicketResponseDTO;
import com.example.demo.ticket.dto.response.TicketResponseDTO;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;

@Service
public class TicketServiceImpl implements TicketService {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public TicketResponseDTO crearTicket(TicketRequestDTO request, String emailUsuario) {
        // Buscar usuario creador
        Usuario creador = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Crear ticket con todos los campos del formulario
        Ticket ticket = new Ticket();
        // El nombre se obtiene automáticamente del usuario logueado
        ticket.setUbicacion(request.getUbicacion());
        // La consulta solo se llena si el usuario selecciona "Otros" y escribe algo personalizado
        ticket.setConsulta(request.getConsulta());
        ticket.setCategoria(request.getCategoria());
        ticket.setPrioridad(request.getPrioridad() != null ? request.getPrioridad() : "MEDIA");
        ticket.setEstado("PENDIENTE");
        ticket.setCreador(creador);
        
        // Manejar archivo adjunto si existe
        if (request.getArchivoAdjunto() != null) {
            ticket.setArchivoAdjunto(request.getArchivoAdjunto());
            ticket.setNombreArchivo(request.getNombreArchivo());
        }

        ticketRepository.save(ticket);

        return new TicketResponseDTO(
                ticket.getId(),
                ticket.getDescripcion(),
                ticket.getPrioridad(),
                ticket.getEstado(),
                creador.getEmail(),
                ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getEmail() : null,
                ticket.getFechaCreacion(),
                ticket.getFechaActualizacion(),
                creador.getNombre(), // Nombre del usuario logueado
                ticket.getUbicacion(),
                ticket.getConsulta(),
                ticket.getCategoria(),
                ticket.getArchivoAdjunto(),
                ticket.getNombreArchivo()
        );
    }

    @Override
    public TicketResponseDTO obtenerTicketParaSeguimiento(Long ticketId, String emailUsuario) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // Verificar que el usuario tenga acceso al ticket
        if (!ticket.getCreador().getEmail().equals(emailUsuario)) {
            throw new RuntimeException("No tienes permisos para ver este ticket");
        }

        return convertirTicketAResponseDTO(ticket);
    }

    @Override
    public Page<HistorialTicketResponseDTO> obtenerHistorialTickets(String emailUsuario, Pageable pageable) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Page<Ticket> tickets = ticketRepository.findByCreadorOrderByFechaCreacionDesc(usuario, pageable);
        
        return tickets.map(this::convertirTicketAHistorialDTO);
    }

    @Override
    public List<TicketResponseDTO> buscarTickets(String emailUsuario, String categoria, String estado, String prioridad) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        List<Ticket> tickets = ticketRepository.findByCreadorAndCategoriaAndEstadoAndPrioridad(
                usuario, categoria, estado, prioridad);
        
        return tickets.stream()
                .map(this::convertirTicketAResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TicketResponseDTO obtenerTicketPorId(Long id, String emailUsuario) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // Verificar que el usuario tenga acceso al ticket
        if (!ticket.getCreador().getEmail().equals(emailUsuario)) {
            throw new RuntimeException("No tienes permisos para ver este ticket");
        }

        return convertirTicketAResponseDTO(ticket);
    }

    @Override
    public List<String> obtenerCategoriasDisponibles() {
        return Arrays.asList(
            "Admisiones",
            "Programas de Formación", 
            "Soporte Técnico",
            "Otros"
        );
    }

    @Override
    public String obtenerNombreUsuario(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + emailUsuario));
        return usuario.getNombre();
    }

    // Métodos auxiliares
    private TicketResponseDTO convertirTicketAResponseDTO(Ticket ticket) {
        return new TicketResponseDTO(
                ticket.getId(),
                ticket.getDescripcion(),
                ticket.getPrioridad(),
                ticket.getEstado(),
                ticket.getCreador().getEmail(),
                ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getEmail() : null,
                ticket.getFechaCreacion(),
                ticket.getFechaActualizacion(),
                ticket.getCreador().getNombre(), // Nombre del usuario logueado
                ticket.getUbicacion(),
                ticket.getConsulta(),
                ticket.getCategoria(),
                ticket.getArchivoAdjunto(),
                ticket.getNombreArchivo()
        );
    }

    private HistorialTicketResponseDTO convertirTicketAHistorialDTO(Ticket ticket) {
        return new HistorialTicketResponseDTO(
                ticket.getId(),
                ticket.getCreador().getNombre(), // Nombre del usuario logueado
                ticket.getUbicacion(),
                ticket.getCategoria(),
                ticket.getEstado(),
                ticket.getPrioridad(),
                ticket.getFechaCreacion(),
                ticket.getFechaActualizacion(),
                ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getEmail() : null
        );
    }
}
