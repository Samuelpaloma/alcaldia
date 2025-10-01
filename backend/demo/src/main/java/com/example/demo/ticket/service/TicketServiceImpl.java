package com.example.demo.ticket.service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.ticket.dto.request.TicketRequestDTO;
import com.example.demo.ticket.dto.response.HistorialTicketResponseDTO;
import com.example.demo.ticket.dto.response.TicketResponseDTO;
import com.example.demo.ticket.dto.response.EvidenciaResponseDTO;
import com.example.demo.ticket.dto.response.HistorialEstadoResponseDTO;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.example.demo.categoria.model.Categoria;
import com.example.demo.categoria.service.CategoriaService;
import com.example.demo.categoria.dto.response.CategoriaSimpleDTO;
import com.example.demo.categoria.dto.response.CategoriaResponseDTO;
import com.example.demo.notificacion.service.NotificationRoleService;
import com.example.demo.evidencia.model.Evidencia;
import com.example.demo.evidencia.repository.EvidenciaRepository;
import com.example.demo.ticket.model.HistorialEstadoTicket;
import com.example.demo.ticket.repository.HistorialEstadoTicketRepository;
import com.example.demo.asignacion.model.HistorialAsignacion;
import com.example.demo.asignacion.repository.HistorialAsignacionRepository;
import com.example.demo.asignacion.dto.response.AsignacionResponseDTO;
import com.example.demo.ticket.dto.response.ComentarioResponseDTO;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.UUID;

@Service
public class TicketServiceImpl implements TicketService {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private CategoriaService categoriaService;
    
    @Autowired
    private EvidenciaRepository evidenciaRepository;
    
    @Autowired
    private HistorialEstadoTicketRepository historialRepository;
    
    @Autowired
    private HistorialAsignacionRepository historialAsignacionRepository;
    
    @Autowired
    private com.example.demo.asignacion.service.AsignacionService asignacionService;
    
    @Autowired
    private NotificationRoleService notificationRoleService;
    
    @Autowired
    private ComentarioService comentarioService;
    
    @Autowired
    private ArchivoTicketService archivoTicketService;
    
    @Autowired
    private com.example.demo.sla.service.SLAAutomationService slaAutomationService;
    

