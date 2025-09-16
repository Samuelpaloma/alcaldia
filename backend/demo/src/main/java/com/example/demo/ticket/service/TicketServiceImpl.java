package com.example.demo.ticket.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.ticket.dto.request.TicketRequestDTO;
import com.example.demo.ticket.dto.response.TicketResponseDTO;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;

@Service
public class TicketServiceImpl implements TicketService {
    

    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;

    public TicketServiceImpl(TicketRepository ticketRepository, UsuarioRepository usuarioRepository) {
        this.ticketRepository = ticketRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional
    public TicketResponseDTO crearTicket(TicketRequestDTO request, String emailUsuario) {
        // Buscar usuario creador
        Usuario creador = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Crear ticket
        Ticket ticket = new Ticket();
        ticket.setDescripcion(request.getDescripcion());
        ticket.setPrioridad(request.getPrioridad());
        ticket.setEstado("PENDIENTE");
        ticket.setCreador(creador);

        ticketRepository.save(ticket);

        return new TicketResponseDTO(
                ticket.getId(),
                ticket.getDescripcion(),
                ticket.getPrioridad(),
                ticket.getEstado(),
                creador.getEmail(),
                ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getEmail() : null,
                LocalDateTime.now()
        );
    }
}
