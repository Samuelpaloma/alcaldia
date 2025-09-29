package com.example.demo.notificacion.controller;

import com.example.demo.notificacion.dto.NotificacionDTO;
import com.example.demo.notificacion.dto.PreferenciasNotificacionDTO;
import com.example.demo.notificacion.dto.request.CreateNotificacionRequest;
import com.example.demo.notificacion.model.Notificacion;
import com.example.demo.notificacion.service.NotificacionService;
import com.example.demo.notificacion.service.NotificacionServiceSimple;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import com.example.demo.shared.dto.PageResponse;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NotificacionController {
    
    private final NotificacionService notificacionService;
    
    @Autowired
    private NotificacionServiceSimple notificacionServiceSimple;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
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
    
    // ===== ENDPOINTS PARA MÓVIL =====
    
    /**
     * Obtener notificaciones del usuario autenticado (para móvil)
     * GET /api/notificaciones/movil
     */
    @GetMapping("/movil")
    public ResponseEntity<?> getNotificacionesMovil() {
        System.out.println("🌐 [CONTROLLER] ===== GET NOTIFICACIONES MÓVIL =====");
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("🌐 [CONTROLLER] Authentication: " + (authentication != null ? authentication.getName() : "NULL"));
            
            if (authentication == null || authentication.getName() == null || authentication.getName().equals("anonymousUser")) {
                System.out.println("❌ [CONTROLLER] Usuario no autenticado");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Usuario no autenticado");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            String userIdOrEmail = authentication.getName();
            System.out.println("🌐 [CONTROLLER] User ID or Email: " + userIdOrEmail);
            
            Usuario user = getUserByIdOrEmail(userIdOrEmail);
            System.out.println("🌐 [CONTROLLER] Usuario encontrado: " + (user != null ? user.getEmail() : "NULL"));
            System.out.println("🌐 [CONTROLLER] Usuario ID: " + (user != null ? user.getIdUsuario() : "NULL"));
            
            List<NotificacionDTO> notificaciones = notificacionServiceSimple.getNotificacionesByUsuario(user.getIdUsuario());
            System.out.println("🌐 [CONTROLLER] Notificaciones obtenidas: " + notificaciones.size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notificaciones obtenidas exitosamente");
            response.put("notificaciones", notificaciones);
            
            System.out.println("✅ [CONTROLLER] ===== NOTIFICACIONES MÓVIL ENVIADAS =====");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ [CONTROLLER] Error obteniendo notificaciones móviles: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al obtener notificaciones: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Obtener notificaciones no leídas del usuario autenticado (para móvil)
     * GET /api/notificaciones/movil/no-leidas
     */
    @GetMapping("/movil/no-leidas")
    public ResponseEntity<?> getNotificacionesNoLeidasMovil() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getName() == null || authentication.getName().equals("anonymousUser")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Usuario no autenticado");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            String userIdOrEmail = authentication.getName();
            Usuario user = getUserByIdOrEmail(userIdOrEmail);
            
            List<NotificacionDTO> notificaciones = notificacionServiceSimple.getNotificacionesNoLeidasByUsuario(user.getIdUsuario());
            long count = notificacionServiceSimple.contarNotificacionesNoLeidas(user.getIdUsuario());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notificaciones no leídas obtenidas exitosamente");
            response.put("notificaciones", notificaciones);
            response.put("count", count);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al obtener notificaciones no leídas: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Marcar notificación como leída (para móvil)
     * PUT /api/notificaciones/movil/{id}/leer
     */
    @PutMapping("/movil/{id}/leer")
    public ResponseEntity<?> marcarComoLeidaMovil(@PathVariable Long id) {
        System.out.println("🔔 [CONTROLLER] ===== MARCAR COMO LEÍDA MÓVIL =====");
        System.out.println("🔔 [CONTROLLER] Notificación ID: " + id);
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("🔔 [CONTROLLER] Authentication: " + (authentication != null ? authentication.getName() : "NULL"));
            
            if (authentication == null || authentication.getName() == null || authentication.getName().equals("anonymousUser")) {
                System.out.println("❌ [CONTROLLER] Usuario no autenticado");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Usuario no autenticado");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            String userIdOrEmail = authentication.getName();
            System.out.println("🔔 [CONTROLLER] User ID or Email: " + userIdOrEmail);
            
            Usuario user = getUserByIdOrEmail(userIdOrEmail);
            System.out.println("🔔 [CONTROLLER] Usuario encontrado: " + (user != null ? user.getEmail() : "NULL"));
            System.out.println("🔔 [CONTROLLER] Usuario ID: " + (user != null ? user.getIdUsuario() : "NULL"));
            
            System.out.println("🔔 [CONTROLLER] Llamando a notificacionServiceSimple.marcarComoLeida()");
            notificacionServiceSimple.marcarComoLeida(id, user.getIdUsuario());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notificación marcada como leída");
            
            System.out.println("✅ [CONTROLLER] ===== NOTIFICACIÓN MARCADA COMO LEÍDA EXITOSAMENTE =====");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ [CONTROLLER] Error marcando notificación como leída: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al marcar notificación como leída: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Obtener preferencias de notificación del usuario autenticado (para móvil)
     * GET /api/notificaciones/movil/preferencias
     */
    @GetMapping("/movil/preferencias")
    public ResponseEntity<?> getPreferenciasMovil() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getName() == null || authentication.getName().equals("anonymousUser")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Usuario no autenticado");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            String userIdOrEmail = authentication.getName();
            Usuario user = getUserByIdOrEmail(userIdOrEmail);
            
            PreferenciasNotificacionDTO preferencias = notificacionService.getPreferenciasByUsuario(user.getIdUsuario());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Preferencias obtenidas exitosamente");
            response.put("preferencias", preferencias);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al obtener preferencias: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Actualizar preferencias de notificación del usuario autenticado (para móvil)
     * PUT /api/notificaciones/movil/preferencias
     */
    @PutMapping("/movil/preferencias")
    public ResponseEntity<?> actualizarPreferenciasMovil(@RequestBody PreferenciasNotificacionDTO preferenciasDTO) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getName() == null || authentication.getName().equals("anonymousUser")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Usuario no autenticado");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            String userIdOrEmail = authentication.getName();
            Usuario user = getUserByIdOrEmail(userIdOrEmail);
            
            PreferenciasNotificacionDTO preferencias = notificacionService.actualizarPreferencias(user.getIdUsuario(), preferenciasDTO);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Preferencias actualizadas exitosamente");
            response.put("preferencias", preferencias);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al actualizar preferencias: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Obtener contador de notificaciones no leídas (para móvil)
     * GET /api/notificaciones/movil/contador
     */
    @GetMapping("/movil/contador")
    public ResponseEntity<?> getContadorNotificacionesMovil() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || authentication.getName() == null || authentication.getName().equals("anonymousUser")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Usuario no autenticado");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            String userIdOrEmail = authentication.getName();
            Usuario user = getUserByIdOrEmail(userIdOrEmail);
            
            long count = notificacionServiceSimple.contarNotificacionesNoLeidas(user.getIdUsuario());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Contador obtenido exitosamente");
            response.put("count", count);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al obtener contador: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    private Usuario getUserByIdOrEmail(String userIdOrEmail) {
        try {
            Long userId = Long.parseLong(userIdOrEmail);
            return usuarioRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
        } catch (NumberFormatException e) {
            return usuarioRepository.findByEmail(userIdOrEmail)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + userIdOrEmail));
        }
    }
    
}
