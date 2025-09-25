package com.example.demo.ticket.service;

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
import com.example.demo.notificacion.service.SmartNotificationService;
import com.example.demo.notificacion.service.NotificacionInteligenteService;
import com.example.demo.evidencia.model.Evidencia;
import com.example.demo.evidencia.repository.EvidenciaRepository;
import com.example.demo.ticket.model.HistorialEstadoTicket;
import com.example.demo.ticket.repository.HistorialEstadoTicketRepository;
import com.example.demo.asignacion.model.HistorialAsignacion;
import com.example.demo.asignacion.repository.HistorialAsignacionRepository;
import com.example.demo.asignacion.dto.response.AsignacionResponseDTO;
import com.example.demo.ticket.dto.response.ComentarioResponseDTO;

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
    private SmartNotificationService smartNotificationService;
    
    @Autowired
    private NotificacionInteligenteService notificacionInteligenteService;
    
    @Autowired
    private ComentarioService comentarioService;

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
        // La consulta solo se llena si el usuario selecciona "Otros" y escribe algo personalizado
        ticket.setConsulta(request.getConsulta());
        ticket.setCategoria(categoria);
        ticket.setCategoriaString(categoria.getNombre()); // Para compatibilidad
        ticket.setCategoriaNombre(categoria.getNombre()); // Campo requerido por la tabla
        ticket.setPrioridad(request.getPrioridad() != null ? request.getPrioridad() : "MEDIA");
        ticket.setEstado("PENDIENTE");
        ticket.setCreador(creador);
        
        // Manejar archivo adjunto si existe
        if (request.getArchivoAdjunto() != null) {
            ticket.setArchivoAdjunto(request.getArchivoAdjunto());
            ticket.setNombreArchivo(request.getNombreArchivo());
        }

        ticketRepository.save(ticket);
        
        // Enviar notificación inteligente a los administradores
        System.out.println("🔔 [DEBUG] ===== ENVIANDO NOTIFICACIÓN INTELIGENTE =====");
        System.out.println("🔔 [DEBUG] Ticket ID: " + ticket.getId());
        System.out.println("🔔 [DEBUG] NotificacionInteligenteService: " + (notificacionInteligenteService != null ? "INYECTADO" : "NULL"));
        
        try {
            // Usar el nuevo sistema inteligente
            notificacionInteligenteService.notificarTicketCreado(ticket, creador);
            System.out.println("🔔 [DEBUG] ✅ Notificación inteligente enviada exitosamente");
            
            // También mantener el sistema viejo por compatibilidad temporal
            smartNotificationService.notificarTicketCreado(ticket);
            System.out.println("🔔 [DEBUG] ✅ Notificación vieja también enviada");
        } catch (Exception e) {
            // Log del error pero no fallar la creación del ticket
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
        return new TicketResponseDTO(
                ticket.getId(),
                ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : ticket.getCategoriaString(), // asunto = solo categoría
                ticket.getDescripcion(),
                ticket.getPrioridad(),
                ticket.getEstado(),
                ticket.getCreador().getEmail(),
                ticket.getCreador().getNombreCompleto(), // Nombre del creador
                ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getEmail() : null,
                ticket.getFechaCreacion(),
                ticket.getFechaActualizacion(),
                ticket.getCreador().getNombreCompleto(), // Nombre del formulario
                ticket.getUbicacion(),
                ticket.getConsulta(), // consulta completa para descripción
                ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : ticket.getCategoriaString(),
                ticket.getArchivoAdjunto(),
                ticket.getNombreArchivo(),
                null, // evidencias
                null, // historialEstados
                null, // historialAsignaciones
                null  // comentarios
        );
    }

    private HistorialTicketResponseDTO convertirTicketAHistorialDTO(Ticket ticket) {
        return new HistorialTicketResponseDTO(
                ticket.getId(),
                ticket.getCreador().getNombre(), // Nombre del usuario logueado
                ticket.getUbicacion(),
                ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : ticket.getCategoriaString(),
                ticket.getEstado(),
                ticket.getPrioridad(),
                ticket.getFechaCreacion(),
                ticket.getFechaActualizacion(),
                ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getEmail() : null
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
        
        return new TicketResponseDTO(
            ticket.getId(),
            ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : ticket.getCategoriaString(), // asunto = solo categoría
            ticket.getDescripcion(),
            ticket.getPrioridad(),
            ticket.getEstado(),
            ticket.getCreador().getEmail(),
            ticket.getCreador().getNombreCompleto(), // Nombre del creador
            ticket.getTecnicoAsignado() != null ? ticket.getTecnicoAsignado().getEmail() : null,
            ticket.getFechaCreacion(),
            ticket.getFechaActualizacion(),
            ticket.getCreador().getNombreCompleto(), // Nombre del formulario
            ticket.getUbicacion(),
            ticket.getConsulta(), // consulta completa para descripción
            ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : ticket.getCategoriaString(),
            ticket.getArchivoAdjunto(),
            ticket.getNombreArchivo(),
            evidenciasDTO,
            historialDTO,
            historialAsignacionesDTO,
            comentariosDTO
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
        return AsignacionResponseDTO.builder()
            .ticketId(historial.getTicketId())
            .ticketAsunto("Ticket #" + historial.getTicketId())
            .tecnicoId(historial.getTecnicoId())
            .tecnicoNombre("Técnico")
            .tecnicoEmail("tecnico@alcaldia.gov.co")
            .comentario(historial.getComentario())
            .fechaAsignacion(historial.getFechaAccion())
            .activa(false)
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
}