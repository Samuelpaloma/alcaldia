package com.example.demo.ticket.service;

import com.example.demo.ticket.dto.request.ComentarioRequestDTO;
import com.example.demo.ticket.dto.response.ComentarioResponseDTO;
import com.example.demo.ticket.model.Comentario;
import com.example.demo.ticket.repository.ComentarioRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.notificacion.service.SmartNotificationService;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComentarioService {
    
    @Autowired
    private ComentarioRepository comentarioRepository;
    
    @Autowired
    private SmartNotificationService smartNotificationService;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public ComentarioResponseDTO crearComentario(ComentarioRequestDTO request, String emailUsuario) {
        // TODO: Implementar lógica de negocio completa
        Comentario comentario = new Comentario();
        comentario.setTicketId(request.getTicketId());
        comentario.setMensaje(request.getMensaje());
        comentario.setAutor("Usuario");
        comentario.setAutorEmail(emailUsuario);
        comentario.setTipoAutor(Comentario.TipoAutor.CLIENTE);
        comentario.setUsuarioId(request.getUsuarioId() != null ? request.getUsuarioId() : 1L); // Usar usuario_id del request o 1 por defecto
        comentario.setFechaCreacion(java.time.LocalDateTime.now());
        
        Comentario comentarioGuardado = comentarioRepository.save(comentario);
        
        // Enviar notificaciones según el tipo de autor
        try {
            Ticket ticket = ticketRepository.findById(request.getTicketId()).orElse(null);
            Usuario usuario = usuarioRepository.findByEmail(emailUsuario).orElse(null);
            
            if (ticket != null && usuario != null) {
                // Determinar el tipo de usuario que está comentando
                if (usuario.getTipoUsuario() == TipoUsuario.TECNICO) {
                    // Si es técnico, notificar al cliente y admin
                    smartNotificationService.notificarRespuestaTecnico(ticket, usuario);
                } else {
                    // Si es cliente, notificar al técnico y admin
                    smartNotificationService.notificarRespuestaCliente(ticket, usuario);
                }
            }
        } catch (Exception e) {
            // Log del error pero no fallar la creación del comentario
            System.err.println("Error enviando notificación de comentario: " + e.getMessage());
        }
        
        return convertirADTO(comentarioGuardado);
    }
    
    public List<ComentarioResponseDTO> obtenerComentariosPorTicket(Long ticketId) {
        List<Comentario> comentarios = comentarioRepository.findComentariosPorTicket(ticketId);
        return comentarios.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }
    
    private ComentarioResponseDTO convertirADTO(Comentario comentario) {
        return new ComentarioResponseDTO(
            comentario.getId(),
            comentario.getTicketId(),
            comentario.getMensaje(),
            comentario.getAutor(),
            comentario.getAutorEmail(),
            comentario.getTipoAutor().name(),
            comentario.getFechaCreacion()
        );
    }
    
}