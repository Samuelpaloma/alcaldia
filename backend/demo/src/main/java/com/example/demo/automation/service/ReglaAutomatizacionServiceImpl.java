package com.example.demo.automation.service;

import com.example.demo.automation.dto.request.ReglaAutomatizacionRequestDTO;
import com.example.demo.automation.dto.response.ReglaAutomatizacionResponseDTO;
import com.example.demo.automation.model.ReglaAutomatizacion;
import com.example.demo.automation.repository.ReglaAutomatizacionRepository;
import com.example.demo.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ReglaAutomatizacionServiceImpl implements ReglaAutomatizacionService {
    
    private final ReglaAutomatizacionRepository reglaAutomatizacionRepository;
    private final com.example.demo.usuario.repository.UsuarioRepository usuarioRepository;
    private final com.example.demo.ticket.repository.TicketRepository ticketRepository;
    private final com.example.demo.notificacion.service.NotificationRoleService notificationRoleService;
    
    @Override
    public ReglaAutomatizacionResponseDTO crearRegla(ReglaAutomatizacionRequestDTO request) {
        log.info("Creando nueva regla de automatización: {}", request.getNombre());
        
        ReglaAutomatizacion regla = ReglaAutomatizacion.builder()
            .nombre(request.getNombre().trim())
            .descripcion(request.getDescripcion() != null ? request.getDescripcion().trim() : null)
            .condicion(request.getCondicion().trim())
            .accion(request.getAccion().trim())
            .prioridad(request.getPrioridad() != null ? request.getPrioridad() : 1)
            .activa(request.getActiva() != null ? request.getActiva() : true)
            .creadoPor("Sistema") // TODO: Obtener del contexto de seguridad
            .ejecuciones(0)
            .build();
        
        ReglaAutomatizacion savedRegla = reglaAutomatizacionRepository.save(regla);
        
        log.info("Regla de automatización creada exitosamente: {} (ID: {})", savedRegla.getNombre(), savedRegla.getId());
        
        return convertirAReglaResponseDTO(savedRegla);
    }
    
    @Override
    @Transactional(readOnly = true)
    public ReglaAutomatizacionResponseDTO obtenerReglaPorId(Long id) {
        log.info("Obteniendo regla de automatización por ID: {}", id);
        
        ReglaAutomatizacion regla = reglaAutomatizacionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Regla de automatización no encontrada con ID: " + id));
        
        return convertirAReglaResponseDTO(regla);
    }
    
    @Override
    public ReglaAutomatizacionResponseDTO actualizarRegla(Long id, ReglaAutomatizacionRequestDTO request) {
        log.info("Actualizando regla de automatización ID: {} con nombre: {}", id, request.getNombre());
        
        ReglaAutomatizacion regla = reglaAutomatizacionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Regla de automatización no encontrada con ID: " + id));
        
        regla.setNombre(request.getNombre().trim());
        regla.setDescripcion(request.getDescripcion() != null ? request.getDescripcion().trim() : null);
        regla.setCondicion(request.getCondicion().trim());
        regla.setAccion(request.getAccion().trim());
        regla.setPrioridad(request.getPrioridad() != null ? request.getPrioridad() : regla.getPrioridad());
        regla.setActiva(request.getActiva() != null ? request.getActiva() : regla.getActiva());
        
        ReglaAutomatizacion updatedRegla = reglaAutomatizacionRepository.save(regla);
        
        log.info("Regla de automatización actualizada exitosamente: {} (ID: {})", updatedRegla.getNombre(), updatedRegla.getId());
        
        return convertirAReglaResponseDTO(updatedRegla);
    }
    
    @Override
    public void eliminarRegla(Long id) {
        log.info("Eliminando regla de automatización ID: {}", id);
        
        ReglaAutomatizacion regla = reglaAutomatizacionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Regla de automatización no encontrada con ID: " + id));
        
        reglaAutomatizacionRepository.delete(regla);
        
        log.info("Regla de automatización eliminada exitosamente: {} (ID: {})", regla.getNombre(), regla.getId());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReglaAutomatizacionResponseDTO> obtenerTodasLasReglas() {
        log.info("Obteniendo todas las reglas de automatización");
        
        List<ReglaAutomatizacion> reglas = reglaAutomatizacionRepository.findAll();
        
        return reglas.stream()
            .map(this::convertirAReglaResponseDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReglaAutomatizacionResponseDTO> obtenerReglasConPaginacion(Pageable pageable) {
        log.info("Obteniendo reglas de automatización con paginación: {}", pageable);
        
        Page<ReglaAutomatizacion> reglasPage = reglaAutomatizacionRepository.findAll(pageable);
        
        List<ReglaAutomatizacionResponseDTO> reglasDTO = reglasPage.getContent().stream()
            .map(this::convertirAReglaResponseDTO)
            .collect(Collectors.toList());
        
        return PageResponse.<ReglaAutomatizacionResponseDTO>builder()
            .content(reglasDTO)
            .page(reglasPage.getNumber())
            .size(reglasPage.getSize())
            .totalElements(reglasPage.getTotalElements())
            .totalPages(reglasPage.getTotalPages())
            .first(reglasPage.isFirst())
            .last(reglasPage.isLast())
            .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReglaAutomatizacionResponseDTO> obtenerReglasActivas() {
        log.info("Obteniendo reglas de automatización activas");
        
        List<ReglaAutomatizacion> reglas = reglaAutomatizacionRepository.findByActivaTrueOrderByPrioridadDescFechaCreacionAsc();
        
        return reglas.stream()
            .map(this::convertirAReglaResponseDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReglaAutomatizacionResponseDTO> buscarReglas(String nombre, Boolean activa, Integer prioridad, Pageable pageable) {
        log.info("Buscando reglas de automatización con filtros: nombre={}, activa={}, prioridad={}", nombre, activa, prioridad);
        
        Page<ReglaAutomatizacion> reglasPage = reglaAutomatizacionRepository.findWithFilters(activa, nombre, prioridad, pageable);
        
        List<ReglaAutomatizacionResponseDTO> reglasDTO = reglasPage.getContent().stream()
            .map(this::convertirAReglaResponseDTO)
            .collect(Collectors.toList());
        
        return PageResponse.<ReglaAutomatizacionResponseDTO>builder()
            .content(reglasDTO)
            .page(reglasPage.getNumber())
            .size(reglasPage.getSize())
            .totalElements(reglasPage.getTotalElements())
            .totalPages(reglasPage.getTotalPages())
            .first(reglasPage.isFirst())
            .last(reglasPage.isLast())
            .build();
    }
    
    @Override
    public ReglaAutomatizacionResponseDTO toggleEstadoRegla(Long id) {
        log.info("Cambiando estado de regla de automatización ID: {}", id);
        
        ReglaAutomatizacion regla = reglaAutomatizacionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Regla de automatización no encontrada con ID: " + id));
        
        regla.setActiva(!regla.getActiva());
        ReglaAutomatizacion updatedRegla = reglaAutomatizacionRepository.save(regla);
        
        log.info("Estado de regla {} cambiado a: {}", updatedRegla.getNombre(), updatedRegla.getActiva() ? "ACTIVA" : "INACTIVA");
        
        return convertirAReglaResponseDTO(updatedRegla);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long contarReglasActivas() {
        return reglaAutomatizacionRepository.countByActivaTrue();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long contarEjecucionesTotales() {
        return reglaAutomatizacionRepository.sumEjecucionesActivas();
    }
    
    @Override
    public void ejecutarReglas() {
        log.info("Ejecutando todas las reglas de automatización activas");
        
        List<ReglaAutomatizacion> reglasActivas = reglaAutomatizacionRepository.findByActivaTrueOrderByPrioridadDescFechaCreacionAsc();
        
        for (ReglaAutomatizacion regla : reglasActivas) {
            try {
                ejecutarRegla(regla.getId());
            } catch (Exception e) {
                log.error("Error ejecutando regla {}: {}", regla.getNombre(), e.getMessage());
            }
        }
    }
    
    @Override
    public void ejecutarRegla(Long id) {
        log.info("Ejecutando regla de automatización ID: {}", id);
        
        ReglaAutomatizacion regla = reglaAutomatizacionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Regla de automatización no encontrada con ID: " + id));
        
        if (!regla.getActiva()) {
            log.warn("Regla {} está inactiva, no se ejecutará", regla.getNombre());
            return;
        }
        
        // Sin contexto de ticket, no hay ejecución concreta aún
        regla.incrementarEjecuciones();
        reglaAutomatizacionRepository.save(regla);
        
        log.info("Regla {} ejecutada exitosamente. Total ejecuciones: {}", regla.getNombre(), regla.getEjecuciones());
    }
    
    @Override
    public void ejecutarReglasParaTicket(com.example.demo.ticket.model.Ticket ticket) {
        log.info("Ejecutando reglas para ticket {}", ticket.getId());
        List<com.example.demo.automation.model.ReglaAutomatizacion> reglasActivas =
            reglaAutomatizacionRepository.findByActivaTrueOrderByPrioridadDescFechaCreacionAsc();

        for (com.example.demo.automation.model.ReglaAutomatizacion regla : reglasActivas) {
            try {
                if (evaluarCondicion(regla.getCondicion(), ticket)) {
                    ejecutarAccion(regla.getAccion(), ticket);
                    regla.incrementarEjecuciones();
                    reglaAutomatizacionRepository.save(regla);
                }
            } catch (Exception e) {
                log.error("Error al ejecutar regla {} para ticket {}: {}", regla.getNombre(), ticket.getId(), e.getMessage());
            }
        }
    }

    private boolean evaluarCondicion(String condicion, com.example.demo.ticket.model.Ticket ticket) {
        if (condicion == null || condicion.trim().isEmpty()) return false;
        String c = condicion.trim().toLowerCase();
        // Condiciones soportadas simples:
        // categoria == "Soporte" | prioridad == "ALTA" | estado == "PENDIENTE" | consulta contains "palabra"
        try {
            if (c.startsWith("categoria ==")) {
                String valor = extraerValorLiteral(c);
                String categoria = ticket.getCategoriaNombre();
                return categoria != null && categoria.equalsIgnoreCase(valor);
            }
            if (c.startsWith("prioridad ==")) {
                String valor = extraerValorLiteral(c);
                String prioridad = ticket.getPrioridad();
                return prioridad != null && prioridad.equalsIgnoreCase(valor);
            }
            if (c.startsWith("estado ==")) {
                String valor = extraerValorLiteral(c);
                String estado = ticket.getEstado();
                return estado != null && estado.equalsIgnoreCase(valor);
            }
            if (c.startsWith("consulta contains")) {
                String valor = extraerValorLiteral(c);
                String consulta = ticket.getConsulta();
                return consulta != null && consulta.toLowerCase().contains(valor.toLowerCase());
            }
        } catch (Exception e) {
            log.warn("No se pudo evaluar condición '{}': {}", condicion, e.getMessage());
        }
        return false;
    }

    private String extraerValorLiteral(String expr) {
        int i = expr.indexOf('"');
        int j = expr.lastIndexOf('"');
        if (i >= 0 && j > i) {
            return expr.substring(i + 1, j);
        }
        String[] parts = expr.split("\\s+", 3);
        return parts.length >= 3 ? parts[2].replace("'", "").replace("\"", "") : "";
    }

    private void ejecutarAccion(String accion, com.example.demo.ticket.model.Ticket ticket) {
        if (accion == null || accion.trim().isEmpty()) return;
        String a = accion.trim().toLowerCase();
        try {
            // Acciones soportadas:
            // set_prioridad("ALTA")
            // asignar_tecnico_por_minima_carga()
            // notificar("rol:administrador","Mensaje ...")
            if (a.startsWith("set_prioridad")) {
                String valor = extraerValorLiteral(a);
                ticket.setPrioridad(valor.toUpperCase());
                ticketRepository.save(ticket);
                return;
            }
            if (a.startsWith("asignar_tecnico_por_minima_carga")) {
                usuarioRepository.findTechnicianWithLeastActiveTickets().ifPresent(tecnico -> {
                    ticket.setTecnicoAsignado(tecnico);
                    ticket.setEstado("ASIGNADO");
                    ticketRepository.save(ticket);
                    try {
                        if (ticket.getCreador() != null && tecnico.getIdUsuario() != null) {
                            notificationRoleService.notificarAsignacionTicket(ticket.getId(), ticket.getCreador().getIdUsuario(), tecnico.getIdUsuario());
                        }
                    } catch (Exception ex) {
                        log.warn("Fallo al notificar asignación automática: {}", ex.getMessage());
                    }
                });
                return;
            }
            if (a.startsWith("notificar")) {
                // notificar("rol:administrador","Mensaje") -> envia por WebSocket a admin
                int first = accion.indexOf('(');
                int last = accion.lastIndexOf(')');
                if (first > 0 && last > first) {
                    String inside = accion.substring(first + 1, last);
                    String[] args = inside.split(",");
                    if (args.length >= 2) {
                        String destino = limpiarComillas(args[0]);
                        String mensaje = limpiarComillas(inside.substring(inside.indexOf(',') + 1));
                        // Reusar NotificationRoleService con tipos predefinidos
                        try {
                            if ("rol:administrador".equalsIgnoreCase(destino)) {
                                notificationRoleService.notificarCreacionTicket(ticket.getId(), ticket.getCreador().getIdUsuario());
                            }
                        } catch (Exception ex) {
                            log.warn("Fallo al notificar acción: {}", ex.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error ejecutando acción '{}' para ticket {}: {}", accion, ticket.getId(), e.getMessage());
        }
    }

    private String limpiarComillas(String s) {
        return s == null ? null : s.trim().replaceAll("^\\\"|\\\"$", "").replaceAll("^'|'$", "");
    }
    private ReglaAutomatizacionResponseDTO convertirAReglaResponseDTO(ReglaAutomatizacion regla) {
        return ReglaAutomatizacionResponseDTO.builder()
            .id(regla.getId())
            .nombre(regla.getNombre())
            .descripcion(regla.getDescripcion())
            .condicion(regla.getCondicion())
            .accion(regla.getAccion())
            .prioridad(regla.getPrioridad())
            .activa(regla.getActiva())
            .ejecuciones(regla.getEjecuciones())
            .ultimaEjecucion(regla.getUltimaEjecucion())
            .creadoPor(regla.getCreadoPor())
            .fechaCreacion(regla.getFechaCreacion())
            .build();
    }
}
