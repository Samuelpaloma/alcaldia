package com.example.demo.notificacion.dto.request;

import com.example.demo.notificacion.model.Notificacion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateNotificacionRequest {
    
    @NotBlank(message = "El título es obligatorio")
    private String titulo;
    
    @NotBlank(message = "El mensaje es obligatorio")
    private String mensaje;
    
    @NotNull(message = "El tipo de notificación es obligatorio")
    private Notificacion.TipoNotificacion tipo;
    
    @NotNull(message = "El ID del usuario es obligatorio")
    private Long usuarioId;
    
    private Long ticketId;
}
