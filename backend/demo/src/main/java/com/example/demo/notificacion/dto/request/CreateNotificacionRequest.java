package com.example.demo.notificacion.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateNotificacionRequest {
    
    @NotBlank(message = "El título es obligatorio")
    private String titulo;
    
    @NotBlank(message = "El mensaje es obligatorio")
    private String mensaje;
    
    @NotBlank(message = "El tipo es obligatorio")
    private String tipo;
    
    @NotBlank(message = "El email del usuario es obligatorio")
    private String usuarioEmail;
    
    private Long ticketId;
}