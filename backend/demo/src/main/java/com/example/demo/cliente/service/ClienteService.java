package com.example.demo.cliente.service;

import com.example.demo.cliente.dto.request.ResponderResolucionRequestDTO;
import com.example.demo.notificacion.service.NotificationRoleService;
import com.example.demo.ticket.model.HistorialEstadoTicket;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.HistorialEstadoTicketRepository;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClienteService {
    
    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificationRoleService notificationRoleService;
    private final HistorialEstadoTicketRepository historialEstadoTicketRepository;
    
    @Transactional
    public void responderResolucion(ResponderResolucionRequestDTO request, String emailCliente) {
        log.info("🔔 [CLIENTE] Cliente {} respondiendo a ticket {}", emailCliente, request.getTicketId());
        log.info("🔔 [CLIENTE] Acción: {}", request.getAccion());
        
        // Obtener el ticket
        Ticket ticket = ticketRepository.findById(request.getTicketId())
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // Verificar que el ticket sea del cliente
        Usuario cliente = usuarioRepository.findByEmail(emailCliente)
            .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        
        if (!ticket.getCreadorEmail().equals(emailCliente)) {
            throw new RuntimeException("No tienes permiso para modificar este ticket");
        }
        
        // Verificar que el ticket esté en estado RESUELTO
        if (!"RESUELTO".equals(ticket.getEstado())) {
            throw new RuntimeException("Solo puedes responder a tickets en estado RESUELTO");
        }
        
        if ("CONFIRMAR".equalsIgnoreCase(request.getAccion())) {
            // Cliente confirma que está resuelto → CERRADO
            String estadoAnterior = ticket.getEstado();
            ticket.setEstado("CERRADO");
            ticketRepository.save(ticket);
            
            // Guardar historial de estado
            guardarHistorialEstado(ticket, estadoAnterior, "CERRADO", 
                "Cliente confirmó que el problema fue resuelto satisfactoriamente", 
                cliente, "CLIENTE");
            
            log.info("✅ [CLIENTE] Ticket {} cerrado por confirmación del cliente", ticket.getId());
            
            // Notificar cierre de ticket a todos los roles
            notificationRoleService.notificarCierreTicket(ticket.getId(), cliente.getIdUsuario());
            
        } else if ("RECHAZAR".equalsIgnoreCase(request.getAccion()) || "ESCALAR".equalsIgnoreCase(request.getAccion())) {
            // Cliente rechaza → vuelve a PENDIENTE para reasignación
            String estadoAnterior = ticket.getEstado();
            ticket.setEstado("PENDIENTE");
            ticketRepository.save(ticket);
            
            // Guardar historial de estado
            guardarHistorialEstado(ticket, estadoAnterior, "PENDIENTE", 
                request.getComentario() != null ? request.getComentario() : "Cliente solicitó escalamiento - la solución no fue satisfactoria", 
                cliente, "CLIENTE");
            
            log.info("⚠️ [CLIENTE] Ticket {} reabierto por rechazo del cliente - estado PENDIENTE", ticket.getId());
            
            // Crear notificación específica para ADMINISTRADORES con prioridad ALTA
            String mensajeAdmin = String.format(
                "🔴 URGENTE - REAPERTURA DE TICKET - El cliente rechazó la solución del ticket #%d. " +
                "Asunto: %s. El ticket está PENDIENTE y requiere reasignación inmediata a un técnico de mayor nivel.",
                ticket.getId(),
                ticket.getAsunto()
            );
            
            notificationRoleService.crearNotificacionParaRol(
                "TICKET_REABIERTO_POR_CLIENTE",
                mensajeAdmin,
                "rol:administrador",
                ticket.getId(),
                cliente.getIdUsuario(),
                "alta"
            );
            
            // Notificar al técnico actual que el cliente rechazó su solución
            if (ticket.getTecnicoEmail() != null) {
                Usuario tecnico = usuarioRepository.findByEmail(ticket.getTecnicoEmail()).orElse(null);
                if (tecnico != null) {
                    String mensajeTecnico = String.format(
                        "⚠️ El cliente rechazó la solución del ticket #%d. " +
                        "El ticket fue reabierto y está PENDIENTE de reasignación por el administrador.",
                        ticket.getId()
                    );
                    
                    notificationRoleService.crearNotificacionParaUsuario(
                        "SOLUCION_RECHAZADA",
                        mensajeTecnico,
                        tecnico.getEmail(),
                        ticket.getId(),
                        cliente.getIdUsuario(),
                        "alta"
                    );
                }
            }
            
            // Notificar al cliente que su solicitud fue recibida
            String mensajeCliente = String.format(
                "✅ Tu ticket #%d fue reabierto y está PENDIENTE. " +
                "Un administrador revisará tu caso y asignará un técnico de mayor nivel pronto.",
                ticket.getId()
            );
            
            notificationRoleService.crearNotificacionParaUsuario(
                "TICKET_REABIERTO",
                mensajeCliente,
                emailCliente,
                ticket.getId(),
                cliente.getIdUsuario(),
                "normal"
            );
            
        } else {
            throw new RuntimeException("Acción no válida. Debe ser CONFIRMAR o RECHAZAR");
        }
    }
    
    /**
     * Guardar historial de cambio de estado
     */
    private void guardarHistorialEstado(Ticket ticket, String estadoAnterior, String estadoNuevo, 
                                      String comentario, Usuario usuario, String tipoUsuario) {
        try {
            HistorialEstadoTicket historial = HistorialEstadoTicket.builder()
                .ticket(ticket)
                .cambiadoPor(usuario)
                .estadoAnterior(estadoAnterior)
                .estadoNuevo(estadoNuevo)
                .comentario(comentario)
                .tipoUsuario(tipoUsuario)
                .build();
            
            historialEstadoTicketRepository.save(historial);
            
            log.info("📝 [HISTORIAL] Guardado cambio de estado: {} → {} por {}", 
                estadoAnterior, estadoNuevo, tipoUsuario);
        } catch (Exception e) {
            log.error("❌ [HISTORIAL] Error guardando historial: {}", e.getMessage());
        }
    }
}

