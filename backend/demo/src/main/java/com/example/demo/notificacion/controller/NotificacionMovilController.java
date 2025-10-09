package com.example.demo.notificacion.controller;

import com.example.demo.notificacion.model.Notification;
import com.example.demo.notificacion.service.NotificationService;
import com.example.demo.notificacion.service.PreferenciasNotificacionService;
import com.example.demo.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones/movil")
@CrossOrigin(origins = "*")
public class NotificacionMovilController {
    
    @Autowired
    private NotificationService NotificationService;
    
    @Autowired
    private PreferenciasNotificacionService preferenciasNotificacionService;
    
    /**
     * Obtener todas las notificaciones del usuario para móvil
     * GET /api/notificaciones/movil
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerNotificacionesMovil(
            @RequestParam(required = false) String email,
            Authentication authentication) {
        try {
            System.out.println("🔔 [CONTROLLER] ===== OBTENIENDO NOTIFICACIONES MÓVIL =====");
            System.out.println("🔔 [CONTROLLER] Email recibido: " + email);
            System.out.println("🔔 [CONTROLLER] Authentication: " + (authentication != null ? "Presente" : "Null"));
            
            String emailUsuario;
            if (email != null && !email.isEmpty()) {
                emailUsuario = email;
            } else if (authentication != null && authentication.getPrincipal() != null) {
                // Obtener email del usuario autenticado
                CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                emailUsuario = userDetails.getEmail();
            } else {
                emailUsuario = "admin@test.com";
            }
            
            System.out.println("🔔 [CONTROLLER] Email a usar: " + emailUsuario);
            
            List<Notification> notificaciones = NotificationService
                .obtenerNotificacionesPorUsuario(emailUsuario);
            
            System.out.println("🔔 [CONTROLLER] Notificaciones encontradas: " + notificaciones.size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("notificaciones", notificaciones);
            response.put("total", notificaciones.size());
            
            System.out.println("🔔 [CONTROLLER] Respuesta enviada: " + response);
            System.out.println("🔔 [CONTROLLER] ===== FIN NOTIFICACIONES MÓVIL =====");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ [CONTROLLER] Error obteniendo notificaciones: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener notificaciones: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Obtener notificaciones no leídas para móvil
     * GET /api/notificaciones/movil/no-leidas
     */
    @GetMapping("/no-leidas")
    public ResponseEntity<Map<String, Object>> obtenerNotificacionesNoLeidasMovil(
            @RequestParam(required = false) String email) {
        try {
            // Usar email por defecto si no se proporciona
            String emailUsuario = email != null ? email : "admin@test.com";
            
            List<Notification> notificaciones = NotificationService
                .obtenerNotificacionesPorUsuario(emailUsuario);
            
            // Filtrar solo las no leídas
            List<Notification> notificacionesNoLeidas = notificaciones.stream()
                .filter(n -> !n.getRead())
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("notificaciones", notificacionesNoLeidas);
            response.put("count", notificacionesNoLeidas.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener notificaciones no leídas: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Marcar notificación como leída para móvil
     * PUT /api/notificaciones/movil/{id}/leer
     */
    @PutMapping("/{id}/leer")
    public ResponseEntity<Map<String, Object>> marcarComoLeidaMovil(@PathVariable Long id) {
        try {
            Notification notificacion = NotificationService.marcarComoLeida(id);
            
            Map<String, Object> response = new HashMap<>();
            if (notificacion != null) {
                response.put("success", true);
                response.put("message", "Notificación marcada como leída");
                response.put("notificacion", notificacion);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Notificación no encontrada");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Error al marcar notificación como leída: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Obtener contador de notificaciones no leídas para móvil
     * GET /api/notificaciones/movil/contador
     */
    @GetMapping("/contador")
    public ResponseEntity<Map<String, Object>> obtenerContadorMovil(
            @RequestParam(required = false) String email) {
        try {
            System.out.println("🔔 [CONTROLLER] ===== OBTENIENDO CONTADOR MÓVIL =====");
            System.out.println("🔔 [CONTROLLER] Email recibido: " + email);
            
            // Usar email por defecto si no se proporciona
            String emailUsuario = email != null ? email : "admin@test.com";
            System.out.println("🔔 [CONTROLLER] Email a usar: " + emailUsuario);
            
            Long count = NotificationService.contarNotificacionesNoLeidas(emailUsuario);
            System.out.println("🔔 [CONTROLLER] Contador obtenido del servicio: " + count);
            
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("email", emailUsuario);
            
            System.out.println("🔔 [CONTROLLER] Respuesta enviada: " + response);
            System.out.println("🔔 [CONTROLLER] ===== FIN CONTADOR MÓVIL =====");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ [CONTROLLER] Error obteniendo contador: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener contador: " + e.getMessage());
            errorResponse.put("count", 0);
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Obtener preferencias de notificación para móvil
     * GET /api/notificaciones/movil/preferencias
     */
    @GetMapping("/preferencias")
    public ResponseEntity<Map<String, Object>> obtenerPreferenciasMovil(
            Authentication authentication) {
        try {
            System.out.println("🔔 [PREFERENCIAS] Obteniendo preferencias de notificación");
            
            // Obtener ID del usuario autenticado
            if (authentication == null || authentication.getPrincipal() == null) {
                System.err.println("❌ [PREFERENCIAS] No hay autenticación válida");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Usuario no autenticado");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long usuarioId = userDetails.getUserId(); // Obtener el ID real del usuario autenticado
            System.out.println("🔔 [PREFERENCIAS] Usuario autenticado: " + userDetails.getEmail() + " (ID: " + usuarioId + ")");
            
            Map<String, Object> preferencias = preferenciasNotificacionService.obtenerPreferenciasPorUsuario(usuarioId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("preferencias", preferencias);
            
            System.out.println("🔔 [PREFERENCIAS] Preferencias obtenidas para usuario " + usuarioId + ": " + preferencias);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ [PREFERENCIAS] Error obteniendo preferencias: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al obtener preferencias: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Actualizar preferencias de notificación para móvil
     * PUT /api/notificaciones/movil/preferencias
     */
    @PutMapping("/preferencias")
    public ResponseEntity<Map<String, Object>> actualizarPreferenciasMovil(
            @RequestBody Map<String, Object> preferencias,
            Authentication authentication) {
        try {
            System.out.println("🔔 [PREFERENCIAS] Actualizando preferencias: " + preferencias);
            
            // Obtener ID del usuario autenticado
            if (authentication == null || authentication.getPrincipal() == null) {
                System.err.println("❌ [PREFERENCIAS] No hay autenticación válida");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Usuario no autenticado");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Long usuarioId = userDetails.getUserId(); // Obtener el ID real del usuario autenticado
            System.out.println("🔔 [PREFERENCIAS] Usuario autenticado: " + userDetails.getEmail() + " (ID: " + usuarioId + ")");
            
            Map<String, Object> preferenciasActualizadas = preferenciasNotificacionService
                .actualizarPreferencias(usuarioId, preferencias);
            
            Map<String, Object> response = new HashMap<>();
            response.put("preferencias", preferenciasActualizadas);
            response.put("message", "Preferencias actualizadas exitosamente");
            
            System.out.println("🔔 [PREFERENCIAS] Preferencias actualizadas para usuario " + usuarioId + ": " + preferenciasActualizadas);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ [PREFERENCIAS] Error actualizando preferencias: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al actualizar preferencias: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
