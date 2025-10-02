package com.example.demo.sla.service;

import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.notificacion.service.NotificationRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SLAMonitoringService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private NotificationRoleService notificationRoleService;

    // Cache para evitar notificaciones duplicadas
    private final Map<String, LocalDateTime> lastNotificationCache = new ConcurrentHashMap<>();

    /**
     * Monitoreo continuo de SLA - se ejecuta cada 5 minutos
     */
    @Scheduled(fixedRate = 300000) // 5 minutos
    public void monitorearSLA() {
        System.out.println("🔍 [SLA Monitoring] ===== INICIANDO MONITOREO CONTINUO DE SLA =====");
        System.out.println("🔍 [SLA Monitoring] Timestamp: " + java.time.LocalDateTime.now());
        
        try {
            // Obtener todos los tickets activos
            List<Ticket> ticketsActivos = ticketRepository.findAll().stream()
                .filter(ticket -> Arrays.asList("ABIERTO", "EN_PROCESO", "ASIGNADO", "PENDIENTE").contains(ticket.getEstado()))
                .collect(java.util.stream.Collectors.toList());

            System.out.println("🔍 [SLA Monitoring] Encontrados " + ticketsActivos.size() + " tickets activos");

            int ticketsVencidos = 0;
            int ticketsProximosVencer = 0;
            int ticketsEnTiempo = 0;

            for (Ticket ticket : ticketsActivos) {
                try {
                    // Verificar SLA del ticket
                    String estadoSLA = verificarEstadoSLA(ticket);
                    
                    switch (estadoSLA) {
                        case "VENCIDO":
                            ticketsVencidos++;
                            procesarTicketVencido(ticket);
                            break;
                        case "PROXIMO_VENCER":
                            ticketsProximosVencer++;
                            procesarTicketProximoVencer(ticket);
                            break;
                        case "EN_TIEMPO":
                            ticketsEnTiempo++;
                            break;
                    }
                } catch (Exception e) {
                    System.err.println("🔍 [SLA Monitoring] Error procesando ticket " + ticket.getId() + ": " + e.getMessage());
                }
            }

            // Actualizar estadísticas
            actualizarEstadisticasSLA(ticketsVencidos, ticketsProximosVencer, ticketsEnTiempo);
            
            System.out.println("🔍 [SLA Monitoring] Monitoreo completado:");
            System.out.println("   - Tickets vencidos: " + ticketsVencidos);
            System.out.println("   - Tickets próximos a vencer: " + ticketsProximosVencer);
            System.out.println("   - Tickets en tiempo: " + ticketsEnTiempo);

        } catch (Exception e) {
            System.err.println("🔍 [SLA Monitoring] Error en monitoreo continuo: " + e.getMessage());
        }
    }

    /**
     * Verifica el estado del SLA para un ticket
     */
    private String verificarEstadoSLA(Ticket ticket) {
        try {
            // Si no tiene configuración SLA, está en tiempo
            if (ticket.getSlaConfiguracionId() == null) {
                return "EN_TIEMPO";
            }
            
            // Verificar si tiene fecha límite de respuesta
            if (ticket.getSlaFechaLimiteRespuesta() == null) {
                return "EN_TIEMPO";
            }
            
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime fechaLimite = ticket.getSlaFechaLimiteRespuesta();
            
            // Si ya pasó la fecha límite
            if (ahora.isAfter(fechaLimite)) {
                return "VENCIDO";
            }
            
            // Si está próximo a vencer (menos de 1 hora)
            long minutosRestantes = ChronoUnit.MINUTES.between(ahora, fechaLimite);
            if (minutosRestantes <= 60) {
                return "PROXIMO_VENCER";
            }
            
            return "EN_TIEMPO";
        } catch (Exception e) {
            System.err.println("Error verificando SLA del ticket " + ticket.getId() + ": " + e.getMessage());
            return "EN_TIEMPO";
        }
    }

    /**
     * Procesa un ticket con SLA vencido
     */
    private void procesarTicketVencido(Ticket ticket) {
        String cacheKey = "vencido_" + ticket.getId();
        
        // Evitar notificaciones duplicadas (máximo una cada 30 minutos)
        if (debeNotificar(cacheKey, 30)) {
            System.out.println("🚨 [SLA Monitoring] Ticket " + ticket.getId() + " con SLA VENCIDO");
            
            // Notificar administradores
            String mensajeAdmin = String.format(
                "🚨 SLA VENCIDO: El ticket #%d del funcionario %s ha excedido el tiempo límite de respuesta.",
                ticket.getId(),
                ticket.getCreador() != null ? ticket.getCreador().getNombre() : "Usuario"
            );
            
            notificationRoleService.notificarAdministradoresSLA(
                ticket.getId(),
                NotificationRoleService.TIPO_SLA_VENCIDO,
                mensajeAdmin
            );

            // Notificar técnicos
            String mensajeTecnico = String.format(
                "⚠️ SLA VENCIDO: El ticket #%d ha excedido el tiempo límite. Acción requerida inmediatamente.",
                ticket.getId()
            );
            
            notificationRoleService.notificarTecnicosSLA(
                ticket.getId(),
                NotificationRoleService.TIPO_SLA_VENCIDO,
                mensajeTecnico
            );

            // Ejecutar reglas de escalación automática
            try {
                // Aquí se ejecutarían las reglas automáticas si estuvieran disponibles
                System.out.println("🔍 [SLA Monitoring] Ejecutando reglas automáticas para ticket " + ticket.getId());
            } catch (Exception e) {
                System.err.println("🔍 [SLA Monitoring] Error ejecutando reglas automáticas: " + e.getMessage());
            }
        }
    }

    /**
     * Procesa un ticket próximo a vencer
     */
    private void procesarTicketProximoVencer(Ticket ticket) {
        String cacheKey = "proximo_" + ticket.getId();
        
        // Evitar notificaciones duplicadas (máximo una cada 15 minutos)
        if (debeNotificar(cacheKey, 15)) {
            System.out.println("⚠️ [SLA Monitoring] Ticket " + ticket.getId() + " próximo a vencer");
            
            // Notificar administradores
            String mensajeAdmin = String.format(
                "⚠️ SLA PRÓXIMO A VENCER: El ticket #%d del funcionario %s está próximo a vencer.",
                ticket.getId(),
                ticket.getCreador() != null ? ticket.getCreador().getNombre() : "Usuario"
            );
            
            notificationRoleService.notificarAdministradoresSLA(
                ticket.getId(),
                NotificationRoleService.TIPO_SLA_PROXIMO_VENCER,
                mensajeAdmin
            );

            // Notificar técnicos
            String mensajeTecnico = String.format(
                "⏰ SLA PRÓXIMO A VENCER: El ticket #%d está próximo a vencer.",
                ticket.getId()
            );
            
            notificationRoleService.notificarTecnicosSLA(
                ticket.getId(),
                NotificationRoleService.TIPO_SLA_PROXIMO_VENCER,
                mensajeTecnico
            );
        }
    }

    /**
     * Verifica si debe enviar una notificación basado en el cache
     */
    private boolean debeNotificar(String cacheKey, int minutosMinimos) {
        LocalDateTime ultimaNotificacion = lastNotificationCache.get(cacheKey);
        
        if (ultimaNotificacion == null) {
            lastNotificationCache.put(cacheKey, LocalDateTime.now());
            return true;
        }
        
        long minutosTranscurridos = ChronoUnit.MINUTES.between(ultimaNotificacion, LocalDateTime.now());
        
        if (minutosTranscurridos >= minutosMinimos) {
            lastNotificationCache.put(cacheKey, LocalDateTime.now());
            return true;
        }
        
        return false;
    }

    /**
     * Actualiza las estadísticas de SLA
     */
    private void actualizarEstadisticasSLA(int vencidos, int proximosVencer, int enTiempo) {
        // Aquí podrías guardar estadísticas en base de datos
        System.out.println("📊 [SLA Monitoring] Estadísticas actualizadas:");
        System.out.println("   - Vencidos: " + vencidos);
        System.out.println("   - Próximos a vencer: " + proximosVencer);
        System.out.println("   - En tiempo: " + enTiempo);
    }

    /**
     * Obtiene estadísticas de monitoreo de SLA
     */
    public Map<String, Object> obtenerEstadisticasMonitoreo() {
        Map<String, Object> estadisticas = new HashMap<>();
        
        try {
            List<Ticket> ticketsActivos = ticketRepository.findAll().stream()
                .filter(ticket -> Arrays.asList("ABIERTO", "EN_PROCESO", "ASIGNADO", "PENDIENTE").contains(ticket.getEstado()))
                .collect(java.util.stream.Collectors.toList());

            int ticketsVencidos = 0;
            int ticketsProximosVencer = 0;
            int ticketsEnTiempo = 0;
            int ticketsSinSLA = 0;

            for (Ticket ticket : ticketsActivos) {
                try {
                    String estadoSLA = verificarEstadoSLA(ticket);
                    
                    switch (estadoSLA) {
                        case "VENCIDO":
                            ticketsVencidos++;
                            break;
                        case "PROXIMO_VENCER":
                            ticketsProximosVencer++;
                            break;
                        case "EN_TIEMPO":
                            ticketsEnTiempo++;
                            break;
                    }
                } catch (Exception e) {
                    ticketsSinSLA++;
                }
            }

            estadisticas.put("totalTicketsActivos", ticketsActivos.size());
            estadisticas.put("ticketsVencidos", ticketsVencidos);
            estadisticas.put("ticketsProximosVencer", ticketsProximosVencer);
            estadisticas.put("ticketsEnTiempo", ticketsEnTiempo);
            estadisticas.put("ticketsSinSLA", ticketsSinSLA);
            estadisticas.put("porcentajeCumplimiento", ticketsActivos.size() > 0 ? 
                (double) ticketsEnTiempo / ticketsActivos.size() * 100 : 0);
            estadisticas.put("ultimaVerificacion", LocalDateTime.now());

        } catch (Exception e) {
            System.err.println("Error obteniendo estadísticas de monitoreo: " + e.getMessage());
            estadisticas.put("error", e.getMessage());
        }

        return estadisticas;
    }

    /**
     * Ejecuta una verificación manual de SLA
     */
    public Map<String, Object> ejecutarVerificacionManual() {
        System.out.println("🔍 [SLA Monitoring] Ejecutando verificación manual...");
        
        Map<String, Object> resultado = new HashMap<>();
        
        try {
            // Ejecutar monitoreo
            monitorearSLA();
            
            // Obtener estadísticas actualizadas
            Map<String, Object> estadisticas = obtenerEstadisticasMonitoreo();
            
            resultado.put("exito", true);
            resultado.put("mensaje", "Verificación manual ejecutada correctamente");
            resultado.put("estadisticas", estadisticas);
            resultado.put("timestamp", LocalDateTime.now());
            
        } catch (Exception e) {
            System.err.println("Error en verificación manual: " + e.getMessage());
            resultado.put("exito", false);
            resultado.put("error", e.getMessage());
            resultado.put("timestamp", LocalDateTime.now());
        }
        
        return resultado;
    }

    /**
     * Obtiene tickets con SLA vencido
     */
    public List<Map<String, Object>> obtenerTicketsVencidos() {
        List<Map<String, Object>> ticketsVencidos = new ArrayList<>();
        
        try {
            List<Ticket> ticketsActivos = ticketRepository.findAll().stream()
                .filter(ticket -> Arrays.asList("ABIERTO", "EN_PROCESO", "ASIGNADO", "PENDIENTE").contains(ticket.getEstado()))
                .collect(java.util.stream.Collectors.toList());

            for (Ticket ticket : ticketsActivos) {
                try {
                    String estadoSLA = verificarEstadoSLA(ticket);
                    
                    if ("VENCIDO".equals(estadoSLA)) {
                        Map<String, Object> ticketInfo = new HashMap<>();
                        ticketInfo.put("id", ticket.getId());
                        ticketInfo.put("titulo", ticket.getConsulta() != null ? ticket.getConsulta() : "Sin título");
                        ticketInfo.put("creadorNombre", ticket.getCreador() != null ? ticket.getCreador().getNombre() : "Usuario");
                        ticketInfo.put("estado", ticket.getEstado());
                        ticketInfo.put("fechaCreacion", ticket.getFechaCreacion());
                        ticketInfo.put("slaStatus", estadoSLA);
                        ticketsVencidos.add(ticketInfo);
                    }
                } catch (Exception e) {
                    // Ignorar tickets con error
                }
            }
        } catch (Exception e) {
            System.err.println("Error obteniendo tickets vencidos: " + e.getMessage());
        }
        
        return ticketsVencidos;
    }

    /**
     * Obtiene tickets próximos a vencer
     */
    public List<Map<String, Object>> obtenerTicketsProximosVencer() {
        List<Map<String, Object>> ticketsProximos = new ArrayList<>();
        
        try {
            List<Ticket> ticketsActivos = ticketRepository.findAll().stream()
                .filter(ticket -> Arrays.asList("ABIERTO", "EN_PROCESO", "ASIGNADO", "PENDIENTE").contains(ticket.getEstado()))
                .collect(java.util.stream.Collectors.toList());

            for (Ticket ticket : ticketsActivos) {
                try {
                    String estadoSLA = verificarEstadoSLA(ticket);
                    
                    if ("PROXIMO_VENCER".equals(estadoSLA)) {
                        Map<String, Object> ticketInfo = new HashMap<>();
                        ticketInfo.put("id", ticket.getId());
                        ticketInfo.put("titulo", ticket.getConsulta() != null ? ticket.getConsulta() : "Sin título");
                        ticketInfo.put("creadorNombre", ticket.getCreador() != null ? ticket.getCreador().getNombre() : "Usuario");
                        ticketInfo.put("estado", ticket.getEstado());
                        ticketInfo.put("fechaCreacion", ticket.getFechaCreacion());
                        ticketInfo.put("slaStatus", estadoSLA);
                        ticketsProximos.add(ticketInfo);
                    }
                } catch (Exception e) {
                    // Ignorar tickets con error
                }
            }
        } catch (Exception e) {
            System.err.println("Error obteniendo tickets próximos a vencer: " + e.getMessage());
        }
        
        return ticketsProximos;
    }
}
