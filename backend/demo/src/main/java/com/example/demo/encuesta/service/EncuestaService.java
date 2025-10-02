package com.example.demo.encuesta.service;

import com.example.demo.encuesta.dto.request.EncuestaSatisfaccionRequestDTO;
import com.example.demo.encuesta.dto.response.EncuestaSatisfaccionResponseDTO;
import com.example.demo.encuesta.model.EncuestaSatisfaccion;
import com.example.demo.encuesta.repository.EncuestaSatisfaccionRepository;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EncuestaService {

    private final EncuestaSatisfaccionRepository encuestaRepository;
    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public EncuestaSatisfaccionResponseDTO enviarEncuestaSatisfaccion(
            EncuestaSatisfaccionRequestDTO request, String emailUsuario) {
        log.info("🔍 [ENCUESTA-SERVICE] Enviando encuesta de satisfacción para ticket: {}", request.getTicketId());
        
        try {
            // Buscar el ticket
            Ticket ticket = ticketRepository.findById(request.getTicketId())
                    .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
            
            // Buscar el usuario
            Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // Crear la encuesta
            EncuestaSatisfaccion encuesta = EncuestaSatisfaccion.builder()
                    .ticket(ticket)
                    .usuario(usuario)
                    .calificacion(request.getCalificacion())
                    .comentario(request.getComentario())
                    .aspectosPositivos(convertirListaAJson(request.getAspectosPositivos()))
                    .aspectosNegativos(convertirListaAJson(request.getAspectosNegativos()))
                    .fechaCreacion(LocalDateTime.now())
                    .activo(true)
                    .build();
            
            // Guardar en la base de datos
            EncuestaSatisfaccion encuestaGuardada = encuestaRepository.save(encuesta);
            
            log.info("🔍 [ENCUESTA-SERVICE] Encuesta guardada con ID: {}", encuestaGuardada.getId());
            
            // Convertir a DTO de respuesta
            return convertirAResponseDTO(encuestaGuardada);
            
        } catch (Exception e) {
            log.error("🔍 [ENCUESTA-SERVICE] Error enviando encuesta: {}", e.getMessage(), e);
            throw new RuntimeException("Error al enviar encuesta: " + e.getMessage());
        }
    }

    public List<EncuestaSatisfaccionResponseDTO> obtenerEncuestasPorTicket(Long ticketId) {
        log.info("🔍 [ENCUESTA-SERVICE] Obteniendo encuestas para ticket: {}", ticketId);
        
        try {
            List<EncuestaSatisfaccion> encuestas = encuestaRepository.findByTicketIdAndActivoTrue(ticketId);
            log.info("🔍 [ENCUESTA-SERVICE] Encontradas {} encuestas para ticket {}", encuestas.size(), ticketId);
            
            return encuestas.stream()
                    .map(this::convertirAResponseDTO)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            log.error("🔍 [ENCUESTA-SERVICE] Error obteniendo encuestas: {}", e.getMessage(), e);
            throw new RuntimeException("Error al obtener encuestas: " + e.getMessage());
        }
    }

    public Map<String, Object> obtenerEstadisticasSatisfaccion() {
        log.info("🔍 [ENCUESTA-SERVICE] Obteniendo estadísticas de satisfacción");
        
        try {
            // Calcular promedio general
            Double promedioGeneral = encuestaRepository.calcularPromedioCalificaciones();
            
            // Contar encuestas por calificación
            List<Object[]> conteosPorCalificacion = encuestaRepository.contarEncuestasPorCalificacion();
            
            // Obtener encuestas recientes
            List<EncuestaSatisfaccion> encuestasRecientes = encuestaRepository.findTop10ByActivoTrueOrderByFechaCreacionDesc();
            
            // Calcular total de encuestas
            long totalEncuestas = encuestaRepository.count();
            
            Map<String, Object> estadisticas = Map.of(
                "promedioGeneral", promedioGeneral != null ? promedioGeneral : 0.0,
                "totalEncuestas", totalEncuestas,
                "conteosPorCalificacion", conteosPorCalificacion,
                "encuestasRecientes", encuestasRecientes.stream()
                        .map(this::convertirAResponseDTO)
                        .collect(Collectors.toList())
            );
            
            log.info("🔍 [ENCUESTA-SERVICE] Estadísticas calculadas: {}", estadisticas);
            return estadisticas;
            
        } catch (Exception e) {
            log.error("🔍 [ENCUESTA-SERVICE] Error calculando estadísticas: {}", e.getMessage(), e);
            throw new RuntimeException("Error al calcular estadísticas: " + e.getMessage());
        }
    }
    
    private EncuestaSatisfaccionResponseDTO convertirAResponseDTO(EncuestaSatisfaccion encuesta) {
        return EncuestaSatisfaccionResponseDTO.builder()
                .id(encuesta.getId())
                .ticketId(encuesta.getTicket().getId())
                .ticketAsunto(encuesta.getTicket().getAsunto())
                .calificacion(encuesta.getCalificacion())
                .comentario(encuesta.getComentario())
                .aspectosPositivos(convertirJsonALista(encuesta.getAspectosPositivos()))
                .aspectosNegativos(convertirJsonALista(encuesta.getAspectosNegativos()))
                .nombreUsuario(encuesta.getUsuario().getNombreCompleto())
                .emailUsuario(encuesta.getUsuario().getEmail())
                .fechaCreacion(encuesta.getFechaCreacion())
                .nivelSatisfaccion(encuesta.getNivelSatisfaccion())
                .build();
    }
    
    private String convertirListaAJson(List<String> lista) {
        try {
            return objectMapper.writeValueAsString(lista);
        } catch (JsonProcessingException e) {
            log.warn("Error convirtiendo lista a JSON: {}", e.getMessage());
            return "[]";
        }
    }
    
    private List<String> convertirJsonALista(String json) {
        try {
            return objectMapper.readValue(json, List.class);
        } catch (JsonProcessingException e) {
            log.warn("Error convirtiendo JSON a lista: {}", e.getMessage());
            return List.of();
        }
    }
}






