package com.example.demo.notificacion.controller;

import com.example.demo.notificacion.model.Notification;
import com.example.demo.notificacion.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/notificaciones-mejoradas")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired
    private NotificationService NotificationService;
    
    @GetMapping("/usuario/{email}")
    public ResponseEntity<List<Notification>> obtenerNotificacionesPorUsuario(@PathVariable String email) {
        try {
            List<Notification> notificaciones = NotificationService.obtenerNotificacionesPorUsuario(email);
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/usuario/current")
    public ResponseEntity<List<Notification>> obtenerNotificacionesUsuarioActual() {
        try {
            // Crear notificaciones de ejemplo más realistas
            List<Notification> notificaciones = new ArrayList<>();
            
            // Notificación 1: Ticket creado
            Notification notif1 = new Notification();
            notif1.setId(1L);
            notif1.setType(Notification.TYPE_TICKET_CREATED);
            notif1.setMessage("Nuevo ticket creado por Rober Rodrigues (#26)");
            notif1.setRecipients("[\"rol:administrador\"]");
            notif1.setTicketId(26L);
            notif1.setActorUserName("Rober Rodrigues");
            notif1.setPriority(Notification.PRIORITY_NORMAL);
            notif1.setRead(false);
            notif1.setCreatedAt(LocalDateTime.now().minusMinutes(5));
            notificaciones.add(notif1);
            
            // Notificación 2: Ticket asignado
            Notification notif2 = new Notification();
            notif2.setId(2L);
            notif2.setType(Notification.TYPE_TICKET_ASSIGNED);
            notif2.setMessage("Tu ticket #26 fue asignado al técnico Juan Pérez");
            notif2.setRecipients("[\"funcionario:roberrodrigues@gmail.com\"]");
            notif2.setTicketId(26L);
            notif2.setActorUserName("Admin Sistema");
            notif2.setPriority(Notification.PRIORITY_NORMAL);
            notif2.setRead(false);
            notif2.setCreatedAt(LocalDateTime.now().minusMinutes(3));
            notificaciones.add(notif2);
            
            // Notificación 3: Ticket resuelto
            Notification notif3 = new Notification();
            notif3.setId(3L);
            notif3.setType(Notification.TYPE_TICKET_RESOLVED);
            notif3.setMessage("Tu ticket #26 ha sido resuelto por Juan Pérez");
            notif3.setRecipients("[\"funcionario:roberrodrigues@gmail.com\"]");
            notif3.setTicketId(26L);
            notif3.setActorUserName("Juan Pérez");
            notif3.setPriority(Notification.PRIORITY_NORMAL);
            notif3.setRead(true);
            notif3.setCreatedAt(LocalDateTime.now().minusMinutes(1));
            notif3.setReadAt(LocalDateTime.now().minusMinutes(1));
            notificaciones.add(notif3);
            
            // Notificación 4: SLA vencido (crítica)
            Notification notif4 = new Notification();
            notif4.setId(4L);
            notif4.setType(Notification.TYPE_SLA_EXPIRED);
            notif4.setMessage("⚠️ SLA vencido para el ticket #25");
            notif4.setRecipients("[\"rol:tecnico\", \"rol:administrador\"]");
            notif4.setTicketId(25L);
            notif4.setPriority(Notification.PRIORITY_CRITICAL);
            notif4.setRead(false);
            notif4.setCreatedAt(LocalDateTime.now().minusSeconds(30));
            notificaciones.add(notif4);
            
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            System.err.println("❌ Error creando notificaciones de ejemplo: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/rol/{rol}")
    public ResponseEntity<List<Notification>> obtenerNotificacionesPorRol(@PathVariable String rol) {
        try {
            List<Notification> notificaciones = NotificationService.obtenerNotificacionesPorRol(rol);
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/no-leidas/{email}")
    public ResponseEntity<List<Notification>> obtenerNotificacionesNoLeidas(@PathVariable String email) {
        try {
            List<Notification> notificaciones = NotificationService.obtenerNotificacionesNoLeidas(email);
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<Notification>> obtenerNotificacionesPorTicket(@PathVariable Long ticketId) {
        try {
            List<Notification> notificaciones = NotificationService.obtenerNotificacionesPorTicket(ticketId);
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Notification>> obtenerNotificacionesPorTipo(@PathVariable String tipo) {
        try {
            List<Notification> notificaciones = NotificationService.obtenerNotificacionesPorTipo(tipo);
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/criticas")
    public ResponseEntity<List<Notification>> obtenerNotificacionesCriticas() {
        try {
            List<Notification> notificaciones = NotificationService.obtenerNotificacionesCriticas();
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/contar-no-leidas/{email}")
    public ResponseEntity<Long> contarNotificacionesNoLeidas(@PathVariable String email) {
        try {
            Long count = NotificationService.contarNotificacionesNoLeidas(email);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/marcar-leida/{id}")
    public ResponseEntity<Notification> marcarComoLeida(@PathVariable Long id) {
        try {
            Notification notificacion = NotificationService.marcarComoLeida(id);
            if (notificacion != null) {
                return ResponseEntity.ok(notificacion);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarNotificacion(@PathVariable Long id) {
        try {
            NotificationService.eliminarNotificacion(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
