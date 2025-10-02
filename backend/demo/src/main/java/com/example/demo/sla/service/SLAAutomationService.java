package com.example.demo.sla.service;

import com.example.demo.sla.dto.SLAConfigurationDTO;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.automation.model.ReglaAutomatizacion;
import com.example.demo.automation.repository.ReglaAutomatizacionRepository;
import com.example.demo.notificacion.service.NotificationRoleService;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Servicio que integra SLA con automatización
 * Aplica configuraciones SLA y ejecuta reglas automáticas al crear tickets
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SLAAutomationService {
    
    private final SLAConfigurationService slaConfigurationService;
    private final ReglaAutomatizacionRepository reglaAutomatizacionRepository;
    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificationRoleService notificationRoleService;
    
    /**
     * Procesa un ticket recién creado aplicando SLA y automatización
     */
    public void procesarTicketCreado(Ticket ticket) {
        System.out.println("🔧 [SLA Automation] ===== PROCESANDO TICKET " + ticket.getId() + " CON SLA Y AUTOMATIZACIÓN =====");
        log.info("Procesando ticket {} con SLA y automatización", ticket.getId());
        
        try {
            // 1. Aplicar configuración SLA si existe
            aplicarConfiguracionSLA(ticket);
            
            // 2. Ejecutar reglas de automatización
            ejecutarReglasAutomaticas(ticket);
            
            // 3. Crear reglas automáticas basadas en SLA si es necesario
            crearReglasAutomaticasSLA(ticket);
            
        } catch (Exception e) {
            log.error("Error procesando ticket {} con SLA y automatización: {}", ticket.getId(), e.getMessage());
        }
    }
    
    /**
     * Aplica configuración SLA al ticket si existe una para su categoría y prioridad
     */
    private void aplicarConfiguracionSLA(Ticket ticket) {
        if (ticket.getCategoria() == null || ticket.getPrioridad() == null) {
            return;
        }
        
        try {
            Optional<SLAConfigurationDTO> configSLA = slaConfigurationService
                .obtenerConfiguracionPorCategoriaYPrioridad(
                    ticket.getCategoria().getId(), 
                    ticket.getPrioridad()
                );
            
            if (configSLA.isPresent()) {
                SLAConfigurationDTO config = configSLA.get();
                log.info("Aplicando configuración SLA '{}' al ticket {}", config.getNombre(), ticket.getId());
                
                // Configurar campos SLA en el ticket
                ticket.setSlaConfiguracionId(config.getId());
                ticket.setSlaTiempoRespuestaHoras(config.getTiempoRespuestaHoras());
                ticket.setSlaTiempoResolucionHoras(config.getTiempoResolucionHoras());
                
                // Calcular fechas límite
                LocalDateTime fechaCreacion = ticket.getFechaCreacion();
                if (fechaCreacion != null) {
                    ticket.setSlaFechaLimiteRespuesta(fechaCreacion.plusHours(config.getTiempoRespuestaHoras()));
                    ticket.setSlaFechaLimiteResolucion(fechaCreacion.plusHours(config.getTiempoResolucionHoras()));
                }
                
                // Guardar ticket con configuración SLA
                ticketRepository.save(ticket);
                
                // Notificar a administradores sobre SLA aplicado
                if (ticket.getCreador() != null) {
                    // Crear notificación para administradores
                    notificationRoleService.notificarCreacionTicket(ticket.getId(), ticket.getCreador().getIdUsuario());
                }
            }
        } catch (Exception e) {
            log.warn("Error aplicando configuración SLA al ticket {}: {}", ticket.getId(), e.getMessage());
        }
    }
    
    /**
     * Ejecuta reglas de automatización existentes
     */
    private void ejecutarReglasAutomaticas(Ticket ticket) {
        log.info("Ejecutando reglas automáticas para ticket {}", ticket.getId());
        
        List<ReglaAutomatizacion> reglasActivas = reglaAutomatizacionRepository
            .findByActivaTrueOrderByPrioridadDescFechaCreacionAsc();
        
        for (ReglaAutomatizacion regla : reglasActivas) {
            try {
                System.out.println("🔧 [SLA Automation] Evaluando regla: " + regla.getNombre());
                System.out.println("🔧 [SLA Automation] Condición: " + regla.getCondicion());
                System.out.println("🔧 [SLA Automation] Acción: " + regla.getAccion());
                
                boolean condicionCumplida = evaluarCondicion(regla.getCondicion(), ticket);
                System.out.println("🔧 [SLA Automation] Condición cumplida: " + condicionCumplida);
                
                if (condicionCumplida) {
                    System.out.println("✅ [SLA Automation] Ejecutando acción para regla: " + regla.getNombre());
                    ejecutarAccion(regla.getAccion(), ticket);
                    regla.incrementarEjecuciones();
                    reglaAutomatizacionRepository.save(regla);
                    log.info("Regla '{}' ejecutada para ticket {}", regla.getNombre(), ticket.getId());
                } else {
                    System.out.println("❌ [SLA Automation] Condición no cumplida para regla: " + regla.getNombre());
                }
            } catch (Exception e) {
                log.error("Error ejecutando regla '{}' para ticket {}: {}", 
                    regla.getNombre(), ticket.getId(), e.getMessage());
            }
        }
    }
    
    /**
     * Crea reglas automáticas basadas en configuraciones SLA
     */
    private void crearReglasAutomaticasSLA(Ticket ticket) {
        if (ticket.getCategoria() == null || ticket.getPrioridad() == null) {
            return;
        }
        
        try {
            Optional<SLAConfigurationDTO> configSLA = slaConfigurationService
                .obtenerConfiguracionPorCategoriaYPrioridad(
                    ticket.getCategoria().getId(), 
                    ticket.getPrioridad()
                );
            
            if (configSLA.isPresent()) {
                SLAConfigurationDTO config = configSLA.get();
                
                // Crear regla de escalamiento automático si no existe
                String nombreRegla = String.format("Escalamiento SLA - %s %s", 
                    config.getCategoriaNombre(), config.getPrioridad());
                
                boolean reglaExiste = reglaAutomatizacionRepository
                    .findByNombreContainingIgnoreCase(nombreRegla)
                    .stream()
                    .anyMatch(ReglaAutomatizacion::getActiva);
                
                if (!reglaExiste) {
                    crearReglaEscalamientoSLA(config);
                }
            }
        } catch (Exception e) {
            log.warn("Error creando reglas automáticas SLA para ticket {}: {}", ticket.getId(), e.getMessage());
        }
    }
    
    /**
     * Crea una regla de escalamiento automático basada en configuración SLA
     */
    private void crearReglaEscalamientoSLA(SLAConfigurationDTO config) {
        try {
            String condicion = String.format("categoria == \"%s\" AND prioridad == \"%s\" AND estado == \"PENDIENTE\"", 
                config.getCategoriaNombre(), config.getPrioridad());
            
            String accion = String.format("escalar_si_sla_vencido(%d)", config.getTiempoRespuestaHoras());
            
            ReglaAutomatizacion regla = ReglaAutomatizacion.builder()
                .nombre(String.format("Escalamiento SLA - %s %s", config.getCategoriaNombre(), config.getPrioridad()))
                .descripcion(String.format("Escalamiento automático para %s con prioridad %s", 
                    config.getCategoriaNombre(), config.getPrioridad()))
                .condicion(condicion)
                .accion(accion)
                .prioridad(10) // Alta prioridad para reglas SLA
                .activa(true)
                .creadoPor("Sistema SLA")
                .ejecuciones(0)
                .build();
            
            reglaAutomatizacionRepository.save(regla);
            log.info("Regla de escalamiento SLA creada: {}", regla.getNombre());
            
        } catch (Exception e) {
            log.error("Error creando regla de escalamiento SLA: {}", e.getMessage());
        }
    }
    
    /**
     * Evalúa una condición contra un ticket
     */
    private boolean evaluarCondicion(String condicion, Ticket ticket) {
        if (condicion == null || condicion.trim().isEmpty()) return false;
        
        String c = condicion.trim().toLowerCase();
        
        try {
            // Soporte para condiciones AND
            if (c.contains(" and ")) {
                String[] partes = c.split(" and ");
                boolean resultado = true;
                for (String parte : partes) {
                    resultado = resultado && evaluarCondicionSimple(parte.trim(), ticket);
                }
                return resultado;
            }
            
            return evaluarCondicionSimple(c, ticket);
            
        } catch (Exception e) {
            log.warn("Error evaluando condición '{}': {}", condicion, e.getMessage());
            return false;
        }
    }
    
    /**
     * Evalúa una condición simple
     */
    private boolean evaluarCondicionSimple(String condicion, Ticket ticket) {
        System.out.println("🔧 [SLA Automation] Evaluando condición simple: " + condicion);
        
        if (condicion.startsWith("categoria ==")) {
            String valor = extraerValorLiteral(condicion);
            String categoria = ticket.getCategoriaNombre();
            System.out.println("🔧 [SLA Automation] Comparando categoría: '" + categoria + "' == '" + valor + "'");
            boolean resultado = categoria != null && categoria.equalsIgnoreCase(valor);
            System.out.println("🔧 [SLA Automation] Resultado categoría: " + resultado);
            return resultado;
        }
        
        if (condicion.startsWith("prioridad ==")) {
            String valor = extraerValorLiteral(condicion);
            String prioridad = ticket.getPrioridad();
            System.out.println("🔧 [SLA Automation] Comparando prioridad: '" + prioridad + "' == '" + valor + "'");
            boolean resultado = prioridad != null && prioridad.equalsIgnoreCase(valor);
            System.out.println("🔧 [SLA Automation] Resultado prioridad: " + resultado);
            return resultado;
        }
        
        if (condicion.startsWith("estado ==")) {
            String valor = extraerValorLiteral(condicion);
            String estado = ticket.getEstado();
            System.out.println("🔧 [SLA Automation] Comparando estado: '" + estado + "' == '" + valor + "'");
            boolean resultado = estado != null && estado.equalsIgnoreCase(valor);
            System.out.println("🔧 [SLA Automation] Resultado estado: " + resultado);
            return resultado;
        }
        
        if (condicion.startsWith("consulta contains")) {
            String valor = extraerValorLiteral(condicion);
            String consulta = ticket.getConsulta();
            return consulta != null && consulta.toLowerCase().contains(valor.toLowerCase());
        }
        
        return false;
    }
    
    /**
     * Ejecuta una acción sobre un ticket
     */
    private void ejecutarAccion(String accion, Ticket ticket) {
        if (accion == null || accion.trim().isEmpty()) return;
        
        String a = accion.trim().toLowerCase();
        
        try {
            if (a.startsWith("set_prioridad")) {
                String valor = extraerValorLiteral(a);
                ticket.setPrioridad(valor.toUpperCase());
                ticketRepository.save(ticket);
                log.info("Prioridad del ticket {} cambiada a {}", ticket.getId(), valor);
                return;
            }
            
            if (a.startsWith("asignar_tecnico(")) {
                String tecnicoIdStr = extraerValorLiteral(a);
                try {
                    Long tecnicoId = Long.parseLong(tecnicoIdStr);
                    System.out.println("🔧 [SLA Automation] Asignando técnico específico ID: " + tecnicoId + " al ticket " + ticket.getId());
                    
                    usuarioRepository.findById(tecnicoId).ifPresentOrElse(
                        tecnico -> {
                            if (tecnico.isTecnico() && tecnico.getActivo()) {
                                System.out.println("✅ [SLA Automation] Técnico encontrado: " + tecnico.getEmail() + " (ID: " + tecnico.getIdUsuario() + ")");
                                ticket.setTecnicoAsignado(tecnico);
                                ticket.setEstado("ASIGNADO");
                                ticketRepository.save(ticket);
                                
                                try {
                                    if (ticket.getCreador() != null && tecnico.getIdUsuario() != null) {
                                        notificationRoleService.notificarAsignacionTicket(
                                            ticket.getId(), 
                                            ticket.getCreador().getIdUsuario(), 
                                            tecnico.getIdUsuario()
                                        );
                                    }
                                } catch (Exception ex) {
                                    log.warn("Error notificando asignación automática: {}", ex.getMessage());
                                }
                                
                                System.out.println("✅ [SLA Automation] Ticket " + ticket.getId() + " asignado automáticamente a técnico " + tecnico.getEmail());
                            } else {
                                System.out.println("⚠️ [SLA Automation] Usuario ID " + tecnicoId + " no es técnico activo");
                            }
                        },
                        () -> {
                            System.out.println("⚠️ [SLA Automation] Técnico ID " + tecnicoId + " no encontrado");
                        }
                    );
                } catch (NumberFormatException e) {
                    System.out.println("❌ [SLA Automation] Error parseando ID de técnico: " + tecnicoIdStr);
                }
                return;
            }
            
            if (a.startsWith("asignar_tecnico_por_minima_carga")) {
                System.out.println("🔧 [SLA Automation] Buscando técnico con menor carga para ticket " + ticket.getId());
                
                // Verificar si hay técnicos disponibles
                List<com.example.demo.usuario.model.Usuario> tecnicosActivos = usuarioRepository.findActiveTechnicians();
                System.out.println("🔧 [SLA Automation] Técnicos activos encontrados: " + tecnicosActivos.size());
                
                if (tecnicosActivos.isEmpty()) {
                    System.out.println("⚠️ [SLA Automation] No hay técnicos activos disponibles para asignar ticket " + ticket.getId());
                    return;
                }
                
                usuarioRepository.findTechnicianWithLeastActiveTickets().ifPresentOrElse(
                    tecnico -> {
                        System.out.println("✅ [SLA Automation] Técnico encontrado: " + tecnico.getEmail() + " (ID: " + tecnico.getIdUsuario() + ")");
                        ticket.setTecnicoAsignado(tecnico);
                        ticket.setEstado("ASIGNADO");
                        ticketRepository.save(ticket);
                        
                        try {
                            if (ticket.getCreador() != null && tecnico.getIdUsuario() != null) {
                                notificationRoleService.notificarAsignacionTicket(
                                    ticket.getId(), 
                                    ticket.getCreador().getIdUsuario(), 
                                    tecnico.getIdUsuario()
                                );
                            }
                        } catch (Exception ex) {
                            log.warn("Error notificando asignación automática: {}", ex.getMessage());
                        }
                        
                        System.out.println("✅ [SLA Automation] Ticket " + ticket.getId() + " asignado automáticamente a técnico " + tecnico.getEmail());
                    },
                    () -> {
                        System.out.println("⚠️ [SLA Automation] No se pudo encontrar técnico con menor carga para ticket " + ticket.getId());
                    }
                );
                return;
            }
            
            if (a.startsWith("escalar_si_sla_vencido")) {
                // Extraer horas del SLA
                String horasStr = extraerValorLiteral(a);
                try {
                    int horasSLA = Integer.parseInt(horasStr);
                    LocalDateTime fechaLimite = ticket.getFechaCreacion().plusHours(horasSLA);
                    
                    if (LocalDateTime.now().isAfter(fechaLimite) && "PENDIENTE".equals(ticket.getEstado())) {
                        // Escalar a técnico senior o administrador
                        escalarTicket(ticket);
                    }
                } catch (NumberFormatException e) {
                    log.warn("Error parseando horas SLA: {}", horasStr);
                }
                return;
            }
            
            if (a.startsWith("notificar")) {
                // Reutilizar sistema de notificaciones existente
                if (ticket.getCreador() != null) {
                    notificationRoleService.notificarCreacionTicket(ticket.getId(), ticket.getCreador().getIdUsuario());
                }
                return;
            }
            
        } catch (Exception e) {
            log.error("Error ejecutando acción '{}' para ticket {}: {}", accion, ticket.getId(), e.getMessage());
        }
    }
    
    /**
     * Escala un ticket a un técnico senior o administrador
     */
    private void escalarTicket(Ticket ticket) {
        try {
            // Buscar técnico senior o administrador disponible
            List<com.example.demo.usuario.model.Usuario> tecnicosSenior = usuarioRepository
                .findByTipoUsuarioAndActivo(com.example.demo.usuario.model.TipoUsuario.TECNICO, true);
            
            if (!tecnicosSenior.isEmpty()) {
                // Asignar al primer técnico disponible
                com.example.demo.usuario.model.Usuario tecnicoSenior = tecnicosSenior.get(0);
                ticket.setTecnicoAsignado(tecnicoSenior);
                ticket.setEstado("ESCALADO");
                ticket.setPrioridad("ALTA"); // Aumentar prioridad al escalar
                ticketRepository.save(ticket);
                
                // Notificar escalamiento
                if (ticket.getCreador() != null && tecnicoSenior.getIdUsuario() != null) {
                    notificationRoleService.notificarEscalacionTicket(
                        ticket.getId(), 
                        ticket.getCreador().getIdUsuario(), 
                        tecnicoSenior.getIdUsuario()
                    );
                }
                
                log.info("Ticket {} escalado a técnico senior {}", ticket.getId(), tecnicoSenior.getEmail());
            }
        } catch (Exception e) {
            log.error("Error escalando ticket {}: {}", ticket.getId(), e.getMessage());
        }
    }
    
    /**
     * Extrae valor literal de una expresión
     */
    private String extraerValorLiteral(String expr) {
        int i = expr.indexOf('"');
        int j = expr.lastIndexOf('"');
        if (i >= 0 && j > i) {
            return expr.substring(i + 1, j);
        }
        String[] parts = expr.split("\\s+", 3);
        return parts.length >= 3 ? parts[2].replace("'", "").replace("\"", "") : "";
    }
}
