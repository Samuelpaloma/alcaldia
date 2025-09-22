package com.example.demo.admin.service;

import com.example.demo.ticket.dto.response.TicketResponseDTO;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.admin.dto.response.EstadisticasAdminResponseDTO;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.evidencia.model.Evidencia;
import com.example.demo.evidencia.repository.EvidenciaRepository;
import com.example.demo.ticket.model.HistorialEstadoTicket;
import com.example.demo.ticket.repository.HistorialEstadoTicketRepository;
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
@Transactional(readOnly = true)
@Slf4j
public class AdminService {
    
    private final TicketRepository ticketRepository;
    private final EvidenciaRepository evidenciaRepository;
    private final HistorialEstadoTicketRepository historialRepository;
    private final UsuarioRepository usuarioRepository;
    
    /**
     * Obtener todos los tickets con evidencias e historial
     */
    public List<TicketResponseDTO> obtenerTodosLosTickets() {
        log.info("Obteniendo todos los tickets para admin");
        
        List<Ticket> tickets = ticketRepository.findAll();
        
        return tickets.stream()
            .map(this::convertirTicketAResponseDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtener ticket específico con evidencias e historial
     */
    public TicketResponseDTO obtenerTicketDetallado(Long ticketId) {
        log.info("Obteniendo ticket detallado {} para admin", ticketId);
        
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        return convertirTicketAResponseDTO(ticket);
    }
    
    /**
     * Obtener tickets por estado
     */
    public List<TicketResponseDTO> obtenerTicketsPorEstado(String estado) {
        log.info("Obteniendo tickets por estado: {}", estado);
        
        List<Ticket> tickets = ticketRepository.findByEstado(estado);
        
        return tickets.stream()
            .map(this::convertirTicketAResponseDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtener tickets sin asignar
     */
    public List<TicketResponseDTO> obtenerTicketsSinAsignar() {
        log.info("Obteniendo tickets sin asignar");
        
        List<Ticket> tickets = ticketRepository.findByTecnicoAsignadoIsNull();
        
        return tickets.stream()
            .map(this::convertirTicketAResponseDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtener tickets asignados a un técnico específico
     */
    public List<TicketResponseDTO> obtenerTicketsPorTecnico(Long tecnicoId) {
        log.info("Obteniendo tickets del técnico: {}", tecnicoId);
        
        Usuario tecnico = usuarioRepository.findById(tecnicoId)
            .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));
        
        List<Ticket> tickets = ticketRepository.findByTecnicoAsignado(tecnico);
        
        return tickets.stream()
            .map(this::convertirTicketAResponseDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtener estadísticas generales
     */
    public EstadisticasAdminResponseDTO obtenerEstadisticasGenerales() {
        log.info("Obteniendo estadísticas generales");
        
        long totalTickets = ticketRepository.count();
        long ticketsPendientes = ticketRepository.countByEstado("PENDIENTE");
        long ticketsAsignados = ticketRepository.countByEstado("ASIGNADO");
        long ticketsEnEjecucion = ticketRepository.countByEstado("EN_EJECUCION");
        long ticketsTerminados = ticketRepository.countByEstado("TERMINADO");
        long ticketsSinAsignar = ticketRepository.findByTecnicoAsignadoIsNull().size();
        
        return EstadisticasAdminResponseDTO.builder()
            .totalTickets(totalTickets)
            .ticketsPendientes(ticketsPendientes)
            .ticketsAsignados(ticketsAsignados)
            .ticketsEnEjecucion(ticketsEnEjecucion)
            .ticketsTerminados(ticketsTerminados)
            .ticketsSinAsignar(ticketsSinAsignar)
            .fechaConsulta(LocalDateTime.now())
            .build();
    }
    
    /**
     * Obtener estadísticas por técnico
     */
    public List<Object> obtenerEstadisticasPorTecnico() {
        log.info("Obteniendo estadísticas por técnico");
        
        // Aquí podrías implementar lógica para obtener estadísticas por técnico
        // Por ahora retorno una lista vacía
        return List.of();
    }
    
    // ========== MÉTODOS AUXILIARES ==========
    
    private TicketResponseDTO convertirTicketAResponseDTO(Ticket ticket) {
        // Obtener evidencias
        List<Evidencia> evidencias = evidenciaRepository.findActivasByTicket(ticket);
        List<com.example.demo.ticket.dto.response.EvidenciaResponseDTO> evidenciasDTO = evidencias.stream()
            .map(this::convertirEvidenciaAResponseDTO)
            .collect(Collectors.toList());
        
        // Obtener historial de estados
        List<HistorialEstadoTicket> historial = historialRepository.findByTicketOrderByFechaCambioDesc(ticket);
        List<com.example.demo.ticket.dto.response.HistorialEstadoResponseDTO> historialDTO = historial.stream()
            .map(this::convertirHistorialAResponseDTO)
            .collect(Collectors.toList());
        
        return new TicketResponseDTO(
            ticket.getId(),
            ticket.getConsulta(), // Usar consulta como asunto
            ticket.getDescripcion(),
            ticket.getPrioridad(),
            ticket.getEstado(),
            ticket.getCreador().getEmail(),
            ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getEmail() : null,
            ticket.getFechaCreacion(),
            ticket.getFechaActualizacion(),
            ticket.getCreador().getNombreCompleto(),
            ticket.getUbicacion(),
            ticket.getConsulta(),
            ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : ticket.getCategoriaString(),
            ticket.getArchivoAdjunto(),
            ticket.getNombreArchivo(),
            evidenciasDTO,
            historialDTO
        );
    }
    
    private com.example.demo.ticket.dto.response.EvidenciaResponseDTO convertirEvidenciaAResponseDTO(Evidencia evidencia) {
        return com.example.demo.ticket.dto.response.EvidenciaResponseDTO.builder()
            .idEvidencia(evidencia.getIdEvidencia())
            .ticketId(evidencia.getTicket().getId())
            .tipoEvidencia(evidencia.getTipoEvidencia())
            .descripcion(evidencia.getDescripcion())
            .nombreArchivo(evidencia.getNombreArchivo())
            .extensionArchivo(evidencia.getExtensionArchivo())
            .tamanioArchivo(evidencia.getTamanioArchivo())
            .urlArchivo(evidencia.getUrlArchivo())
            .fechaSubida(evidencia.getFechaSubida())
            .subidoPor(evidencia.getSubidoPor().getNombreCompleto())
            .subidoPorEmail(evidencia.getSubidoPor().getEmail())
            .build();
    }
    
    private com.example.demo.ticket.dto.response.HistorialEstadoResponseDTO convertirHistorialAResponseDTO(HistorialEstadoTicket historial) {
        return com.example.demo.ticket.dto.response.HistorialEstadoResponseDTO.builder()
            .idHistorial(historial.getIdHistorial())
            .ticketId(historial.getTicket().getId())
            .estadoAnterior(historial.getEstadoAnterior())
            .estadoNuevo(historial.getEstadoNuevo())
            .comentario(historial.getComentario())
            .observaciones(historial.getObservaciones())
            .fechaCambio(historial.getFechaCambio())
            .cambiadoPor(historial.getCambiadoPor().getNombreCompleto())
            .cambiadoPorEmail(historial.getCambiadoPor().getEmail())
            .tipoUsuario(historial.getTipoUsuario())
            .build();
    }
}