    @Override
    @Transactional
    public TicketResponseDTO crearTicket(TicketRequestDTO request, String emailUsuario) {
        System.out.println("🔔 [DEBUG] ===== TICKET SERVICE IMPL - CREAR TICKET =====");
        System.out.println("🔔 [DEBUG] Email usuario: " + emailUsuario);
        System.out.println("🔔 [DEBUG] Request: " + request);
        
        // Buscar usuario creador
        Usuario creador = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Buscar categoría por ID
        CategoriaResponseDTO categoriaResponse = categoriaService.obtenerCategoriaPorId(request.getCategoriaId());
        Categoria categoria = new Categoria();
        categoria.setId(categoriaResponse.getId());
        categoria.setNombre(categoriaResponse.getNombre());
        
        // Crear ticket con todos los campos del formulario
        Ticket ticket = new Ticket();
        // El nombre se obtiene automáticamente del usuario logueado
        ticket.setUbicacion(request.getUbicacion());
        // Establecer tanto consulta como descripción
        ticket.setConsulta(request.getConsulta());
        // La descripción debe contener el mensaje completo (consulta + categoría)
        ticket.setDescripcion(request.getConsulta() != null && !request.getConsulta().trim().isEmpty() 
            ? request.getConsulta() 
            : categoria.getNombre());
        ticket.setCategoria(categoria);
        ticket.setCategoriaString(categoria.getNombre()); // Para compatibilidad
        ticket.setCategoriaNombre(categoria.getNombre()); // Campo requerido por la tabla
        ticket.setPrioridad(request.getPrioridad() != null ? request.getPrioridad() : "MEDIA");
        ticket.setEstado("PENDIENTE");
        ticket.setCreador(creador);
        
        // Guardar ticket
        ticketRepository.save(ticket);
        
        // Procesar ticket con SLA y automatización integrada
        try {
            slaAutomationService.procesarTicketCreado(ticket);
        } catch (Exception e) {
            System.err.println("⚠️ [DEBUG] Error procesando SLA y automatización para ticket: " + e.getMessage());
        }

        // Manejar archivo adjunto si existe - usar el nuevo sistema de múltiples archivos
        System.out.println("🔍 [DEBUG] Verificando archivo adjunto...");
        System.out.println("🔍 [DEBUG] archivoAdjunto: " + (request.getArchivoAdjunto() != null ? "Presente" : "Ausente"));
        System.out.println("🔍 [DEBUG] nombreArchivo: " + request.getNombreArchivo());
        
        if (request.getArchivoAdjunto() != null && request.getNombreArchivo() != null) {
            try {
                System.out.println("🔍 [DEBUG] Procesando archivo: " + request.getNombreArchivo());
                
                // Determinar tipo MIME basado en la extensión
                String extension = request.getNombreArchivo().substring(request.getNombreArchivo().lastIndexOf('.') + 1);
                String tipoMime = determinarTipoMime(extension);
                
                System.out.println("🔍 [DEBUG] Extension: " + extension + ", Tipo MIME: " + tipoMime);
                
                // Usar el servicio de archivos múltiples
                archivoTicketService.subirArchivo(
                    ticket.getId(),
                    request.getNombreArchivo().substring(0, request.getNombreArchivo().lastIndexOf('.')), // nombre sin extensión
                    tipoMime,
                    (long) request.getArchivoAdjunto().length() * 3 / 4, // estimación del tamaño
                    extension,
                    request.getArchivoAdjunto(),
                    "Archivo adjunto al crear el ticket",
                    emailUsuario
                );
                
                System.out.println("✅ [DEBUG] Archivo subido exitosamente");
            } catch (Exception e) {
                System.err.println("❌ [DEBUG] Error guardando archivo: " + e.getMessage());
                e.printStackTrace();
                // Continuar sin archivo si hay error
            }
        } else {
            System.out.println("🔍 [DEBUG] No hay archivo adjunto para procesar");
        }
        
        // Enviar notificación inteligente a los administradores
        // NOTIFICACIONES: Solo usar el sistema de roles unificado
        try {
            // Solo notificar si el creador NO es SuperAdmin (evitar auto-notificaciones)
            if (creador != null && !"Super Administrador".equals(creador.getNombre() + " " + creador.getApellido())) {
                System.out.println("🔔 [DEBUG] Enviando notificación de creación de ticket para: " + creador.getEmail());
                notificationRoleService.notificarCreacionTicket(ticket.getId(), creador.getIdUsuario());
            } else {
                System.out.println("🔔 [DEBUG] Saltando notificación - creador es SuperAdmin");
            }
        } catch (Exception e) {
            System.err.println("❌ Error enviando notificación: " + e.getMessage());
            e.printStackTrace();
        }

        return convertirTicketAResponseDTO(ticket);
    }

    @Override
    public TicketResponseDTO obtenerTicketParaSeguimiento(Long ticketId, String emailUsuario) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // Verificar que el usuario tenga acceso al ticket
        String creadorEmail = ticket.getCreadorEmail();
        if (creadorEmail == null || !creadorEmail.equals(emailUsuario)) {
            throw new RuntimeException("No tienes permisos para ver este ticket");
        }

