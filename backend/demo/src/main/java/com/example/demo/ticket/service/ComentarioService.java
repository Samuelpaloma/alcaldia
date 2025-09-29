package com.example.demo.ticket.service;

import com.example.demo.ticket.dto.request.ComentarioRequestDTO;
import com.example.demo.ticket.dto.response.ComentarioResponseDTO;
import com.example.demo.ticket.model.Comentario;
import com.example.demo.ticket.repository.ComentarioRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.model.TipoUsuario;
import com.example.demo.notificacion.service.ComentarioNotificationService;
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
    private ComentarioNotificationService comentarioNotificationService;
    
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    public ComentarioResponseDTO crearComentario(ComentarioRequestDTO request, String emailUsuario) {
        // Obtener información del usuario para determinar el tipo de autor
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario).orElse(null);
        
        Comentario comentario = new Comentario();
        comentario.setTicketId(request.getTicketId());
        comentario.setMensaje(request.getMensaje());
        
        if (usuario != null) {
            comentario.setAutor(usuario.getNombre() + " " + usuario.getApellido());
            comentario.setAutorEmail(emailUsuario);
            
            // Determinar tipo de autor basado en el tipo de usuario
            switch (usuario.getTipoUsuario()) {
                case TECNICO:
                    comentario.setTipoAutor(Comentario.TipoAutor.TECNICO);
                    break;
                case ADMINISTRADOR:
                    comentario.setTipoAutor(Comentario.TipoAutor.ADMINISTRADOR);
                    break;
                case SUPERADMIN:
                    comentario.setTipoAutor(Comentario.TipoAutor.ADMINISTRADOR);
                    break;
                default:
                    comentario.setTipoAutor(Comentario.TipoAutor.CLIENTE);
                    break;
            }
            comentario.setUsuarioId(usuario.getIdUsuario());
        } else {
            // Fallback si no se encuentra el usuario
            comentario.setAutor("Usuario");
            comentario.setAutorEmail(emailUsuario);
            comentario.setTipoAutor(Comentario.TipoAutor.CLIENTE);
            comentario.setUsuarioId(request.getUsuarioId() != null ? request.getUsuarioId() : 1L);
        }
        
        comentario.setFechaCreacion(java.time.LocalDateTime.now());
        
        Comentario comentarioGuardado = comentarioRepository.save(comentario);
        
        // Enviar notificaciones por roles (respetando preferencias)
        try {
            if (usuario != null) {
                System.out.println("🔔 [COMENTARIO SERVICE] Enviando notificación para ticket " + request.getTicketId() + " por usuario " + usuario.getIdUsuario());
                comentarioNotificationService.notificarComentarioAgregado(request.getTicketId(), usuario.getIdUsuario());
                System.out.println("🔔 [COMENTARIO SERVICE] Notificación enviada exitosamente");
            } else {
                System.out.println("🔔 [COMENTARIO SERVICE] No se envió notificación - usuario es null");
            }
        } catch (Exception e) {
            // Log del error pero no fallar la creación del comentario
            System.err.println("❌ [COMENTARIO SERVICE] Error enviando notificación de comentario: " + e.getMessage());
            e.printStackTrace();
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