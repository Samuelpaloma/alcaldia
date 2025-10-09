package com.example.demo.tecnico.dto.response;

import com.example.demo.ticket.dto.response.EvidenciaResponseDTO;
import com.example.demo.ticket.dto.response.HistorialEstadoResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketTecnicoResponseDTO {
    
    private Long id;
    private String titulo;
    private String descripcion;
    private String estado;
    private String prioridad;
    private String ubicacion;
    private String consulta;
    private String categoria;
    private Long creadorId;
    private String creadorNombre;
    private String creadorEmail;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private String archivoAdjunto;
    private String nombreArchivo;
    
    // Información del técnico asignado
    private Long tecnicoId;
    private String tecnicoNombre;
    private String tecnicoEmail;
    
    // Evidencias del ticket
    private List<com.example.demo.ticket.dto.response.EvidenciaResponseDTO> evidencias;
    
    // Historial de cambios de estado
    private List<com.example.demo.ticket.dto.response.HistorialEstadoResponseDTO> historialEstados;
    
    // Comentarios del ticket
    private List<com.example.demo.ticket.dto.response.ComentarioResponseDTO> comentarios;
    
    // Permisos del técnico actual
    private Boolean puedeCambiarEstado;
    private Boolean esTecnicoEscalado;
    private String rolTecnico; // "ASIGNADO", "ESCALADO", "ORIGINAL"
}
