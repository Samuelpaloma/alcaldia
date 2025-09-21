package com.example.demo.asignacion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionResponseDTO {
    
    private Long idAsignacion;
    private Long ticketId;
    private String ticketTitulo;
    private Long tecnicoId;
    private String tecnicoNombre;
    private String tecnicoEmail;
    private String estadoAnterior;
    private String estadoNuevo;
    private String prioridad;
    private String comentario;
    private LocalDateTime fechaAsignacion;
    private String asignadoPor; // Quien hizo la asignación
}


