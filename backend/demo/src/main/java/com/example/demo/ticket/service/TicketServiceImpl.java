package com.example.demo.ticket.service;

import java.util.Comparator;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

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

@Service
@Slf4j
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
        categoria.setName(categoriaResponse.getNombre());
        
        // Crear ticket con todos los campos del formulario
        Ticket ticket = new Ticket();
        // El nombre se obtiene automáticamente del usuario logueado
        ticket.setLocation(request.getUbicacion());
        // Establecer tanto consulta como descripción
        ticket.setQuery(request.getConsulta());
        // La descripción debe contener el mensaje completo (consulta + categoría)
        ticket.setDescription(request.getConsulta() != null && !request.getConsulta().trim().isEmpty() 
            ? request.getConsulta() 
            : categoria.getName());
        ticket.setCategory(categoria);
        ticket.setCategoryString(categoria.getName()); // Para compatibilidad
        ticket.setCategoryName(categoria.getName()); // Campo requerido por la tabla
        ticket.setPriority(request.getPrioridad() != null ? request.getPrioridad() : "MEDIA");
        ticket.setStatus("PENDIENTE");
        ticket.setCreator(creador);
        
        // Guardar ticket
        ticketRepository.save(ticket);
        
        // Procesar ticket con SLA y automatización integrada
        try {
            System.out.println("🔧 [DEBUG] Llamando a SLA y automatización para ticket " + ticket.getId());
            slaAutomationService.procesarTicketCreado(ticket);
            System.out.println("✅ [DEBUG] SLA y automatización procesados correctamente para ticket " + ticket.getId());
        } catch (Exception e) {
            System.err.println("❌ [DEBUG] Error procesando SLA y automatización para ticket " + ticket.getId() + ": " + e.getMessage());
            e.printStackTrace();
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
            if (creador != null && !"Super Administrador".equals(creador.getFullName() + " " + creador.getLastName())) {
                System.out.println("🔔 [DEBUG] Enviando notificación de creación de ticket para: " + creador.getEmail());
                notificationRoleService.notificarCreacionTicket(ticket.getId(), creador.getId());
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
        String creadorEmail = ticket.getCreatorEmail();
        if (creadorEmail == null || !creadorEmail.equals(emailUsuario)) {
            throw new RuntimeException("No tienes permisos para ver este ticket");
        }

        // Debug logs
        System.out.println("🔍 [SEGUIMIENTO DEBUG] Ticket ID: " + ticket.getId());
        System.out.println("🔍 [SEGUIMIENTO DEBUG] Estado: " + ticket.getStatus());
        System.out.println("🔍 [SEGUIMIENTO DEBUG] Técnico asignado: " + (ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getEmail() : "null"));
        System.out.println("🔍 [SEGUIMIENTO DEBUG] Técnico nombre: " + (ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getFullName() : "null"));
        System.out.println("🔍 [SEGUIMIENTO DEBUG] Técnico ID: " + (ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getId() : "null"));
        System.out.println("🔍 [SEGUIMIENTO DEBUG] Fecha actualización: " + ticket.getUpdatedAt());

        return convertirTicketAResponseDTO(ticket);
    }

    @Override
    public Page<HistorialTicketResponseDTO> obtenerHistorialTickets(String emailUsuario, Pageable pageable) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Page<Ticket> tickets = ticketRepository.findByCreatorOrderByCreatedAtDesc(usuario, pageable);
        
        return tickets.map(this::convertirTicketAHistorialDTO);
    }

    @Override
    public List<TicketResponseDTO> buscarTickets(String emailUsuario, String categoria, String estado, String prioridad) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        List<Ticket> tickets = ticketRepository.findByCreatorAndCategoriaAndEstadoAndPrioridad(
                usuario, categoria, estado, prioridad);
        
        return tickets.stream()
                .map(this::convertirTicketAResponseDTOBasico)
                .collect(Collectors.toList());
    }

    @Override
    public TicketResponseDTO obtenerTicketPorId(Long id, String emailUsuario) {
        System.out.println("🔍 [DEBUG] Buscando ticket ID: " + id + " para usuario: " + emailUsuario);
        
        List<Ticket> tickets = ticketRepository.findAllById(Collections.singletonList(id));
        System.out.println("🔍 [DEBUG] Tickets encontrados: " + tickets.size());
        
        if (tickets.isEmpty()) {
            System.out.println("❌ [DEBUG] No se encontró el ticket con ID: " + id);
            throw new RuntimeException("Ticket no encontrado");
        }
        
        if (tickets.size() > 1) {
            System.out.println("⚠️ [WARNING] Múltiples tickets encontrados con ID: " + id + ". Usando el primero.");
        }
        
        Ticket ticket = tickets.get(0);
        System.out.println("🔍 [DEBUG] Ticket encontrado - ID: " + ticket.getId());
        System.out.println("🔍 [DEBUG] Estado del ticket: " + ticket.getStatus());
        System.out.println("🔍 [DEBUG] Creador: " + (ticket.getCreator() != null ? ticket.getCreator().getEmail() : "null"));
        System.out.println("🔍 [DEBUG] Técnico asignado: " + (ticket.getAssignedTechnician() != null ? ticket.getAssignedTechnician().getEmail() : "null"));
        
        // Verificar que el usuario tenga acceso al ticket (creador o técnico asignado)
        boolean tieneAcceso = false;
        
        // Verificar si es el creador
        if (ticket.getCreator() != null && ticket.getCreator().getEmail().equals(emailUsuario)) {
            System.out.println("✅ [DEBUG] Usuario es el creador del ticket");
            tieneAcceso = true;
        }
        
        // Verificar si es el técnico asignado
        if (ticket.getAssignedTechnician() != null && ticket.getAssignedTechnician().getEmail().equals(emailUsuario)) {
            System.out.println("✅ [DEBUG] Usuario es el técnico asignado del ticket");
            tieneAcceso = true;
        }
        
        System.out.println("🔍 [DEBUG] ¿Tiene acceso? " + tieneAcceso);
        
        if (!tieneAcceso) {
            System.out.println("❌ [DEBUG] Usuario no tiene acceso al ticket");
            throw new RuntimeException("Este ticket no está asignado actualmente o ha sido completado.");
        }

        System.out.println("✅ [DEBUG] Acceso concedido, convirtiendo ticket a DTO");
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
        return usuario.getFirstName();
    }

    @Override
    public List<TicketResponseDTO> obtenerTicketsPorUsuario(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Usar Pageable para obtener todos los tickets del usuario
        Pageable pageable = Pageable.unpaged();
        Page<Ticket> ticketPage = ticketRepository.findByCreatorOrderByCreatedAtDesc(usuario, pageable);
        List<Ticket> tickets = ticketPage.getContent();
        
        return tickets.stream()
                .map(this::convertirTicketAResponseDTOBasico)
                .collect(Collectors.toList());
    }

    @Override
    public TicketResponseDTO obtenerSeguimientoTicket(Long ticketId, String emailUsuario) {
        return obtenerTicketParaSeguimiento(ticketId, emailUsuario);
    }

    @Override
    @Transactional
    public void responderResolucionTicket(Long ticketId, String accion, String comentario, String emailUsuario) {
        log.info("🔒 [CLIENTE] ===== RESPONDIENDO A RESOLUCIÓN =====");
        log.info("🔒 [CLIENTE] Ticket ID: {}", ticketId);
        log.info("🔒 [CLIENTE] Acción: {}", accion);
        log.info("🔒 [CLIENTE] Comentario: {}", comentario);
        log.info("🔒 [CLIENTE] Email usuario: {}", emailUsuario);
        
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        log.info("🔒 [CLIENTE] Ticket encontrado - Estado actual: {}", ticket.getStatus());
        log.info("🔒 [CLIENTE] Creador del ticket: {}", ticket.getCreatorEmail());
        
        // Verificar que el usuario tenga acceso al ticket
        String creadorEmail = ticket.getCreatorEmail();
        if (creadorEmail == null || !creadorEmail.equals(emailUsuario)) {
            log.error("🔒 [CLIENTE] Usuario {} no tiene permisos para el ticket {}", emailUsuario, ticketId);
            throw new RuntimeException("No tienes permisos para responder este ticket");
        }
        
        // Verificar que el ticket esté en estado RESUELTO
        if (!"RESUELTO".equals(ticket.getStatus())) {
            log.error("🔒 [CLIENTE] Ticket {} no está en estado RESUELTO. Estado actual: {}", ticketId, ticket.getStatus());
            throw new RuntimeException("Solo se puede responder a tickets en estado RESUELTO");
        }
        
        log.info("🔒 [CLIENTE] Validaciones pasadas correctamente");
        
        String estadoAnterior = ticket.getStatus();
        String estadoNuevo;
        
        if ("CONFIRMAR".equals(accion)) {
            estadoNuevo = "CERRADO";
        } else if ("RECHAZAR".equals(accion)) {
            estadoNuevo = "PENDIENTE";
        } else {
            throw new RuntimeException("Acción no válida. Use 'CONFIRMAR' o 'RECHAZAR'");
        }
        
        // Actualizar estado del ticket
        log.info("🔒 [CLIENTE] Actualizando estado: {} → {}", estadoAnterior, estadoNuevo);
        ticket.setStatus(estadoNuevo);
        ticketRepository.save(ticket);
        log.info("🔒 [CLIENTE] Estado actualizado en BD exitosamente");
        
        // Crear historial de cambio de estado
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        log.info("🔒 [CLIENTE] Usuario encontrado: {} ({})", usuario.getEmail(), usuario.getFullName());
        
        HistorialEstadoTicket historial = new HistorialEstadoTicket();
        historial.setTicket(ticket);
        historial.setEstadoAnterior(estadoAnterior);
        historial.setEstadoNuevo(estadoNuevo);
        historial.setComentario(comentario != null ? comentario : "Cliente " + accion.toLowerCase() + " la resolución");
        historial.setObservaciones("Respuesta del cliente a la resolución");
        historial.setFechaCambio(java.time.LocalDateTime.now());
        historial.setCambiadoPor(usuario);
        historial.setTipoUsuario("CLIENTE");
        
        historialRepository.save(historial);
        log.info("🔒 [CLIENTE] Historial guardado exitosamente");
        
        // Si se rechaza, notificar a administradores para reasignación
        if ("RECHAZAR".equals(accion)) {
            try {
                notificationRoleService.notificarRechazoResolucion(ticketId, usuario.getId());
                log.info("🔒 [CLIENTE] Notificación de rechazo enviada");
            } catch (Exception e) {
                log.error("🔒 [CLIENTE] Error enviando notificación de rechazo: {}", e.getMessage());
            }
        }
        
        log.info("✅ [CLIENTE] ===== RESPUESTA A RESOLUCIÓN COMPLETADA =====");
        log.info("✅ [CLIENTE] Ticket {} - Estado actualizado: {} → {}", ticketId, estadoAnterior, estadoNuevo);
    }

    // Métodos auxiliares
    private TicketResponseDTO convertirTicketAResponseDTOBasico(Ticket ticket) {
        // Usar el técnico actualmente asignado (no el original)
        Usuario tecnicoActual = ticket.getAssignedTechnician();
        
        // Debug logs
        System.out.println("🔍 [TICKET DEBUG] Ticket ID: " + ticket.getId());
        System.out.println("🔍 [TICKET DEBUG] Estado: " + ticket.getStatus());
        System.out.println("🔍 [TICKET DEBUG] Técnico asignado: " + (tecnicoActual != null ? tecnicoActual.getEmail() : "null"));
        System.out.println("🔍 [TICKET DEBUG] Técnico nombre: " + (tecnicoActual != null ? tecnicoActual.getFullName() : "null"));
        System.out.println("🔍 [TICKET DEBUG] Técnico ID: " + (tecnicoActual != null ? tecnicoActual.getId() : "null"));
        System.out.println("🔍 [TICKET DEBUG] Fecha actualización: " + ticket.getUpdatedAt());
        
        return new TicketResponseDTO(
                ticket.getId(),
                ticket.getCategory() != null ? ticket.getCategory().getName() : ticket.getCategoryString(), // asunto = solo categoría
                ticket.getDescription(),
                ticket.getPriority(),
                ticket.getStatus(),
                ticket.getCreatorEmail(), // Usar método seguro
                ticket.getCreatorName(), // Usar método seguro
                tecnicoActual != null ? tecnicoActual.getEmail() : null,
                tecnicoActual != null ? tecnicoActual.getFullName() : null,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getCreatorName(), // Usar método seguro
                ticket.getLocation(),
                ticket.getQuery(), // consulta completa para descripción
                ticket.getCategory() != null ? ticket.getCategory().getName() : ticket.getCategoryString(),
                ticket.getAttachedFile(),
                ticket.getFileName(),
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
                ticket.getCreator() != null ? ticket.getCreator().getFullName() : "Usuario Desconocido", // Usar método seguro
                ticket.getLocation(),
                ticket.getCategory() != null ? ticket.getCategory().getName() : ticket.getCategoryString(),
                ticket.getStatus(),
                ticket.getPriority(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                tecnicoOriginal != null ? tecnicoOriginal.getFullName() : "Sin asignar"
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
                System.out.println("🔍 [TICKET DEBUG] Técnico actual encontrado: " + (tecnicoActual != null ? tecnicoActual.getFullName() : "null"));
            }
        }
        
        // Si no hay asignación, usar el técnico del ticket
        if (tecnicoActual == null) {
            tecnicoActual = ticket.getAssignedTechnician();
            System.out.println("🔍 [TICKET DEBUG] Usando técnico del ticket: " + (tecnicoActual != null ? tecnicoActual.getFullName() : "null"));
        }
        
        return new TicketResponseDTO(
            ticket.getId(),
            ticket.getCategory() != null ? ticket.getCategory().getName() : ticket.getCategoryString(), // asunto = solo categoría
            ticket.getDescription(),
            ticket.getPriority(),
            ticket.getStatus(),
            ticket.getCreatorEmail(), // Usar método seguro
            ticket.getCreatorName(), // Usar método seguro
            tecnicoActual != null ? tecnicoActual.getEmail() : null,
            tecnicoActual != null ? tecnicoActual.getFullName() : null,
            ticket.getCreatedAt(),
            ticket.getUpdatedAt(),
            ticket.getCreatorName(), // Usar método seguro
            ticket.getLocation(),
            ticket.getQuery(), // consulta completa para descripción
            ticket.getCategory() != null ? ticket.getCategory().getName() : ticket.getCategoryString(),
            ticket.getAttachedFile(),
            ticket.getFileName(),
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
            .subidoPor(evidencia.getSubidoPor().getFullName())
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
                tecnicoNombre = tecnico.getFullName() + " " + tecnico.getLastName();
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
            .cambiadoPor(historial.getCambiadoPor().getFullName())
            .cambiadoPorEmail(historial.getCambiadoPor().getEmail())
            .tipoUsuario(historial.getTipoUsuario())
            .build();
    }
    
    /**
     * Guardar archivo en el sistema de archivos
     */
    private String guardarArchivoEnSistema(String contenidoBase64, String nombreOriginal) throws IOException {
        // Configuración del directorio de uploads
        String uploadDir = "uploads/tickets/";
        File uploadDirectory = new File(uploadDir);
        
        // Crear directorio si no existe
        if (!uploadDirectory.exists()) {
            uploadDirectory.mkdirs();
        }
        
        // Generar nombre único para el archivo
        String extension = "";
        if (nombreOriginal.contains(".")) {
            extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        }
        String nombreUnico = UUID.randomUUID().toString() + "_" + System.currentTimeMillis() + extension;
        
        // Ruta completa del archivo
        String rutaCompleta = uploadDir + nombreUnico;
        
        // Decodificar Base64 y guardar archivo
        byte[] contenido = Base64.getDecoder().decode(contenidoBase64);
        
        try (FileOutputStream fos = new FileOutputStream(rutaCompleta)) {
            fos.write(contenido);
        }
        
        System.out.println("📁 Archivo guardado: " + rutaCompleta);
        return rutaCompleta;
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
