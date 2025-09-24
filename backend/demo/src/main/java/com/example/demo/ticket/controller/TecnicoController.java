package com.example.demo.ticket.controller;

import com.example.demo.ticket.dto.TecnicoDashboardDTO;
import com.example.demo.ticket.service.TecnicoService;
import com.example.demo.usuario.model.User;
import com.example.demo.usuario.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tecnico")
@CrossOrigin(origins = "*")
public class TecnicoController {
    
    @Autowired
    private TecnicoService tecnicoService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Endpoint para obtener estadísticas del dashboard del técnico
     * GET /api/tecnico/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        try {
            // Obtener el usuario autenticado
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("🔍 [TECNICO] Authentication: " + authentication);
            System.out.println("🔍 [TECNICO] Authentication name: " + (authentication != null ? authentication.getName() : "null"));
            System.out.println("🔍 [TECNICO] Authentication principal: " + (authentication != null ? authentication.getPrincipal() : "null"));
            
            if (authentication == null || authentication.getName() == null || authentication.getName().equals("anonymousUser")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Usuario no autenticado");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            String userIdOrEmail = authentication.getName();
            System.out.println("🔍 [TECNICO] User ID or email: " + userIdOrEmail);
            
            // Determinar si es ID o email y obtener el usuario
            User user;
            try {
                // Intentar parsear como ID primero
                Integer userId = Integer.parseInt(userIdOrEmail);
                System.out.println("🔍 [TECNICO] Parsed as user ID: " + userId);
                user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
            } catch (NumberFormatException e) {
                // Si no es un número, tratar como email
                System.out.println("🔍 [TECNICO] Treating as email: " + userIdOrEmail);
                user = userRepository.findByEmail(userIdOrEmail)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + userIdOrEmail));
            }
            
            System.out.println("🔍 [TECNICO] User found: " + user.getNombre() + " (" + user.getEmail() + ")");
            
            // Obtener estadísticas del técnico usando el ID
            TecnicoDashboardDTO stats = tecnicoService.getDashboardStats(user.getId());
            
