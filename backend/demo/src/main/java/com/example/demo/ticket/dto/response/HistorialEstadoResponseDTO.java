package com.example.demo.ticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistorialEstadoResponseDTO {
    
    private Long idHistorial;
    private Long ticketId;
    private String estadoAnterior;
    private String estadoNuevo;
    private String comentario;
    private String observaciones;
    private LocalDateTime fechaCambio;
    private String cambiadoPor;
    private String cambiadoPorEmail;
    private String tipoUsuario; // TECNICO, ADMINISTRADOR, etc.
}


