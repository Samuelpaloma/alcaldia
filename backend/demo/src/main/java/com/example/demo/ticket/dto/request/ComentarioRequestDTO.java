package com.example.demo.ticket.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ComentarioRequestDTO {
    
    @NotNull(message = "El ID del ticket es obligatorio")
    private Long ticketId;
    
    @NotBlank(message = "El mensaje es obligatorio")
    private String mensaje;
    
    private Long usuarioId;

    // Constructores
    public ComentarioRequestDTO() {}

    public ComentarioRequestDTO(Long ticketId, String mensaje) {
        this.ticketId = ticketId;
        this.mensaje = mensaje;
    }

    public ComentarioRequestDTO(Long ticketId, String mensaje, Long usuarioId) {
        this.ticketId = ticketId;
        this.mensaje = mensaje;
        this.usuarioId = usuarioId;
    }

    // Getters y Setters
    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }
}













