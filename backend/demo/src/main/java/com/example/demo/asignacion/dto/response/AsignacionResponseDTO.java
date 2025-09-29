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
    
    private Long id;
    private Long ticketId;
    private String ticketAsunto;
    private String ticketEstado;
    private Long tecnicoId;
    private String tecnicoNombre;
    private String tecnicoEmail;
    private String comentario;
    private LocalDateTime fechaAsignacion;
    private Boolean activa;
    private String tipoOperacion;
}


