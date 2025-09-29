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
import com.example.demo.asignacion.repository.HistorialAsignacionRepository;
import com.example.demo.asignacion.model.HistorialAsignacion;
import lombok.RequiredArgsConstructor;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final HistorialAsignacionRepository historialAsignacionRepository;
    private final com.example.demo.asignacion.service.AsignacionService asignacionService;
    
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
        
        // Obtener historial de asignaciones
        List<HistorialAsignacion> historialAsignaciones = historialAsignacionRepository.findByTicketIdOrderByFechaOperacionAsc(ticket.getId());
        List<com.example.demo.asignacion.dto.response.AsignacionResponseDTO> historialAsignacionesDTO = historialAsignaciones.stream()
            .map(this::convertirHistorialAsignacionAResponseDTO)
            .collect(Collectors.toList());
        
        // Obtener el técnico asignado original (primera asignación)
        com.example.demo.usuario.model.Usuario tecnicoOriginal = asignacionService.obtenerTecnicoAsignadoOriginal(ticket.getId());
        
        return new TicketResponseDTO(
            ticket.getId(),
            ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : ticket.getCategoriaString(), // asunto = solo categoría
            ticket.getDescripcion(),
            ticket.getPrioridad(),
            ticket.getEstado(),
            ticket.getCreadorEmail(), // Usar método seguro
            ticket.getCreadorNombre(), // Usar método seguro
            tecnicoOriginal != null ? tecnicoOriginal.getEmail() : null,
            tecnicoOriginal != null ? tecnicoOriginal.getNombre() + " " + tecnicoOriginal.getApellido() : null,
            ticket.getFechaCreacion(),
            ticket.getFechaActualizacion(),
            ticket.getCreadorNombre(), // Usar método seguro
            ticket.getUbicacion(),
            ticket.getConsulta(), // consulta completa para descripción
            ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : ticket.getCategoriaString(),
            ticket.getArchivoAdjunto(),
            ticket.getNombreArchivo(),
            evidenciasDTO,
            historialDTO,
            historialAsignacionesDTO,
            new ArrayList<>(), // comentarios vacío por ahora
            null // archivosConversacion - no necesario en el enfoque simplificado
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
    
    private com.example.demo.asignacion.dto.response.AsignacionResponseDTO convertirHistorialAsignacionAResponseDTO(HistorialAsignacion historial) {
        // Obtener información del técnico desde la base de datos
        String tecnicoNombre = "Técnico";
        String tecnicoEmail = "tecnico@alcaldia.gov.co";
        if (historial.getTecnicoId() != null) {
            Optional<Usuario> tecnicoOpt = usuarioRepository.findById(historial.getTecnicoId());
            if (tecnicoOpt.isPresent()) {
                Usuario tecnico = tecnicoOpt.get();
                tecnicoNombre = tecnico.getNombre() + " " + tecnico.getApellido();
                tecnicoEmail = tecnico.getEmail();
            }
        }
        
        // Determinar el texto correcto según el tipo de operación
        String descripcionOperacion;
        switch (historial.getTipoOperacion().toUpperCase()) {
            case "ASIGNACION":
                descripcionOperacion = "Asignado a " + tecnicoNombre;
                break;
            case "REASIGNACION":
                descripcionOperacion = "Reasignado a " + tecnicoNombre;
                break;
            case "ESCALAMIENTO":
                descripcionOperacion = "Escalado a " + tecnicoNombre;
                break;
            case "DESASIGNACION":
                descripcionOperacion = "Desasignado";
                break;
            default:
                descripcionOperacion = "Operación: " + historial.getTipoOperacion();
                break;
        }
        
        return com.example.demo.asignacion.dto.response.AsignacionResponseDTO.builder()
            .ticketId(historial.getTicketId())
            .ticketAsunto(descripcionOperacion)
            .tecnicoId(historial.getTecnicoId())
            .tecnicoNombre(tecnicoNombre)
            .tecnicoEmail(tecnicoEmail)
            .comentario(historial.getComentario())
            .fechaAsignacion(historial.getFechaOperacion() != null ? historial.getFechaOperacion() : historial.getFechaAccion())
            .activa(false)
            .tipoOperacion(historial.getTipoOperacion())
            .build();
    }
}