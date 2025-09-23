package com.example.demo.escalamiento.service;

import com.example.demo.asignacion.dto.request.AsignarTicketRequestDTO;
import com.example.demo.asignacion.dto.response.AsignacionResponseDTO;
import com.example.demo.asignacion.service.AsignacionService;
import com.example.demo.escalamiento.dto.EscalamientoStatsDTO;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.model.NivelTecnico;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class EscalamientoService {
    
    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;
    private final AsignacionService asignacionService;
    
    /**
     * Escalar ticket automáticamente al siguiente nivel
     * Se ejecuta cuando un técnico no puede resolver un ticket
     */
    public AsignacionResponseDTO escalarTicket(Long ticketId, String motivoEscalamiento) {
        log.info("Escalando ticket {} - Motivo: {}", ticketId, motivoEscalamiento);
        
        // 1. Buscar ticket
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // 2. Verificar que esté asignado
        if (ticket.getTecnicoAsignado() == null) {
            throw new RuntimeException("El ticket no está asignado");
        }
        
        // 3. Obtener técnico actual
        Usuario tecnicoActual = ticket.getTecnicoAsignado();
        NivelTecnico nivelActual = tecnicoActual.getNivelTecnico();
        
        if (nivelActual == null) {
            throw new RuntimeException("El técnico actual no tiene nivel definido");
        }
        
        // 4. Determinar siguiente nivel
        NivelTecnico siguienteNivel = obtenerSiguienteNivel(nivelActual);
        
        // 5. Buscar técnico del siguiente nivel
        Optional<Usuario> tecnicoSiguiente = buscarTecnicoDisponible(siguienteNivel, ticket);
        
        if (tecnicoSiguiente.isEmpty()) {
            log.warn("No se encontró técnico disponible del nivel {} para escalar ticket {}", 
                siguienteNivel.getDescripcion(), ticketId);
            throw new RuntimeException("No hay técnicos disponibles del nivel " + siguienteNivel.getDescripcion());
        }
        
        // 6. Reasignar ticket
        AsignarTicketRequestDTO request = AsignarTicketRequestDTO.builder()
            .ticketId(ticketId)
            .tecnicoId(tecnicoSiguiente.get().getIdUsuario())
            .comentario(String.format("Escalamiento automático: %s. Técnico anterior: %s (Nivel %s)", 
                motivoEscalamiento, 
                tecnicoActual.getNombreCompleto(), 
                nivelActual.getDescripcion()))
            .prioridad(ticket.getPrioridad())
            .build();
        
        // 7. Actualizar estado del ticket para indicar escalamiento
        ticket.setEstado("ESCALADO");
        ticket.setFechaActualizacion(LocalDateTime.now());
        ticketRepository.save(ticket);
        
        log.info("Ticket {} escalado de nivel {} a nivel {}", 
            ticketId, nivelActual.getDescripcion(), siguienteNivel.getDescripcion());
        
        return asignacionService.reasignarTicket(request, "SISTEMA");
    }
    
    /**
     * Escalar ticket manualmente a un nivel específico
     */
    public AsignacionResponseDTO escalarTicketANivel(Long ticketId, NivelTecnico nivelDestino, String motivoEscalamiento) {
        log.info("Escalando ticket {} manualmente al nivel {} - Motivo: {}", 
            ticketId, nivelDestino.getDescripcion(), motivoEscalamiento);
        
        // 1. Buscar ticket
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // 2. Buscar técnico del nivel destino
        Optional<Usuario> tecnicoDestino = buscarTecnicoDisponible(nivelDestino, ticket);
        
        if (tecnicoDestino.isEmpty()) {
            throw new RuntimeException("No hay técnicos disponibles del nivel " + nivelDestino.getDescripcion());
        }
        
        // 3. Reasignar ticket
        AsignarTicketRequestDTO request = AsignarTicketRequestDTO.builder()
            .ticketId(ticketId)
            .tecnicoId(tecnicoDestino.get().getIdUsuario())
            .comentario(String.format("Escalamiento manual: %s", motivoEscalamiento))
            .prioridad(ticket.getPrioridad())
            .build();
        
        // 4. Actualizar estado del ticket
        ticket.setEstado("ESCALADO");
        ticket.setFechaActualizacion(LocalDateTime.now());
        ticketRepository.save(ticket);
        
        return asignacionService.reasignarTicket(request, "SISTEMA");
    }
    
    /**
     * Obtener el siguiente nivel de escalamiento
     */
    private NivelTecnico obtenerSiguienteNivel(NivelTecnico nivelActual) {
        return switch (nivelActual) {
            case BAJO -> NivelTecnico.MEDIO;
            case MEDIO -> NivelTecnico.ALTO;
            case ALTO -> {
                log.warn("Ticket ya está en el nivel más alto (ALTO)");
                throw new RuntimeException("El ticket ya está en el nivel más alto");
            }
        };
    }
    
    /**
     * Buscar técnico disponible del nivel especificado
     */
    private Optional<Usuario> buscarTecnicoDisponible(NivelTecnico nivel, Ticket ticket) {
        log.info("Buscando técnico disponible del nivel {} para ticket {}", 
            nivel.getDescripcion(), ticket.getId());
        
        // 1. Obtener todos los técnicos del nivel especificado
        List<Usuario> tecnicosNivel = usuarioRepository.findByTipoUsuarioAndNivelTecnicoAndActivoTrue(
            com.example.demo.usuario.model.TipoUsuario.TECNICO, nivel);
        
        if (tecnicosNivel.isEmpty()) {
            log.warn("No hay técnicos del nivel {} disponibles", nivel.getDescripcion());
            return Optional.empty();
        }
        
        // 2. Filtrar por área de especialización si está definida
        if (ticket.getCategoria() != null && ticket.getCategoria().getNombre() != null) {
            List<Usuario> tecnicosEspecializados = tecnicosNivel.stream()
                .filter(tecnico -> tecnico.getAreaEspecializacion() != null && 
                    tecnico.getAreaEspecializacion().toLowerCase().contains(
                        ticket.getCategoria().getNombre().toLowerCase()))
                .toList();
            
            if (!tecnicosEspecializados.isEmpty()) {
                log.info("Encontrados {} técnicos especializados en el área", tecnicosEspecializados.size());
                return seleccionarTecnicoMenosCargado(tecnicosEspecializados);
            }
        }
        
        // 3. Si no hay especialistas, seleccionar del nivel general
        log.info("Seleccionando técnico del nivel {} (sin especialización)", nivel.getDescripcion());
        return seleccionarTecnicoMenosCargado(tecnicosNivel);
    }
    
    /**
     * Seleccionar el técnico con menos carga de trabajo
     */
    private Optional<Usuario> seleccionarTecnicoMenosCargado(List<Usuario> tecnicos) {
        return tecnicos.stream()
            .min((t1, t2) -> {
                // Contar tickets activos de cada técnico
                long cargaT1 = ticketRepository.countByTecnicoAsignadoAndEstadoIn(
                    t1, List.of("ASIGNADO", "EN_EJECUCION", "ESCALADO"));
                long cargaT2 = ticketRepository.countByTecnicoAsignadoAndEstadoIn(
                    t2, List.of("ASIGNADO", "EN_EJECUCION", "ESCALADO"));
                
                return Long.compare(cargaT1, cargaT2);
            });
    }
    
    /**
     * Verificar si un ticket puede ser escalado
     */
    @Transactional(readOnly = true)
    public boolean puedeEscalarTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        if (ticket.getTecnicoAsignado() == null) {
            return false;
        }
        
        NivelTecnico nivelActual = ticket.getTecnicoAsignado().getNivelTecnico();
        return nivelActual != null && nivelActual != NivelTecnico.ALTO;
    }
    
    /**
     * Obtener estadísticas de escalamiento
     */
    @Transactional(readOnly = true)
    public EscalamientoStatsDTO obtenerEstadisticasEscalamiento() {
        long ticketsEscalados = ticketRepository.countByEstado("ESCALADO");
        long ticketsEnNivelBajo = ticketRepository.countByTecnicoAsignadoNivelTecnicoAndEstadoIn(
            NivelTecnico.BAJO, List.of("ASIGNADO", "EN_EJECUCION"));
        long ticketsEnNivelMedio = ticketRepository.countByTecnicoAsignadoNivelTecnicoAndEstadoIn(
            NivelTecnico.MEDIO, List.of("ASIGNADO", "EN_EJECUCION"));
        long ticketsEnNivelAlto = ticketRepository.countByTecnicoAsignadoNivelTecnicoAndEstadoIn(
            NivelTecnico.ALTO, List.of("ASIGNADO", "EN_EJECUCION"));
        
        return EscalamientoStatsDTO.builder()
            .ticketsEscalados(ticketsEscalados)
            .ticketsEnNivelBajo(ticketsEnNivelBajo)
            .ticketsEnNivelMedio(ticketsEnNivelMedio)
            .ticketsEnNivelAlto(ticketsEnNivelAlto)
            .build();
    }
}
