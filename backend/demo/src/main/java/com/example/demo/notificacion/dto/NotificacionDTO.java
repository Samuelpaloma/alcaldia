package com.example.demo.notificacion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionDTO {
    
    private Long id;
    private String titulo;
    private String mensaje;
    private String tipo;
    private Boolean leida;
    private Long usuarioId;
    private String usuarioEmail;
    private String creadorEmail;
    private Long ticketId;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaLeida;
    private LocalDateTime fechaActualizacion;
    
    // Campos adicionales para el frontend
    private String prioridad = "normal";
    private Long usuarioActorId;
    private String usuarioActorEmail;
    private String usuarioActorNombre;
}
