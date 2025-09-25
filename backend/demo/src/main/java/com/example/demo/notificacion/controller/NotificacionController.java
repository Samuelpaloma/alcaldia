package com.example.demo.notificacion.controller;

import com.example.demo.notificacion.dto.request.CreateNotificacionRequest;
import com.example.demo.notificacion.model.Notificacion;
import com.example.demo.notificacion.service.NotificacionService;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import com.example.demo.shared.dto.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NotificacionController {
    
    private final NotificacionService notificacionService;
    
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
            
            // Temporalmente sin autenticación para testing
            String emailUsuario = "admin@test.com";
            
            Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            PageResponse<Notificacion> notificaciones = notificacionService
                .obtenerNotificacionesPorUsuario(emailUsuario, pageable, leida);
            
            return ResponseEntity.ok(notificaciones);
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
    
}
