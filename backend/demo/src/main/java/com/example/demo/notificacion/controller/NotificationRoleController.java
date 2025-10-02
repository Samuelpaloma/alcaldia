package com.example.demo.notificacion.controller;

import com.example.demo.notificacion.model.Notification;
import com.example.demo.notificacion.repository.NotificationRepository;
import com.example.demo.notificacion.service.NotificationRoleService;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/notifications/role-based")
@CrossOrigin(origins = "*")
public class NotificationRoleController {

    @Autowired
    private NotificationRoleService notificationRoleService;

    @Autowired
    private NotificationRepository NotificationRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    /**
     * Obtiene notificaciones para un usuario específico por email
     */
    @GetMapping("/user/{email}")
    public ResponseEntity<Map<String, Object>> getNotificationsByUser(
            @PathVariable String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            
            // Obtener el rol del usuario una sola vez
            final String userRole = getUsuarioRole(email);
            
            // Buscar TODAS las notificaciones (sin filtro por email)
            Page<Notification> todasLasNotificaciones = NotificationRepository
                .findAllOrderByFechaCreacionDesc(pageable);
            
            List<Map<String, Object>> notificacionesResponse = new ArrayList<>();
            
            for (Notification notif : todasLasNotificaciones.getContent()) {
                try {
                    List<String> destinatarios = objectMapper.readValue(
                        notif.getRecipients(), 
                        new TypeReference<List<String>>() {}
                    );
                    
                    // Verificar si el usuario está en los destinatarios
                    boolean esDestinatario = destinatarios.stream()
                        .anyMatch(dest -> {
                            // Verificar por email específico
                            if (dest.endsWith(":" + email)) {
                                return true;
                            }
                            // Verificar por rol específico
                            if (dest.equals("rol:" + userRole)) {
                                return true;
                            }
                            return false;
                        });
                    
                    if (esDestinatario) {
                        Map<String, Object> notificacionResponse = new HashMap<>();
                        notificacionResponse.put("id", notif.getId());
                        notificacionResponse.put("tipo", notif.getType());
                        notificacionResponse.put("mensaje", notif.getMessage());
                        notificacionResponse.put("destinatarios", destinatarios);
                        notificacionResponse.put("ticketId", notif.getTicketId());
                        notificacionResponse.put("usuarioActorNombre", notif.getActorUserName());
                        notificacionResponse.put("prioridad", notif.getPriority());
                        notificacionResponse.put("leida", notif.getRead());
                        notificacionResponse.put("fechaCreacion", notif.getCreatedAt());
                        notificacionResponse.put("fechaLectura", notif.getReadAt());
                        
                        notificacionesResponse.add(notificacionResponse);
                    }
                } catch (JsonProcessingException e) {
                    System.err.println("Error parseando destinatarios: " + e.getMessage());
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", notificacionesResponse);
            response.put("totalElements", notificacionesResponse.size());
            response.put("totalPages", (int) Math.ceil((double) notificacionesResponse.size() / size));
            response.put("currentPage", page);
            response.put("size", size);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error obteniendo notificaciones: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Obtiene notificaciones no leídas para un usuario específico
     */
    @GetMapping("/user/{email}/unread")
    public ResponseEntity<Map<String, Object>> getUnreadNotificationsByUser(@PathVariable String email) {
        try {
            // Obtener el rol del usuario una sola vez
            final String userRole = getUsuarioRole(email);
            
            // Buscar TODAS las notificaciones no leídas
            List<Notification> todasLasNotificaciones = NotificationRepository.findAll();
            
            List<Map<String, Object>> notificacionesResponse = new ArrayList<>();
            
            for (Notification notif : todasLasNotificaciones) {
                // Solo procesar notificaciones no leídas
                if (notif.getRead()) {
                    continue;
                }
                
                try {
                    List<String> destinatarios = objectMapper.readValue(
                        notif.getRecipients(), 
                        new TypeReference<List<String>>() {}
                    );
                    
                    // Verificar si el usuario está en los destinatarios
                    boolean esDestinatario = destinatarios.stream()
                        .anyMatch(dest -> {
                            // Verificar por email específico
                            if (dest.endsWith(":" + email)) {
                                return true;
                            }
                            // Verificar por rol específico
                            if (dest.equals("rol:" + userRole)) {
                                return true;
                            }
                            return false;
                        });
                    
                    if (esDestinatario) {
                        Map<String, Object> notificacionResponse = new HashMap<>();
                        notificacionResponse.put("id", notif.getId());
                        notificacionResponse.put("tipo", notif.getType());
                        notificacionResponse.put("mensaje", notif.getMessage());
                        notificacionResponse.put("destinatarios", destinatarios);
                        notificacionResponse.put("ticketId", notif.getTicketId());
                        notificacionResponse.put("usuarioActorNombre", notif.getActorUserName());
                        notificacionResponse.put("prioridad", notif.getPriority());
                        notificacionResponse.put("leida", notif.getRead());
                        notificacionResponse.put("fechaCreacion", notif.getCreatedAt());
                        notificacionResponse.put("fechaLectura", notif.getReadAt());
                        
                        notificacionesResponse.add(notificacionResponse);
                    }
                } catch (JsonProcessingException e) {
                    System.err.println("Error parseando destinatarios: " + e.getMessage());
                }
            }
            
            // Ordenar por fecha de creación descendente
            notificacionesResponse.sort((a, b) -> {
                String fechaA = (String) a.get("fechaCreacion");
                String fechaB = (String) b.get("fechaCreacion");
                return fechaB.compareTo(fechaA);
            });
            
            Map<String, Object> response = new HashMap<>();
            response.put("notifications", notificacionesResponse);
            response.put("count", notificacionesResponse.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error obteniendo notificaciones no leídas: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Marca una notificación como leída
     */
    @PutMapping("/{id}/mark-read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id, @RequestParam String email) {
        try {
            Optional<Notification> notificacionOpt = NotificationRepository.findById(id);
            
            if (notificacionOpt.isPresent()) {
                Notification notificacion = notificacionOpt.get();
                
                // Verificar si el usuario es destinatario
                List<String> destinatarios = objectMapper.readValue(
                    notificacion.getRecipients(), 
                    new TypeReference<List<String>>() {}
                );
                final String userRole = getUsuarioRole(email);
                boolean esDestinatario = destinatarios.stream()
                    .anyMatch(dest -> {
                        // Verificar por email específico
                        if (dest.endsWith(":" + email)) {
                            return true;
                        }
                        // Verificar por rol específico
                        if (dest.equals("rol:" + userRole)) {
                            return true;
                        }
                        return false;
                    });
                
                if (esDestinatario) {
                    notificacion.setRead(true);
                    notificacion.setReadAt(java.time.LocalDateTime.now());
                    NotificationRepository.save(notificacion);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Notificación marcada como leída");
                    
                    return ResponseEntity.ok(response);
                } else {
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Usuario no autorizado para esta notificación");
                    return ResponseEntity.status(403).body(errorResponse);
                }
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Notificación no encontrada");
                return ResponseEntity.status(404).body(errorResponse);
            }
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error marcando notificación como leída: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Obtiene ejemplos de notificaciones por tipo y rol
     */
    @GetMapping("/examples")
    public ResponseEntity<Map<String, Object>> getNotificationExamples() {
        Map<String, Object> examples = new HashMap<>();
        
        // Ejemplos de notificaciones de creación de ticket
        Map<String, Object> ticketCreado = new HashMap<>();
        ticketCreado.put("funcionario", Map.of(
            "id", 1,
            "tipo", "ticket_creado",
            "mensaje", "Tu ticket #1 ha sido creado exitosamente",
            "destinatarios", Arrays.asList("funcionario:roberrodrigues@gmail.com")
        ));
        ticketCreado.put("administrador", Map.of(
            "id", 1,
            "tipo", "ticket_creado",
            "mensaje", "Nuevo ticket creado por Rober Rodrigues (#1)",
            "destinatarios", Arrays.asList("rol:administrador")
        ));
        examples.put("ticket_creado", ticketCreado);
        
        // Ejemplos de notificaciones de asignación de ticket
        Map<String, Object> ticketAsignado = new HashMap<>();
        ticketAsignado.put("funcionario", Map.of(
            "id", 26,
            "tipo", "ticket_asignado",
            "mensaje", "Tu ticket #26 fue asignado al técnico Juan Pérez",
            "destinatarios", Arrays.asList("funcionario:roberrodrigues@gmail.com")
        ));
        ticketAsignado.put("tecnico", Map.of(
            "id", 26,
            "tipo", "ticket_asignado",
            "mensaje", "Se te asignó el ticket #26 del cliente Rober Rodrigues",
            "destinatarios", Arrays.asList("tecnico:juanperez@gmail.com")
        ));
        ticketAsignado.put("administrador", Map.of(
            "id", 26,
            "tipo", "ticket_asignado",
            "mensaje", "Has asignado el ticket #26 al técnico Juan Pérez",
            "destinatarios", Arrays.asList("rol:administrador")
        ));
        examples.put("ticket_asignado", ticketAsignado);
        
        // Ejemplos de notificaciones de resolución de ticket
        Map<String, Object> ticketResuelto = new HashMap<>();
        ticketResuelto.put("funcionario", Map.of(
            "id", 26,
            "tipo", "ticket_resuelto",
            "mensaje", "Tu ticket #26 ha sido resuelto por Juan Pérez",
            "destinatarios", Arrays.asList("funcionario:roberrodrigues@gmail.com")
        ));
        ticketResuelto.put("administrador", Map.of(
            "id", 26,
            "tipo", "ticket_resuelto",
            "mensaje", "El ticket #26 del cliente Rober Rodrigues fue resuelto por Juan Pérez",
            "destinatarios", Arrays.asList("rol:administrador")
        ));
        examples.put("ticket_resuelto", ticketResuelto);
        
        // Ejemplos de notificaciones de cierre de ticket
        Map<String, Object> ticketCerrado = new HashMap<>();
        ticketCerrado.put("funcionario", Map.of(
            "id", 26,
            "tipo", "ticket_cerrado",
            "mensaje", "Tu ticket #26 ha sido cerrado por Juan Pérez",
            "destinatarios", Arrays.asList("funcionario:roberrodrigues@gmail.com")
        ));
        ticketCerrado.put("administrador", Map.of(
            "id", 26,
            "tipo", "ticket_cerrado",
            "mensaje", "El ticket #26 del cliente Rober Rodrigues fue cerrado por Juan Pérez",
            "destinatarios", Arrays.asList("rol:administrador")
        ));
        examples.put("ticket_cerrado", ticketCerrado);
        
        return ResponseEntity.ok(examples);
    }

    /**
     * Endpoint para crear notificaciones de prueba
     */
    @PostMapping("/create-test-notifications")
    public ResponseEntity<Map<String, Object>> createTestNotifications() {
        try {
            // Crear notificaciones de ejemplo usando los métodos correctos
            notificationRoleService.notificarCreacionTicket(1L, 1L);
            notificationRoleService.notificarAsignacionTicket(1L, 1L, 2L);
            notificationRoleService.notificarResolucionTicket(1L, 2L);
            notificationRoleService.notificarCierreTicket(1L, 1L);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Notificaciones de prueba creadas exitosamente");
            response.put("status", "success");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error creando notificaciones de prueba: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/trigger-ticket-created")
    public ResponseEntity<Map<String, Object>> triggerTicketCreated(@RequestBody Map<String, Object> request) {
        try {
            Long ticketId = Long.valueOf(request.get("ticketId").toString());
            Long creatorId = Long.valueOf(request.get("creatorId").toString());
            
            // Verificar si el creador es SuperAdmin antes de notificar
            Usuario creador = usuarioRepository.findById(creatorId).orElse(null);
            if (creador != null && "Super Administrador".equals(creador.getFullName() + " " + creador.getLastName())) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Notificación saltada - creador es SuperAdmin");
                response.put("status", "skipped");
                return ResponseEntity.ok(response);
            }
            
            // Crear notificación de ticket creado
            notificationRoleService.notificarCreacionTicket(ticketId, creatorId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Notificación de ticket creado enviada exitosamente");
            response.put("status", "success");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error enviando notificación de ticket creado: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/trigger-ticket-assigned")
    public ResponseEntity<Map<String, Object>> triggerTicketAssigned(@RequestBody Map<String, Object> request) {
        try {
            Long ticketId = Long.valueOf(request.get("ticketId").toString());
            Long technicianId = Long.valueOf(request.get("technicianId").toString());
            Long assignerId = Long.valueOf(request.get("assignerId").toString());
            
            // Crear notificación de ticket asignado
            notificationRoleService.notificarAsignacionTicket(ticketId, assignerId, technicianId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Notificación de ticket asignado enviada exitosamente");
            response.put("status", "success");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error enviando notificación de ticket asignado: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Endpoint de debug para verificar notificaciones
     */
    @GetMapping("/debug/{email}")
    public ResponseEntity<Map<String, Object>> debugNotifications(@PathVariable String email) {
        Map<String, Object> debugInfo = new HashMap<>();
        
        try {
            // 1. Verificar si el usuario existe
            Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
            debugInfo.put("usuarioExiste", usuario != null);
            if (usuario != null) {
                debugInfo.put("usuarioInfo", Map.of(
                    "id", usuario.getId(),
                    "nombre", usuario.getFirstName() + " " + usuario.getLastName(),
                    "email", usuario.getEmail(),
                    "tipoUsuario", usuario.getUserType().toString(),
                    "activo", usuario.getActive()
                ));
            }
            
            // 2. Buscar todas las notificaciones que contengan este email
            List<Notification> todasLasNotificaciones = NotificationRepository
                .findByDestinatariosContaining(email);
            debugInfo.put("totalNotificacionesConteniendoEmail", todasLasNotificaciones.size());
            
            // 3. Buscar notificaciones específicas para este email
            List<Notification> notificacionesEspecificas = new ArrayList<>();
            for (Notification notif : todasLasNotificaciones) {
                try {
                    List<String> destinatarios = objectMapper.readValue(
                        notif.getRecipients(), 
                        new TypeReference<List<String>>() {}
                    );
                    boolean esDestinatario = destinatarios.stream()
                        .anyMatch(dest -> dest.endsWith(":" + email));
                    if (esDestinatario) {
                        notificacionesEspecificas.add(notif);
                    }
                } catch (Exception e) {
                    System.err.println("Error parseando destinatarios: " + e.getMessage());
                }
            }
            debugInfo.put("notificacionesEspecificas", notificacionesEspecificas.size());
            
            // 4. Buscar notificaciones por rol
            String userRole = getUsuarioRole(email);
            debugInfo.put("userRole", userRole);
            
            List<Notification> notificacionesPorRol = new ArrayList<>();
            for (Notification notif : todasLasNotificaciones) {
                try {
                    List<String> destinatarios = objectMapper.readValue(
                        notif.getRecipients(), 
                        new TypeReference<List<String>>() {}
                    );
                    boolean esDestinatarioPorRol = destinatarios.stream()
                        .anyMatch(dest -> dest.equals("rol:" + userRole));
                    if (esDestinatarioPorRol) {
                        notificacionesPorRol.add(notif);
                    }
                } catch (Exception e) {
                    System.err.println("Error parseando destinatarios: " + e.getMessage());
                }
            }
            debugInfo.put("notificacionesPorRol", notificacionesPorRol.size());
            
            // 5. Mostrar algunas notificaciones de ejemplo
            debugInfo.put("ejemplosNotificaciones", todasLasNotificaciones.stream()
                .limit(3)
                .map(notif -> Map.of(
                    "id", notif.getId(),
                    "tipo", notif.getType(),
                    "mensaje", notif.getMessage(),
                    "destinatarios", notif.getRecipients()
                ))
                .toList());
            
            // 6. Contar total de notificaciones en la base de datos
            long totalNotificaciones = NotificationRepository.count();
            debugInfo.put("totalNotificacionesEnBD", totalNotificaciones);
            
            return ResponseEntity.ok(debugInfo);
            
        } catch (Exception e) {
            debugInfo.put("error", "Error en debug: " + e.getMessage());
            return ResponseEntity.status(500).body(debugInfo);
        }
    }
    
    private String getUsuarioRole(String email) {
        try {
            Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
            if (usuario != null && usuario.getUserType() != null) {
                return usuario.getUserType().toString().toLowerCase();
            }
        } catch (Exception e) {
            System.err.println("Error obteniendo rol del usuario: " + e.getMessage());
        }
        return "funcionario"; // Default
    }

    /**
     * Endpoint de prueba para enviar notificación por WebSocket
     */
    @PostMapping("/test-websocket")
    public ResponseEntity<Map<String, Object>> testWebSocket() {
        try {
            System.out.println("🔔 [DEBUG] ===== PROBANDO WEBSOCKET =====");
            
            // Crear notificación de prueba
            Map<String, Object> notificacionPrueba = new HashMap<>();
            notificacionPrueba.put("id", 999);
            notificacionPrueba.put("tipo", "ticket_creado");
            notificacionPrueba.put("mensaje", "PRUEBA: Nuevo ticket creado por Usuario Prueba (#999)");
            notificacionPrueba.put("destinatarios", Arrays.asList("rol:administrador"));
            notificacionPrueba.put("ticketId", 999);
            notificacionPrueba.put("usuarioActorId", 1L);
            notificacionPrueba.put("usuarioActorEmail", "prueba@test.com");
            notificacionPrueba.put("usuarioActorNombre", "Usuario Prueba");
            notificacionPrueba.put("prioridad", "normal");
            notificacionPrueba.put("leida", false);
            notificacionPrueba.put("fechaCreacion", java.time.LocalDateTime.now().toString());
            
            // Enviar por WebSocket directamente
            System.out.println("🔔 [DEBUG] Enviando notificación de prueba por WebSocket...");
            messagingTemplate.convertAndSend("/topic/notifications", notificacionPrueba);
            System.out.println("🔔 [DEBUG] ✅ Notificación de prueba enviada");
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Notificación de prueba enviada por WebSocket");
            response.put("status", "success");
            response.put("notification", notificacionPrueba);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error enviando notificación de prueba: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Elimina una notificación específica
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteNotification(@PathVariable Long id) {
        try {
            System.out.println("🔔 [DEBUG] Eliminando notificación ID: " + id);
            
            // Verificar si la notificación existe
            Optional<Notification> notificacionOpt = NotificationRepository.findById(id);
            if (!notificacionOpt.isPresent()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Notificación no encontrada");
                return ResponseEntity.status(404).body(errorResponse);
            }
            
            // Eliminar la notificación
            NotificationRepository.deleteById(id);
            System.out.println("🔔 [DEBUG] ✅ Notificación eliminada exitosamente");
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Notificación eliminada exitosamente");
            response.put("status", "success");
            response.put("deletedId", id);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("🔔 [DEBUG] ❌ Error eliminando notificación: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error eliminando notificación: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
