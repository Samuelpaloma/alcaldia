package com.example.demo.notificacion.controller;

import com.example.demo.notificacion.model.NotificacionMejorada;
import com.example.demo.notificacion.service.NotificacionMejoradaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones/movil")
@CrossOrigin(origins = "*")
public class NotificacionMovilController {
    
    @Autowired
    private NotificacionMejoradaService notificacionMejoradaService;
    
    /**
     * Obtener todas las notificaciones del usuario para móvil
     * GET /api/notificaciones/movil
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerNotificacionesMovil(
            @RequestParam(required = false) String email) {
        try {
            // Usar email por defecto si no se proporciona
            String emailUsuario = email != null ? email : "admin@test.com";
            
            List<NotificacionMejorada> notificaciones = notificacionMejoradaService
                .obtenerNotificacionesPorUsuario(emailUsuario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("notificaciones", notificaciones);
            response.put("total", notificaciones.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
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
            
            List<NotificacionMejorada> notificaciones = notificacionMejoradaService
                .obtenerNotificacionesPorUsuario(emailUsuario);
            
            // Filtrar solo las no leídas
            List<NotificacionMejorada> notificacionesNoLeidas = notificaciones.stream()
                .filter(n -> !n.getLeida())
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
            NotificacionMejorada notificacion = notificacionMejoradaService.marcarComoLeida(id);
            
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
            // Usar email por defecto si no se proporciona
            String emailUsuario = email != null ? email : "admin@test.com";
            
            Long count = notificacionMejoradaService.contarNotificacionesNoLeidas(emailUsuario);
            
            Map<String, Object> response = new HashMap<>();
            response.put("count", count);
            response.put("email", emailUsuario);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
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
            @RequestParam(required = false) String email) {
        try {
            // Crear preferencias por defecto
            Map<String, Object> preferencias = new HashMap<>();
            preferencias.put("usuarioId", 1); // ID por defecto
            preferencias.put("pushActivo", true);
            preferencias.put("emailActivo", true);
            preferencias.put("notificacionesTicketAsignado", true);
            preferencias.put("notificacionesTicketEnProceso", true);
            preferencias.put("notificacionesTicketResuelto", true);
            preferencias.put("notificacionesComentarios", true);
            preferencias.put("notificacionesEvidencias", true);
            preferencias.put("notificacionesSla", true);
            preferencias.put("notificacionesSistema", true);
            
            Map<String, Object> response = new HashMap<>();
            response.put("preferencias", preferencias);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
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
            @RequestBody Map<String, Object> preferencias) {
        try {
            // Por ahora solo devolvemos las preferencias actualizadas
            // En una implementación real, se guardarían en la base de datos
            
            Map<String, Object> response = new HashMap<>();
            response.put("preferencias", preferencias);
            response.put("message", "Preferencias actualizadas exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al actualizar preferencias: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