            // Crear respuesta con el formato esperado por el frontend
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Estadísticas obtenidas exitosamente");
            response.put("stats", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al obtener estadísticas: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Endpoint alternativo para obtener estadísticas por ID de técnico
     * GET /api/tecnico/dashboard/{tecnicoId}
     */
    @GetMapping("/dashboard/{tecnicoId}")
    public ResponseEntity<?> getDashboardStatsById(@PathVariable Integer tecnicoId) {
        try {
            TecnicoDashboardDTO stats = tecnicoService.getDashboardStats(tecnicoId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Estadísticas obtenidas exitosamente");
            response.put("stats", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al obtener estadísticas: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Endpoint para obtener tickets detallados del técnico
     * GET /api/tecnico/tickets
     */
    @GetMapping("/tickets")
    public ResponseEntity<?> getTicketsDetallados() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userIdOrEmail = authentication.getName();
            
            System.out.println("🔍 [TECNICO] Obteniendo tickets detallados para: " + userIdOrEmail);
            
            User user;
            try {
                // Intentar parsear como ID primero
                Integer userId = Integer.parseInt(userIdOrEmail);
                System.out.println("🔍 [TECNICO] Parsed as user ID: " + userId);
                user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
            } catch (NumberFormatException e) {
                // Si no es un número, tratar como email
                System.out.println("🔍 [TECNICO] Treating as email: " + userIdOrEmail);
                user = userRepository.findByEmail(userIdOrEmail)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + userIdOrEmail));
            }
            
            System.out.println("🔍 [TECNICO] User found: " + user.getNombre() + " (" + user.getEmail() + ")");
            
            // Obtener tickets del técnico
            List<Map<String, Object>> tickets = tecnicoService.getTicketsDetallados(user.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tickets obtenidos exitosamente");
            response.put("tickets", tickets);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al obtener tickets: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Endpoint para cambiar el estado de un ticket
     * PUT /api/tecnico/tickets/{ticketId}/status
     */
    @PutMapping("/tickets/{ticketId}/status")
    public ResponseEntity<?> changeTicketStatus(@PathVariable String ticketId, @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("estado");
            System.out.println("🔄 [TECNICO] Cambiando estado del ticket " + ticketId + " a " + newStatus);
            
            // Por ahora, simular el cambio de estado
            // En una implementación real, aquí se actualizaría la base de datos
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Estado del ticket actualizado exitosamente");
            response.put("ticketId", ticketId);
            response.put("newStatus", newStatus);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al cambiar estado del ticket: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Endpoint para obtener evidencias del técnico
     * GET /api/tecnico/evidencias
     */
    @GetMapping("/evidencias")
    public ResponseEntity<?> getEvidencias() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userIdOrEmail = authentication.getName();
            
            System.out.println("🔍 [TECNICO] Obteniendo evidencias para: " + userIdOrEmail);
            
            User user;
            try {
                // Intentar parsear como ID primero
                Integer userId = Integer.parseInt(userIdOrEmail);
                System.out.println("🔍 [TECNICO] Parsed as user ID: " + userId);
                user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
            } catch (NumberFormatException e) {
                // Si no es un número, tratar como email
                System.out.println("🔍 [TECNICO] Treating as email: " + userIdOrEmail);
                user = userRepository.findByEmail(userIdOrEmail)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + userIdOrEmail));
            }
            
            System.out.println("🔍 [TECNICO] User found: " + user.getNombre() + " (" + user.getEmail() + ")");
            
            // Obtener evidencias del técnico
            List<Map<String, Object>> evidencias = tecnicoService.getEvidencias(user.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Evidencias obtenidas exitosamente");
            response.put("evidencias", evidencias);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al obtener evidencias: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Endpoint para obtener notificaciones del técnico
     * GET /api/tecnico/notificaciones
     */
    @GetMapping("/notificaciones")
    public ResponseEntity<?> getNotificaciones() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userIdOrEmail = authentication.getName();
            
            System.out.println("🔍 [TECNICO] Obteniendo notificaciones para: " + userIdOrEmail);
            
            User user;
            try {
                // Intentar parsear como ID primero
                Integer userId = Integer.parseInt(userIdOrEmail);
                System.out.println("🔍 [TECNICO] Parsed as user ID: " + userId);
                user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
            } catch (NumberFormatException e) {
                // Si no es un número, tratar como email
                System.out.println("🔍 [TECNICO] Treating as email: " + userIdOrEmail);
                user = userRepository.findByEmail(userIdOrEmail)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + userIdOrEmail));
            }
            
            System.out.println("🔍 [TECNICO] User found: " + user.getNombre() + " (" + user.getEmail() + ")");
            
            // Obtener notificaciones del técnico
            List<Map<String, Object>> notificaciones = tecnicoService.getNotificaciones(user.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Notificaciones obtenidas exitosamente");
            response.put("notificaciones", notificaciones);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al obtener notificaciones: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Endpoint para cambiar el estado de un ticket
     * PUT /api/tecnico/tickets/{ticketId}/estado
     */
    @PutMapping("/tickets/{ticketId}/estado")
    public ResponseEntity<?> cambiarEstadoTicket(@PathVariable String ticketId, 
                                               @RequestParam String estado) {
        try {
            System.out.println("🔍 [TECNICO] Cambiando estado del ticket: " + ticketId + " a " + estado);
            
            // Cambiar estado usando el servicio
            Map<String, Object> resultado = tecnicoService.cambiarEstadoTicket(ticketId, estado);
            
            if ((Boolean) resultado.get("success")) {
                return ResponseEntity.ok(resultado);
            } else {
                return ResponseEntity.badRequest().body(resultado);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al cambiar estado: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Endpoint para guardar evidencia de un ticket
     * POST /api/tecnico/evidencias
     */
    @PostMapping("/evidencias")
    public ResponseEntity<?> guardarEvidencia(@RequestParam String ticketId, 
                                            @RequestParam String descripcion,
                                            @RequestParam("archivo") MultipartFile archivo) {
        try {
            System.out.println("🔍 [TECNICO] Guardando evidencia para ticket: " + ticketId);
            System.out.println("🔍 [TECNICO] Descripción: " + descripcion);
            System.out.println("🔍 [TECNICO] Archivo: " + (archivo != null ? archivo.getOriginalFilename() : "null"));
            
            // Validar que el archivo no esté vacío
            if (archivo == null || archivo.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "No se ha proporcionado ningún archivo");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Guardar evidencia usando el servicio
            Map<String, Object> resultado = tecnicoService.guardarEvidencia(ticketId, descripcion, archivo.getOriginalFilename());
            
            if ((Boolean) resultado.get("success")) {
                return ResponseEntity.ok(resultado);
            } else {
                return ResponseEntity.badRequest().body(resultado);
            }
            
        } catch (Exception e) {
            System.out.println("❌ [TECNICO] Error guardando evidencia: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al guardar evidencia: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
