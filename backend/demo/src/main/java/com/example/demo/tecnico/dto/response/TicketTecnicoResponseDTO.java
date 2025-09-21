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
}
