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
import java.util.Comparator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
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
            .filter(ticket -> {
                try {
                    return ticket != null && ticket.getId() != null;
                } catch (Exception e) {
                    log.warn("⚠️ [ADMIN] Ticket con datos inválidos ignorado: {}", e.getMessage());
                    return false;
                }
            })
            .map(ticket -> {
                try {
                    return convertirTicketAResponseDTO(ticket);
                } catch (Exception e) {
                    log.error("❌ [ADMIN] Error convirtiendo ticket {}: {}", ticket.getId(), e.getMessage());
                    // Crear un DTO básico para tickets con errores
                    return new TicketResponseDTO(
                        ticket.getId(),
                        "Ticket con datos incompletos",
                        "Este ticket tiene datos faltantes y no se puede mostrar completamente",
                        "MEDIA",
                        ticket.getEstado() != null ? ticket.getEstado() : "DESCONOCIDO",
                        null, // creadorEmail
                        "Usuario Desconocido", // creadorNombre
                        null, // tecnicoEmail
                        null, // tecnicoNombre
                        ticket.getFechaCreacion() != null ? ticket.getFechaCreacion() : LocalDateTime.now(),
                        ticket.getFechaActualizacion() != null ? ticket.getFechaActualizacion() : LocalDateTime.now(),
                        "Usuario Desconocido", // creadorNombreCompleto
                        ticket.getUbicacion() != null ? ticket.getUbicacion() : "Ubicación no especificada",
                        "Ticket con datos incompletos", // consulta
                        "General", // categoria
                        null, // archivoAdjunto
                        null, // nombreArchivo
                        new ArrayList<>(), // evidencias
                        new ArrayList<>(), // historialEstados
                        new ArrayList<>(), // historialAsignaciones
                        new ArrayList<>(), // comentarios
                        null // archivosConversacion
                    );
                }
            })
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
            .filter(ticket -> {
                try {
                    return ticket != null && ticket.getId() != null;
                } catch (Exception e) {
                    log.warn("⚠️ [ADMIN] Ticket con datos inválidos ignorado: {}", e.getMessage());
                    return false;
                }
            })
            .map(ticket -> {
                try {
                    return convertirTicketAResponseDTO(ticket);
                } catch (Exception e) {
                    log.error("❌ [ADMIN] Error convirtiendo ticket {}: {}", ticket.getId(), e.getMessage());
                    // Crear un DTO básico para tickets con errores
                    return new TicketResponseDTO(
                        ticket.getId(),
                        "Ticket con datos incompletos",
                        "Este ticket tiene datos faltantes y no se puede mostrar completamente",
                        "MEDIA",
                        ticket.getEstado() != null ? ticket.getEstado() : "DESCONOCIDO",
                        null, // creadorEmail
                        "Usuario Desconocido", // creadorNombre
                        null, // tecnicoEmail
                        null, // tecnicoNombre
                        ticket.getFechaCreacion() != null ? ticket.getFechaCreacion() : LocalDateTime.now(),
                        ticket.getFechaActualizacion() != null ? ticket.getFechaActualizacion() : LocalDateTime.now(),
                        "Usuario Desconocido", // creadorNombreCompleto
                        ticket.getUbicacion() != null ? ticket.getUbicacion() : "Ubicación no especificada",
                        "Ticket con datos incompletos", // consulta
                        "General", // categoria
                        null, // archivoAdjunto
                        null, // nombreArchivo
                        new ArrayList<>(), // evidencias
                        new ArrayList<>(), // historialEstados
                        new ArrayList<>(), // historialAsignaciones
                        new ArrayList<>(), // comentarios
                        null // archivosConversacion
                    );
                }
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Obtener tickets sin asignar
     */
    public List<TicketResponseDTO> obtenerTicketsSinAsignar() {
        log.info("Obteniendo tickets sin asignar");
        
        List<Ticket> tickets = ticketRepository.findByTecnicoAsignadoIsNull();
        
        return tickets.stream()
            .filter(ticket -> {
                try {
                    return ticket != null && ticket.getId() != null;
                } catch (Exception e) {
                    log.warn("⚠️ [ADMIN] Ticket con datos inválidos ignorado: {}", e.getMessage());
                    return false;
                }
            })
            .map(ticket -> {
                try {
                    return convertirTicketAResponseDTO(ticket);
                } catch (Exception e) {
                    log.error("❌ [ADMIN] Error convirtiendo ticket {}: {}", ticket.getId(), e.getMessage());
                    // Crear un DTO básico para tickets con errores
                    return new TicketResponseDTO(
                        ticket.getId(),
                        "Ticket con datos incompletos",
                        "Este ticket tiene datos faltantes y no se puede mostrar completamente",
                        "MEDIA",
                        ticket.getEstado() != null ? ticket.getEstado() : "DESCONOCIDO",
                        null, // creadorEmail
                        "Usuario Desconocido", // creadorNombre
                        null, // tecnicoEmail
                        null, // tecnicoNombre
                        ticket.getFechaCreacion() != null ? ticket.getFechaCreacion() : LocalDateTime.now(),
                        ticket.getFechaActualizacion() != null ? ticket.getFechaActualizacion() : LocalDateTime.now(),
                        "Usuario Desconocido", // creadorNombreCompleto
                        ticket.getUbicacion() != null ? ticket.getUbicacion() : "Ubicación no especificada",
                        "Ticket con datos incompletos", // consulta
                        "General", // categoria
                        null, // archivoAdjunto
                        null, // nombreArchivo
                        new ArrayList<>(), // evidencias
                        new ArrayList<>(), // historialEstados
                        new ArrayList<>(), // historialAsignaciones
                        new ArrayList<>(), // comentarios
                        null // archivosConversacion
                    );
                }
            })
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
            .filter(ticket -> {
                try {
                    return ticket != null && ticket.getId() != null;
                } catch (Exception e) {
                    log.warn("⚠️ [ADMIN] Ticket con datos inválidos ignorado: {}", e.getMessage());
                    return false;
                }
            })
            .map(ticket -> {
                try {
                    return convertirTicketAResponseDTO(ticket);
                } catch (Exception e) {
                    log.error("❌ [ADMIN] Error convirtiendo ticket {}: {}", ticket.getId(), e.getMessage());
                    // Crear un DTO básico para tickets con errores
                    return new TicketResponseDTO(
                        ticket.getId(),
                        "Ticket con datos incompletos",
                        "Este ticket tiene datos faltantes y no se puede mostrar completamente",
                        "MEDIA",
                        ticket.getEstado() != null ? ticket.getEstado() : "DESCONOCIDO",
                        null, // creadorEmail
                        "Usuario Desconocido", // creadorNombre
                        null, // tecnicoEmail
                        null, // tecnicoNombre
                        ticket.getFechaCreacion() != null ? ticket.getFechaCreacion() : LocalDateTime.now(),
                        ticket.getFechaActualizacion() != null ? ticket.getFechaActualizacion() : LocalDateTime.now(),
                        "Usuario Desconocido", // creadorNombreCompleto
                        ticket.getUbicacion() != null ? ticket.getUbicacion() : "Ubicación no especificada",
                        "Ticket con datos incompletos", // consulta
                        "General", // categoria
                        null, // archivoAdjunto
                        null, // nombreArchivo
                        new ArrayList<>(), // evidencias
                        new ArrayList<>(), // historialEstados
                        new ArrayList<>(), // historialAsignaciones
                        new ArrayList<>(), // comentarios
                        null // archivosConversacion
                    );
                }
            })
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
        
        // Obtener historial de asignaciones directamente del repositorio
        List<com.example.demo.asignacion.model.AsignacionTicket> asignacionesTicket = asignacionService.obtenerAsignacionesPorTicket(ticket.getId())
            .stream()
            .map(dto -> {
                // Crear entidad básica con los datos disponibles
                com.example.demo.asignacion.model.AsignacionTicket asignacion = new com.example.demo.asignacion.model.AsignacionTicket();
                asignacion.setId(dto.getId());
                asignacion.setTicketId(dto.getTicketId());
                asignacion.setTecnicoId(dto.getTecnicoId());
                asignacion.setFechaAsignacion(dto.getFechaAsignacion());
                asignacion.setTipoOperacion(dto.getTipoOperacion());
                asignacion.setActiva(dto.getActiva());
                return asignacion;
            })
            .collect(Collectors.toList());
        
        List<com.example.demo.asignacion.dto.response.AsignacionResponseDTO> historialAsignacionesDTO = asignacionesTicket.stream()
            .map(this::convertirAsignacionTicketAResponseDTO)
            .collect(Collectors.toList());
        
        // Obtener el técnico asignado ACTUAL (última asignación por fecha)
        com.example.demo.usuario.model.Usuario tecnicoActual = null;
        
        // Debug logs
        System.out.println("🔍 [ADMIN DEBUG] Ticket ID: " + ticket.getId());
        System.out.println("🔍 [ADMIN DEBUG] Asignaciones ticket: " + asignacionesTicket.size());
        for (com.example.demo.asignacion.model.AsignacionTicket at : asignacionesTicket) {
            System.out.println("🔍 [ADMIN DEBUG] - Asignación: " + at.getTipoOperacion() + ", Técnico ID: " + at.getTecnicoId() + ", Fecha: " + at.getFechaAsignacion());
        }
        
        if (!asignacionesTicket.isEmpty()) {
            // Obtener la última asignación por fecha
            com.example.demo.asignacion.model.AsignacionTicket ultimaAsignacion = asignacionesTicket.stream()
                .max(Comparator.comparing(com.example.demo.asignacion.model.AsignacionTicket::getFechaAsignacion))
                .orElse(null);
            
            System.out.println("🔍 [ADMIN DEBUG] Última asignación: " + (ultimaAsignacion != null ? ultimaAsignacion.getTipoOperacion() + " - Técnico ID: " + ultimaAsignacion.getTecnicoId() : "null"));
            
            if (ultimaAsignacion != null) {
                tecnicoActual = usuarioRepository.findById(ultimaAsignacion.getTecnicoId()).orElse(null);
                System.out.println("🔍 [ADMIN DEBUG] Técnico actual encontrado: " + (tecnicoActual != null ? tecnicoActual.getNombre() + " " + tecnicoActual.getApellido() : "null"));
            }
        }
        
        // Si no hay asignación, usar el técnico del ticket
        if (tecnicoActual == null) {
            tecnicoActual = ticket.getTecnicoAsignado();
            System.out.println("🔍 [ADMIN DEBUG] Usando técnico del ticket: " + (tecnicoActual != null ? tecnicoActual.getNombre() + " " + tecnicoActual.getApellido() : "null"));
        }
        
        System.out.println("🔍 [ADMIN DEBUG] Técnico final seleccionado: " + (tecnicoActual != null ? tecnicoActual.getNombre() + " " + tecnicoActual.getApellido() : "null"));
        
        return new TicketResponseDTO(
            ticket.getId(),
            ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : ticket.getCategoriaString(), // asunto = solo categoría
            ticket.getDescripcion(),
            ticket.getPrioridad(),
            ticket.getEstado(),
            ticket.getCreadorEmail(), // Usar método seguro
            ticket.getCreadorNombre(), // Usar método seguro
            tecnicoActual != null ? tecnicoActual.getEmail() : null,
            tecnicoActual != null ? tecnicoActual.getNombre() + " " + tecnicoActual.getApellido() : null,
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
            .ticketId(evidencia.getTicket() != null ? evidencia.getTicket().getId() : null)
            .tipoEvidencia(evidencia.getTipoEvidencia())
            .descripcion(evidencia.getDescripcion())
            .nombreArchivo(evidencia.getNombreArchivo())
            .extensionArchivo(evidencia.getExtensionArchivo())
            .tamanioArchivo(evidencia.getTamanioArchivo())
            .urlArchivo(evidencia.getUrlArchivo())
            .fechaSubida(evidencia.getFechaSubida())
            .subidoPor(evidencia.getSubidoPor() != null ? evidencia.getSubidoPor().getNombreCompleto() : "Usuario Desconocido")
            .subidoPorEmail(evidencia.getSubidoPor() != null ? evidencia.getSubidoPor().getEmail() : null)
            .build();
    }
    
    private com.example.demo.ticket.dto.response.HistorialEstadoResponseDTO convertirHistorialAResponseDTO(HistorialEstadoTicket historial) {
        return com.example.demo.ticket.dto.response.HistorialEstadoResponseDTO.builder()
            .idHistorial(historial.getIdHistorial())
            .ticketId(historial.getTicket() != null ? historial.getTicket().getId() : null)
            .estadoAnterior(historial.getEstadoAnterior())
            .estadoNuevo(historial.getEstadoNuevo())
            .comentario(historial.getComentario())
            .observaciones(historial.getObservaciones())
            .fechaCambio(historial.getFechaCambio())
            .cambiadoPor(historial.getCambiadoPor() != null ? historial.getCambiadoPor().getNombreCompleto() : "Usuario Desconocido")
            .cambiadoPorEmail(historial.getCambiadoPor() != null ? historial.getCambiadoPor().getEmail() : null)
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
    
    private com.example.demo.asignacion.dto.response.AsignacionResponseDTO convertirAsignacionTicketAResponseDTO(com.example.demo.asignacion.model.AsignacionTicket asignacion) {
        // Obtener información del técnico desde la base de datos
        String tecnicoNombre = "Técnico";
        String tecnicoEmail = "tecnico@alcaldia.gov.co";
        if (asignacion.getTecnicoId() != null) {
            Optional<Usuario> tecnicoOpt = usuarioRepository.findById(asignacion.getTecnicoId());
            if (tecnicoOpt.isPresent()) {
                Usuario tecnico = tecnicoOpt.get();
                tecnicoNombre = tecnico.getNombre() + " " + tecnico.getApellido();
                tecnicoEmail = tecnico.getEmail();
            }
        }
        
        return com.example.demo.asignacion.dto.response.AsignacionResponseDTO.builder()
            .id(asignacion.getId())
            .ticketId(asignacion.getTicketId())
            .ticketAsunto("Ticket #" + asignacion.getTicketId())
            .ticketEstado("ASIGNADO") // Estado genérico
            .tecnicoId(asignacion.getTecnicoId())
            .tecnicoNombre(tecnicoNombre)
            .tecnicoEmail(tecnicoEmail)
            .comentario(asignacion.getComentario())
            .fechaAsignacion(asignacion.getFechaAsignacion())
            // asignadoPor no está disponible en AsignacionResponseDTO
            .tipoOperacion(asignacion.getTipoOperacion())
            // esEscalacion no está disponible en AsignacionResponseDTO
            .activa(asignacion.getActiva())
            .build();
    }
}