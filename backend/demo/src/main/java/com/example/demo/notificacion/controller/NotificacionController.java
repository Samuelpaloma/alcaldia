package com.example.demo.notificacion.controller;

import com.example.demo.notificacion.dto.request.CreateNotificacionRequest;
import com.example.demo.notificacion.dto.PreferenciasNotificacionDTO;
import com.example.demo.notificacion.model.Notificacion;
import com.example.demo.notificacion.service.NotificacionService;
import com.example.demo.notificacion.repository.NotificationRepository;
import com.example.demo.notificacion.model.Notification;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NotificacionController {
    
    private final NotificacionService notificacionService;
    private final NotificationRepository notificationRepository;
    
    
    
    /**
     * Obtener notificaciones del usuario con paginación
     * GET /api/notificaciones?page=0&size=10&leida=false
     */
    @GetMapping
    public ResponseEntity<?> obtenerNotificaciones(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fechaCreacion") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Boolean leida) {
        try {
            log.info("Obteniendo notificaciones - página: {}, tamaño: {}, leída: {}", page, size, leida);
            
            // Usar directamente NotificationRepository como hace NotificationRoleController
            List<Notification> todasLasNotificaciones = notificationRepository.findAll();
            
            // Filtrar notificaciones para administradores
            List<Map<String, Object>> notificacionesFiltradas = new ArrayList<>();
            
            for (Notification notif : todasLasNotificaciones) {
                if (notif.getRecipients() != null && notif.getRecipients().contains("rol:administrador")) {
                    Map<String, Object> notificacionResponse = new HashMap<>();
                    notificacionResponse.put("id", notif.getId());
                    notificacionResponse.put("titulo", "Notificación");
                    notificacionResponse.put("mensaje", notif.getMessage());
                    notificacionResponse.put("tipo", notif.getType());
                    notificacionResponse.put("leida", notif.getRead());
                    notificacionResponse.put("fechaCreacion", notif.getCreatedAt());
                    notificacionResponse.put("fechaLectura", notif.getReadAt());
                    notificacionResponse.put("ticketId", notif.getTicketId());
                    notificacionResponse.put("prioridad", notif.getPriority());
                    notificacionesFiltradas.add(notificacionResponse);
                }
            }
            
            // Crear respuesta compatible con PageResponse
            Map<String, Object> response = new HashMap<>();
            response.put("content", notificacionesFiltradas);
            response.put("totalElements", notificacionesFiltradas.size());
            response.put("totalPages", 1);
            response.put("currentPage", page);
            response.put("size", size);
            response.put("first", page == 0);
            response.put("last", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error obteniendo notificaciones", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener notificaciones: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener notificaciones no leídas
     * GET /api/notificaciones/no-leidas
     */
    @GetMapping("/no-leidas")
    public ResponseEntity<?> obtenerNotificacionesNoLeidas(Authentication authentication) {
        try {
            log.info("Obteniendo notificaciones no leídas");
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            
            List<Notificacion> notificaciones = notificacionService.obtenerNotificacionesNoLeidas(emailUsuario);
            
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            log.error("Error obteniendo notificaciones no leídas", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener notificaciones no leídas: " + e.getMessage())
            );
        }
    }
    
    /**
     * Marcar notificación como leída
     * PUT /api/notificaciones/{id}/marcar-leida
     */
    @PutMapping("/{id}/marcar-leida")
    public ResponseEntity<?> marcarComoLeida(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            log.info("Marcando notificación {} como leída", id);
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            
            Notificacion notificacion = notificacionService.marcarComoLeida(id, emailUsuario);
            
            return ResponseEntity.ok(notificacion);
        } catch (Exception e) {
            log.error("Error marcando notificación como leída", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al marcar notificación: " + e.getMessage())
            );
        }
    }
    
    /**
     * Marcar todas las notificaciones como leídas
     * PUT /api/notificaciones/marcar-todas-leidas
     */
    @PutMapping("/marcar-todas-leidas")
    public ResponseEntity<?> marcarTodasComoLeidas(Authentication authentication) {
        try {
            log.info("Marcando todas las notificaciones como leídas");
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            
            int cantidadMarcadas = notificacionService.marcarTodasComoLeidas(emailUsuario);
            
            return ResponseEntity.ok(ApiResponse.success(
                "Se marcaron " + cantidadMarcadas + " notificaciones como leídas"
            ));
        } catch (Exception e) {
            log.error("Error marcando todas las notificaciones como leídas", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al marcar notificaciones: " + e.getMessage())
            );
        }
    }
    
    /**
     * Crear nueva notificación
     * POST /api/notificaciones
     */
    @PostMapping
    public ResponseEntity<?> crearNotificacion(
            @Valid @RequestBody CreateNotificacionRequest request,
            Authentication authentication) {
        try {
            log.info("Creando notificación: {}", request.getTitulo());
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailCreador = userDetails.getEmail();
            
            Notificacion notificacion = notificacionService.crearNotificacion(request, emailCreador);
            
            return ResponseEntity.ok(notificacion);
        } catch (Exception e) {
            log.error("Error creando notificación", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al crear notificación: " + e.getMessage())
            );
        }
    }
    
    /**
     * Eliminar notificación
     * DELETE /api/notificaciones/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarNotificacion(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            log.info("Eliminando notificación {}", id);
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            
            notificacionService.eliminarNotificacion(id, emailUsuario);
            
            return ResponseEntity.ok(ApiResponse.success("Notificación eliminada exitosamente"));
        } catch (Exception e) {
            log.error("Error eliminando notificación", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al eliminar notificación: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener estadísticas de notificaciones
     * GET /api/notificaciones/estadisticas
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas(Authentication authentication) {
        try {
            log.info("Obteniendo estadísticas de notificaciones");
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            
            NotificacionService.NotificacionStatsResponseDTO stats = notificacionService.obtenerEstadisticas(emailUsuario);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas de notificaciones", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener estadísticas: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener preferencias de notificación del usuario autenticado
     * GET /api/notificaciones/preferencias
     */
    @GetMapping("/preferencias")
    public ResponseEntity<?> obtenerPreferencias(Authentication authentication) {
        try {
            log.info("Obteniendo preferencias de notificación");
            
            Long userId = getUserIdFromAuth(authentication);
            PreferenciasNotificacionDTO preferencias = notificacionService.getPreferenciasByUsuario(userId);
            
            return ResponseEntity.ok(preferencias);
        } catch (Exception e) {
            log.error("Error obteniendo preferencias de notificación", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener preferencias: " + e.getMessage())
            );
        }
    }
    
    /**
     * Actualizar preferencias de notificación del usuario autenticado
     * PUT /api/notificaciones/preferencias
     */
    @PutMapping("/preferencias")
    public ResponseEntity<?> actualizarPreferencias(
            @RequestBody PreferenciasNotificacionDTO preferenciasDTO,
            Authentication authentication) {
        try {
            log.info("Actualizando preferencias de notificación");
            
            Long userId = getUserIdFromAuth(authentication);
            PreferenciasNotificacionDTO preferenciasActualizadas = 
                notificacionService.actualizarPreferencias(userId, preferenciasDTO);
            
            return ResponseEntity.ok(preferenciasActualizadas);
        } catch (Exception e) {
            log.error("Error actualizando preferencias de notificación", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al actualizar preferencias: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener userId desde el Authentication
     */
    private Long getUserIdFromAuth(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            return userDetails.getUserId();
        }
        return 1L; // Default temporal
    }
    
    // ===== ENDPOINTS PARA MÓVIL =====
    
    
    
}
