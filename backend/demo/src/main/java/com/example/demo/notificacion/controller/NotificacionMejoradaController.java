package com.example.demo.notificacion.controller;

import com.example.demo.notificacion.model.NotificacionMejorada;
import com.example.demo.notificacion.service.NotificacionMejoradaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/notificaciones-mejoradas")
@CrossOrigin(origins = "*")
public class NotificacionMejoradaController {
    
    @Autowired
    private NotificacionMejoradaService notificacionMejoradaService;
    
    @GetMapping("/usuario/{email}")
    public ResponseEntity<List<NotificacionMejorada>> obtenerNotificacionesPorUsuario(@PathVariable String email) {
        try {
            List<NotificacionMejorada> notificaciones = notificacionMejoradaService.obtenerNotificacionesPorUsuario(email);
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/usuario/current")
    public ResponseEntity<List<NotificacionMejorada>> obtenerNotificacionesUsuarioActual() {
        try {
            // Crear notificaciones de ejemplo más realistas
            List<NotificacionMejorada> notificaciones = new ArrayList<>();
            
            // Notificación 1: Ticket creado
            NotificacionMejorada notif1 = new NotificacionMejorada();
            notif1.setId(1L);
            notif1.setTipo("ticket_creado");
            notif1.setMensaje("Nuevo ticket creado por Rober Rodrigues (#26)");
            notif1.setDestinatarios("[\"rol:administrador\"]");
            notif1.setTicketId(26L);
            notif1.setUsuarioActorNombre("Rober Rodrigues");
            notif1.setPrioridad("normal");
            notif1.setLeida(false);
            notif1.setFechaCreacion(LocalDateTime.now().minusMinutes(5));
            notificaciones.add(notif1);
            
            // Notificación 2: Ticket asignado
            NotificacionMejorada notif2 = new NotificacionMejorada();
            notif2.setId(2L);
            notif2.setTipo("ticket_asignado");
            notif2.setMensaje("Tu ticket #26 fue asignado al técnico Juan Pérez");
            notif2.setDestinatarios("[\"funcionario:roberrodrigues@gmail.com\"]");
            notif2.setTicketId(26L);
            notif2.setUsuarioActorNombre("Admin Sistema");
            notif2.setPrioridad("normal");
            notif2.setLeida(false);
            notif2.setFechaCreacion(LocalDateTime.now().minusMinutes(3));
            notificaciones.add(notif2);
            
            // Notificación 3: Ticket resuelto
            NotificacionMejorada notif3 = new NotificacionMejorada();
            notif3.setId(3L);
            notif3.setTipo("ticket_resuelto");
            notif3.setMensaje("Tu ticket #26 ha sido resuelto por Juan Pérez");
            notif3.setDestinatarios("[\"funcionario:roberrodrigues@gmail.com\"]");
            notif3.setTicketId(26L);
            notif3.setUsuarioActorNombre("Juan Pérez");
            notif3.setPrioridad("normal");
            notif3.setLeida(true);
            notif3.setFechaCreacion(LocalDateTime.now().minusMinutes(1));
            notif3.setFechaLectura(LocalDateTime.now().minusMinutes(1));
            notificaciones.add(notif3);
            
            // Notificación 4: SLA vencido (crítica)
            NotificacionMejorada notif4 = new NotificacionMejorada();
            notif4.setId(4L);
            notif4.setTipo("sla_vencido");
            notif4.setMensaje("⚠️ SLA vencido para el ticket #25");
            notif4.setDestinatarios("[\"rol:tecnico\", \"rol:administrador\"]");
            notif4.setTicketId(25L);
            notif4.setPrioridad("critica");
            notif4.setLeida(false);
            notif4.setFechaCreacion(LocalDateTime.now().minusSeconds(30));
            notificaciones.add(notif4);
            
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            System.err.println("❌ Error creando notificaciones de ejemplo: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/rol/{rol}")
    public ResponseEntity<List<NotificacionMejorada>> obtenerNotificacionesPorRol(@PathVariable String rol) {
        try {
            List<NotificacionMejorada> notificaciones = notificacionMejoradaService.obtenerNotificacionesPorRol(rol);
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/no-leidas/{email}")
    public ResponseEntity<List<NotificacionMejorada>> obtenerNotificacionesNoLeidas(@PathVariable String email) {
        try {
            List<NotificacionMejorada> notificaciones = notificacionMejoradaService.obtenerNotificacionesNoLeidas(email);
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<List<NotificacionMejorada>> obtenerNotificacionesPorTicket(@PathVariable Long ticketId) {
        try {
            List<NotificacionMejorada> notificaciones = notificacionMejoradaService.obtenerNotificacionesPorTicket(ticketId);
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<NotificacionMejorada>> obtenerNotificacionesPorTipo(@PathVariable String tipo) {
        try {
            List<NotificacionMejorada> notificaciones = notificacionMejoradaService.obtenerNotificacionesPorTipo(tipo);
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/criticas")
    public ResponseEntity<List<NotificacionMejorada>> obtenerNotificacionesCriticas() {
        try {
            List<NotificacionMejorada> notificaciones = notificacionMejoradaService.obtenerNotificacionesCriticas();
            return ResponseEntity.ok(notificaciones);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/contar-no-leidas/{email}")
    public ResponseEntity<Long> contarNotificacionesNoLeidas(@PathVariable String email) {
        try {
            Long count = notificacionMejoradaService.contarNotificacionesNoLeidas(email);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/marcar-leida/{id}")
    public ResponseEntity<NotificacionMejorada> marcarComoLeida(@PathVariable Long id) {
        try {
            NotificacionMejorada notificacion = notificacionMejoradaService.marcarComoLeida(id);
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
            notificacionMejoradaService.eliminarNotificacion(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
