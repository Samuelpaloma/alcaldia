package com.example.demo.tecnico.controller;

import com.example.demo.tecnico.dto.request.CambiarEstadoTicketRequestDTO;
import com.example.demo.tecnico.dto.request.SubirEvidenciaRequestDTO;
import com.example.demo.tecnico.dto.response.TicketTecnicoResponseDTO;
import com.example.demo.tecnico.dto.response.EstadisticasTecnicoResponseDTO;
import com.example.demo.ticket.dto.response.EvidenciaResponseDTO;
import com.example.demo.ticket.dto.response.HistorialEstadoResponseDTO;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.model.HistorialEstadoTicket;
import com.example.demo.asignacion.model.HistorialAsignacion;
import com.example.demo.tecnico.service.TecnicoService;
import com.example.demo.evidencia.service.EvidenciaService;
import com.example.demo.evidencia.dto.EvidenciaMovilDTO;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/tecnico")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TecnicoController {
    
    private final TecnicoService tecnicoService;
    private final EvidenciaService evidenciaService;
    private final com.example.demo.ticket.repository.HistorialEstadoTicketRepository historialEstadoTicketRepository;
    private final com.example.demo.asignacion.repository.HistorialAsignacionRepository historialAsignacionRepository;
    private final com.example.demo.ticket.service.TicketService ticketService;
    
    /**
     * Obtener tickets asignados al técnico
     * GET /api/tecnico/tickets
     */
    @GetMapping("/tickets")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerTicketsAsignados(Authentication authentication) {
        try {
            log.info("🔍 [CONTROLLER] Obteniendo tickets asignados para técnico");
            
            String emailTecnico;
            if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                emailTecnico = userDetails.getEmail();
                log.info("🔍 [CONTROLLER] Usando email autenticado: {}", emailTecnico);
            } else {
                // Usar email por defecto para testing
                emailTecnico = "admin@test.com";
                log.info("🔍 [CONTROLLER] No hay autenticación, usando email por defecto: {}", emailTecnico);
            }
            
            log.info("🔍 [CONTROLLER] Llamando a tecnicoService.obtenerTicketsAsignados con email: {}", emailTecnico);
            List<TicketTecnicoResponseDTO> tickets = tecnicoService.obtenerTicketsAsignados(emailTecnico);
            
            log.info("🔍 [CONTROLLER] Tickets obtenidos: {} tickets", tickets.size());
            return ResponseEntity.ok(ApiResponse.success("Tickets obtenidos exitosamente", tickets));
        } catch (Exception e) {
            log.error("❌ [CONTROLLER] Error obteniendo tickets asignados", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener tickets: " + e.getMessage())
            );
        }
    }
    
    /**
     * Endpoint de prueba para debug
     * GET /api/tecnico/debug/tickets
     */
    @GetMapping("/debug/tickets")
    public ResponseEntity<?> debugTickets(@RequestParam(required = false) String email) {
        try {
            log.info("🔍 [DEBUG] Endpoint de debug - email: {}", email);
            
            String emailTecnico = email != null ? email : "admin@test.com";
            log.info("🔍 [DEBUG] Usando email: {}", emailTecnico);
            
            List<TicketTecnicoResponseDTO> tickets = tecnicoService.obtenerTicketsAsignados(emailTecnico);
            
            log.info("🔍 [DEBUG] Tickets obtenidos: {} tickets", tickets.size());
            return ResponseEntity.ok(ApiResponse.success("Debug - Tickets obtenidos exitosamente", tickets));
        } catch (Exception e) {
            log.error("❌ [DEBUG] Error en debug", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error en debug: " + e.getMessage())
            );
        }
    }
    
    /**
     * Endpoint de debug para probar ticket específico
     * GET /api/tecnico/debug/tickets/{ticketId}
     */
    @GetMapping("/debug/tickets/{ticketId}")
    public ResponseEntity<?> debugTicket(@PathVariable Long ticketId, @RequestParam(required = false) String email) {
        try {
            log.info("🔍 [DEBUG TICKET] Probando ticket {} con email: {}", ticketId, email);
            
            String emailTecnico = email != null ? email : "roberrodrigues300@gmail.com";
            log.info("🔍 [DEBUG TICKET] Usando email: {}", emailTecnico);
            
            TicketTecnicoResponseDTO ticket = tecnicoService.obtenerTicketDetallado(ticketId, emailTecnico);
            
            log.info("🔍 [DEBUG TICKET] Ticket obtenido exitosamente: {}", ticketId);
            return ResponseEntity.ok(ApiResponse.success("Debug - Ticket obtenido exitosamente", ticket));
        } catch (Exception e) {
            log.error("❌ [DEBUG TICKET] Error obteniendo ticket {}: {}", ticketId, e.getMessage());
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error obteniendo ticket: " + e.getMessage())
            );
        }
    }
    
    @GetMapping("/debug/historial")
    public ResponseEntity<?> debugHistorial(@RequestParam(required = false) String email) {
        try {
            log.info("🔍 [DEBUG HISTORIAL] Endpoint de debug historial - email: {}", email);
            
            String emailTecnico = email != null ? email : "roberrodrigues300@gmail.com";
            log.info("🔍 [DEBUG HISTORIAL] Usando email: {}", emailTecnico);
            
            List<TicketTecnicoResponseDTO> tickets = tecnicoService.obtenerHistorialTickets(emailTecnico);
            
            log.info("🔍 [DEBUG HISTORIAL] Tickets obtenidos: {} tickets", tickets.size());
            return ResponseEntity.ok(ApiResponse.success("Debug - Historial obtenido exitosamente", tickets));
        } catch (Exception e) {
            log.error("❌ [DEBUG HISTORIAL] Error obteniendo historial: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error obteniendo historial: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener ticket detallado con evidencias e historial
     * GET /api/tecnico/tickets/{ticketId}
     */
    @GetMapping("/tickets/{ticketId}")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerTicketDetallado(
            @PathVariable Long ticketId,
            Authentication authentication) {
        try {
            log.info("Obteniendo ticket detallado {} para técnico", ticketId);
            
            if (authentication == null || authentication.getPrincipal() == null) {
                log.error("No hay autenticación válida para el técnico");
                return ResponseEntity.status(401).body(
                    ApiResponse.error("Token de autenticación requerido")
                );
            }
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            TicketTecnicoResponseDTO ticket = tecnicoService.obtenerTicketDetallado(ticketId, emailTecnico);
            
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            log.error("Error obteniendo ticket detallado", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener ticket: " + e.getMessage())
            );
        }
    }
    
    /**
     * Cambiar estado de un ticket
     * PUT /api/tecnico/tickets/cambiar-estado
     */
    @PutMapping("/tickets/cambiar-estado")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> cambiarEstadoTicket(
            @Valid @RequestBody CambiarEstadoTicketRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Cambiando estado del ticket {} a {}", request.getTicketId(), request.getNuevoEstado());
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            TicketTecnicoResponseDTO ticket = tecnicoService.cambiarEstadoTicket(request, emailTecnico);
            
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            log.error("Error cambiando estado del ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al cambiar estado: " + e.getMessage())
            );
        }
    }
    
    /**
     * Subir evidencia a un ticket
     * POST /api/tecnico/tickets/subir-evidencia
     */
    @PostMapping("/tickets/subir-evidencia")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> subirEvidencia(
            @Valid @RequestBody SubirEvidenciaRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Subiendo evidencia al ticket {}", request.getTicketId());
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            EvidenciaResponseDTO evidencia = tecnicoService.subirEvidencia(request, emailTecnico);
            
            return ResponseEntity.ok(evidencia);
        } catch (Exception e) {
            log.error("Error subiendo evidencia", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al subir evidencia: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener historial de tickets del técnico
     * GET /api/tecnico/historial
     */
    @GetMapping("/tickets/{ticketId}/historial")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerHistorialTicket(@PathVariable Long ticketId, Authentication authentication) {
        try {
            log.info("Obteniendo historial del ticket: {}", ticketId);
            System.out.println("🔍 [HISTORIAL DEBUG] Ticket ID: " + ticketId);
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            System.out.println("🔍 [HISTORIAL DEBUG] Email técnico: " + emailTecnico);
            
            // Obtener el ticket
            com.example.demo.ticket.dto.response.TicketResponseDTO ticketResponse = ticketService.obtenerTicketPorId(ticketId, emailTecnico);
            if (ticketResponse == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Obtener el ticket completo para el historial
            Ticket ticket = new Ticket();
            ticket.setId(ticketResponse.getId());
            
            // Obtener historial de estados
            List<HistorialEstadoTicket> historialEstados = historialEstadoTicketRepository.findByTicketOrderByFechaCambioDesc(ticket);
            List<HistorialEstadoResponseDTO> historialEstadosDTO = historialEstados.stream()
                .map(this::convertirHistorialEstadoADTO)
                .collect(Collectors.toList());
            
            // Obtener historial de asignaciones
            List<HistorialAsignacion> historialAsignaciones = historialAsignacionRepository.findByTicketIdOrderByFechaOperacionAsc(ticket.getId());
            List<Map<String, Object>> historialAsignacionesDTO = historialAsignaciones.stream()
                .map(this::convertirHistorialAsignacionAMap)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("historialEstados", historialEstadosDTO);
            response.put("historialAsignaciones", historialAsignacionesDTO);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error obteniendo historial del ticket {}: {}", ticketId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error interno del servidor"));
        }
    }

    @GetMapping("/historial")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerHistorialTickets(Authentication authentication) {
        try {
            log.info("Obteniendo historial de tickets para técnico");
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            List<TicketTecnicoResponseDTO> tickets = tecnicoService.obtenerHistorialTickets(emailTecnico);
            
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            log.error("Error obteniendo historial de tickets", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener historial: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener estadísticas del técnico
     * GET /api/tecnico/estadisticas
     */
    @GetMapping("/estadisticas")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerEstadisticas(Authentication authentication) {
        try {
            log.info("Obteniendo estadísticas para técnico");
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            EstadisticasTecnicoResponseDTO estadisticas = tecnicoService.obtenerEstadisticasTecnico(emailTecnico);
            
            return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas exitosamente", estadisticas));
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener estadísticas: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener dashboard del técnico (alias para estadísticas)
     * GET /api/tecnico/dashboard
     */
    @GetMapping("/dashboard")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerDashboard(Authentication authentication) {
        try {
            log.info("Obteniendo dashboard para técnico");
            
            String emailTecnico;
            if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                emailTecnico = userDetails.getEmail();
            } else {
                // Usar email por defecto para testing
                emailTecnico = "admin@test.com";
                log.info("No hay autenticación, usando email por defecto: {}", emailTecnico);
            }
            
            EstadisticasTecnicoResponseDTO estadisticas = tecnicoService.obtenerEstadisticasTecnico(emailTecnico);
            
            return ResponseEntity.ok(ApiResponse.success("Dashboard obtenido exitosamente", estadisticas));
        } catch (Exception e) {
            log.error("Error obteniendo dashboard", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener dashboard: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener evidencias del técnico
     * GET /api/tecnico/evidencias
     */
    @GetMapping("/evidencias")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerEvidencias(Authentication authentication) {
        try {
            log.info("Obteniendo evidencias para técnico");
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            // Por ahora retornamos una lista vacía hasta implementar el servicio
            List<Object> evidencias = List.of();
            
            return ResponseEntity.ok(ApiResponse.success("Evidencias obtenidas", evidencias));
        } catch (Exception e) {
            log.error("Error obteniendo evidencias", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener evidencias: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener notificaciones del técnico
     * GET /api/tecnico/notificaciones
     */
    @GetMapping("/notificaciones")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerNotificaciones(Authentication authentication) {
        try {
            log.info("Obteniendo notificaciones para técnico");
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            // Por ahora retornamos una lista vacía hasta implementar el servicio
            List<Object> notificaciones = List.of();
            
            return ResponseEntity.ok(ApiResponse.success("Notificaciones obtenidas", notificaciones));
        } catch (Exception e) {
            log.error("Error obteniendo notificaciones", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener notificaciones: " + e.getMessage())
            );
        }
    }
    
    /**
     * Aceptar un ticket (PENDIENTE -> EN_PROCESO)
     * PUT /api/tecnico/tickets/{ticketId}/aceptar
     */
    @PutMapping("/tickets/{ticketId}/aceptar")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> aceptarTicket(
            @PathVariable Long ticketId,
            Authentication authentication) {
        try {
            log.info("Aceptando ticket {} para técnico", ticketId);
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            TicketTecnicoResponseDTO ticket = tecnicoService.aceptarTicket(ticketId, emailTecnico);
            
            return ResponseEntity.ok(ApiResponse.success("Ticket aceptado exitosamente", ticket));
        } catch (Exception e) {
            log.error("Error aceptando ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al aceptar ticket: " + e.getMessage())
            );
        }
    }
    
    /**
     * Finalizar un ticket con evidencia
     * POST /api/tecnico/tickets/{ticketId}/finalizar
     */
    @PostMapping("/tickets/{ticketId}/finalizar")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> finalizarTicket(
            @PathVariable Long ticketId,
            @RequestParam(value = "archivoAdjunto", required = false) org.springframework.web.multipart.MultipartFile archivoAdjunto,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            Authentication authentication) {
        try {
            log.info("Finalizando ticket {} para técnico", ticketId);
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            TicketTecnicoResponseDTO ticket = tecnicoService.finalizarTicket(ticketId, emailTecnico, descripcion, archivoAdjunto);
            
            return ResponseEntity.ok(ApiResponse.success("Ticket finalizado exitosamente", ticket));
        } catch (Exception e) {
            log.error("Error finalizando ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al finalizar ticket: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener evidencias de un ticket
     * GET /api/tecnico/tickets/{ticketId}/evidencias
     */
    @GetMapping("/tickets/{ticketId}/evidencias")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerEvidenciasTicket(
            @PathVariable Long ticketId,
            Authentication authentication) {
        try {
            log.info("Obteniendo evidencias del ticket {} para técnico", ticketId);
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailTecnico = userDetails.getEmail();
            
            // Obtener evidencias usando el servicio
            List<EvidenciaMovilDTO> evidencias = evidenciaService.obtenerEvidenciasPorTicketMovil(ticketId);
            
            log.info("Total evidencias encontradas: {}", evidencias.size());
            
            return ResponseEntity.ok(ApiResponse.success("Evidencias obtenidas exitosamente", evidencias));
        } catch (Exception e) {
            log.error("Error obteniendo evidencias del ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener evidencias: " + e.getMessage())
            );
        }
    }
    
    /**
     * Descargar archivo adjunto de un ticket
     * GET /api/tecnico/tickets/{ticketId}/download
     */
    @GetMapping("/tickets/{ticketId}/download")
    // @PreAuthorize("hasRole('TECNICO')") // Temporalmente deshabilitado
    public ResponseEntity<?> descargarArchivoAdjunto(
            @PathVariable Long ticketId,
            Authentication authentication) {
        try {
            log.info("Descargando archivo adjunto del ticket {} para técnico", ticketId);
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal()
            ;
            
            String emailTecnico = userDetails.getEmail();
            
            // TODO: Implementar lógica de descarga en TecnicoService
            // Por ahora retornamos error 404
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error descargando archivo adjunto", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al descargar archivo: " + e.getMessage())
            );
        }
    }
    
    /**
     * Convertir HistorialEstadoTicket a DTO
     */
    private HistorialEstadoResponseDTO convertirHistorialEstadoADTO(HistorialEstadoTicket historial) {
        HistorialEstadoResponseDTO dto = new HistorialEstadoResponseDTO();
        dto.setIdHistorial(historial.getIdHistorial());
        dto.setTicketId(historial.getTicket().getId());
        dto.setEstadoAnterior(historial.getEstadoAnterior());
        dto.setEstadoNuevo(historial.getEstadoNuevo());
        dto.setFechaCambio(historial.getFechaCambio());
        dto.setComentario(historial.getComentario());
        dto.setObservaciones(historial.getObservaciones());
        dto.setCambiadoPor(historial.getCambiadoPor() != null ? 
            historial.getCambiadoPor().getFullName() : 
            "Sistema");
        dto.setCambiadoPorEmail(historial.getCambiadoPor() != null ? 
            historial.getCambiadoPor().getEmail() : 
            "sistema@alcaldia.com");
        dto.setTipoUsuario(historial.getCambiadoPor() != null ? 
            historial.getCambiadoPor().getUserType().toString() : 
            "SISTEMA");
        return dto;
    }
    
    /**
     * Convertir HistorialAsignacion a Map
     */
    private Map<String, Object> convertirHistorialAsignacionAMap(HistorialAsignacion historial) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", historial.getId());
        map.put("fechaAsignacion", historial.getFechaOperacion());
        map.put("ticketId", historial.getTicketId());
        map.put("tecnicoId", historial.getTecnicoId());
        map.put("tipoOperacion", historial.getTipoOperacion());
        map.put("tipoAccion", historial.getTipoAccion());
        map.put("estadoAnterior", historial.getEstadoAnterior());
        map.put("estadoNuevo", historial.getEstadoNuevo());
        map.put("comentario", historial.getComentario());
        map.put("emailUsuario", historial.getEmailUsuario());
        return map;
    }
}