        // Debug logs
        System.out.println("🔍 [SEGUIMIENTO DEBUG] Ticket ID: " + ticket.getId());
        System.out.println("🔍 [SEGUIMIENTO DEBUG] Estado: " + ticket.getEstado());
        System.out.println("🔍 [SEGUIMIENTO DEBUG] Técnico asignado: " + (ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getEmail() : "null"));
        System.out.println("🔍 [SEGUIMIENTO DEBUG] Técnico nombre: " + (ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getNombre() + " " + ticket.getTecnicoAsignado().getApellido() : "null"));
        System.out.println("🔍 [SEGUIMIENTO DEBUG] Técnico ID: " + (ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getIdUsuario() : "null"));
        System.out.println("🔍 [SEGUIMIENTO DEBUG] Fecha actualización: " + ticket.getFechaActualizacion());

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
                .map(this::convertirTicketAResponseDTOBasico)
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
        // Obtener categorías dinámicamente del servicio
        List<CategoriaSimpleDTO> categorias = categoriaService.obtenerCategoriasActivas();
        return categorias.stream()
                .map(CategoriaSimpleDTO::getNombre)
                .collect(Collectors.toList());
    }

    @Override
    public String obtenerNombreUsuario(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + emailUsuario));
        return usuario.getNombre();
    }

    // Métodos auxiliares
    private TicketResponseDTO convertirTicketAResponseDTOBasico(Ticket ticket) {
        // Usar el técnico actualmente asignado (no el original)
        Usuario tecnicoActual = ticket.getTecnicoAsignado();
        
        // Debug logs
        System.out.println("🔍 [TICKET DEBUG] Ticket ID: " + ticket.getId());
        System.out.println("🔍 [TICKET DEBUG] Estado: " + ticket.getEstado());
        System.out.println("🔍 [TICKET DEBUG] Técnico asignado: " + (tecnicoActual != null ? tecnicoActual.getEmail() : "null"));
        System.out.println("🔍 [TICKET DEBUG] Técnico nombre: " + (tecnicoActual != null ? tecnicoActual.getNombre() + " " + tecnicoActual.getApellido() : "null"));
        System.out.println("🔍 [TICKET DEBUG] Técnico ID: " + (tecnicoActual != null ? tecnicoActual.getIdUsuario() : "null"));
        System.out.println("🔍 [TICKET DEBUG] Fecha actualización: " + ticket.getFechaActualizacion());
        
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
                null, // evidencias
                null, // historialEstados
                null, // historialAsignaciones
                null, // comentarios
                null  // archivosConversacion
        );
    }

    private HistorialTicketResponseDTO convertirTicketAHistorialDTO(Ticket ticket) {
        // Obtener el técnico asignado original (primera asignación)
        Usuario tecnicoOriginal = asignacionService.obtenerTecnicoAsignadoOriginal(ticket.getId());
        
        return new HistorialTicketResponseDTO(
                ticket.getId(),
                ticket.getCreador() != null ? ticket.getCreador().getNombre() : "Usuario Desconocido", // Usar método seguro
                ticket.getUbicacion(),
                ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : ticket.getCategoriaString(),
                ticket.getEstado(),
                ticket.getPrioridad(),
                ticket.getFechaCreacion(),
                ticket.getFechaActualizacion(),
                tecnicoOriginal != null ? tecnicoOriginal.getNombre() + " " + tecnicoOriginal.getApellido() : "Sin asignar"
        );
    }
    
    /**
     * Convertir Ticket a TicketResponseDTO con evidencias e historial
     */
    private TicketResponseDTO convertirTicketAResponseDTO(Ticket ticket) {
        // Obtener evidencias
        List<Evidencia> evidencias = evidenciaRepository.findActivasByTicket(ticket);
        List<EvidenciaResponseDTO> evidenciasDTO = evidencias.stream()
            .map(this::convertirEvidenciaAResponseDTO)
            .collect(Collectors.toList());
        
        // Obtener historial de estados
        List<HistorialEstadoTicket> historial = historialRepository.findByTicketOrderByFechaCambioDesc(ticket);
        List<HistorialEstadoResponseDTO> historialDTO = historial.stream()
            .map(this::convertirHistorialAResponseDTO)
            .collect(Collectors.toList());
        
        // Obtener historial de asignaciones
        List<HistorialAsignacion> historialAsignaciones = historialAsignacionRepository.findByTicketIdOrderByFechaOperacionAsc(ticket.getId());
        List<AsignacionResponseDTO> historialAsignacionesDTO = historialAsignaciones.stream()
            .map(this::convertirHistorialAsignacionAResponseDTO)
            .collect(Collectors.toList());
        
        // Obtener comentarios
        List<ComentarioResponseDTO> comentariosDTO = comentarioService.obtenerComentariosPorTicket(ticket.getId());
        
        // Obtener el técnico asignado ACTUAL (última asignación por fecha)
        Usuario tecnicoActual = null;
        System.out.println("🔍 [TICKET DEBUG] Historial asignaciones encontradas: " + historialAsignaciones.size());
        for (HistorialAsignacion ha : historialAsignaciones) {
            System.out.println("🔍 [TICKET DEBUG] - Asignación: " + ha.getTipoOperacion() + ", Técnico ID: " + ha.getTecnicoId() + ", Fecha: " + ha.getFechaOperacion());
        }
        
        if (!historialAsignaciones.isEmpty()) {
            // Obtener la última asignación por fecha
            HistorialAsignacion ultimaAsignacion = historialAsignaciones.stream()
                .max(Comparator.comparing(HistorialAsignacion::getFechaOperacion))
                .orElse(null);
            
            System.out.println("🔍 [TICKET DEBUG] Última asignación: " + (ultimaAsignacion != null ? ultimaAsignacion.getTipoOperacion() + " - Técnico ID: " + ultimaAsignacion.getTecnicoId() : "null"));
            
            if (ultimaAsignacion != null) {
                tecnicoActual = usuarioRepository.findById(ultimaAsignacion.getTecnicoId()).orElse(null);
                System.out.println("🔍 [TICKET DEBUG] Técnico actual encontrado: " + (tecnicoActual != null ? tecnicoActual.getNombre() + " " + tecnicoActual.getApellido() : "null"));
            }
        }
        
        // Si no hay asignación, usar el técnico del ticket
        if (tecnicoActual == null) {
            tecnicoActual = ticket.getTecnicoAsignado();
            System.out.println("🔍 [TICKET DEBUG] Usando técnico del ticket: " + (tecnicoActual != null ? tecnicoActual.getNombre() + " " + tecnicoActual.getApellido() : "null"));
        }
        
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
            comentariosDTO,
            null // archivosConversacion - no necesario en el enfoque simplificado
        );
    }
    
    private EvidenciaResponseDTO convertirEvidenciaAResponseDTO(Evidencia evidencia) {
        return EvidenciaResponseDTO.builder()
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
    
    private AsignacionResponseDTO convertirHistorialAsignacionAResponseDTO(HistorialAsignacion historial) {
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
        
        return AsignacionResponseDTO.builder()
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
    
    private HistorialEstadoResponseDTO convertirHistorialAResponseDTO(HistorialEstadoTicket historial) {
        return HistorialEstadoResponseDTO.builder()
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
    
    
    /**
     * Determinar el tipo MIME basado en la extensión
     */
    private String determinarTipoMime(String extension) {
        switch (extension.toLowerCase()) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "bmp":
                return "image/bmp";
            case "webp":
                return "image/webp";
            case "pdf":
                return "application/pdf";
            case "doc":
                return "application/msword";
            case "docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls":
                return "application/vnd.ms-excel";
            case "xlsx":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "ppt":
                return "application/vnd.ms-powerpoint";
            case "pptx":
                return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "txt":
                return "text/plain";
            case "rtf":
                return "text/rtf";
            case "zip":
                return "application/zip";
            case "rar":
                return "application/x-rar-compressed";
            case "7z":
                return "application/x-7z-compressed";
            case "mp4":
                return "video/mp4";
            case "avi":
                return "video/x-msvideo";
            case "mov":
                return "video/quicktime";
            case "wmv":
                return "video/x-ms-wmv";
            case "mp3":
                return "audio/mpeg";
            case "wav":
                return "audio/wav";
            case "ogg":
                return "audio/ogg";
            default:
                return "application/octet-stream";
        }
    }
}