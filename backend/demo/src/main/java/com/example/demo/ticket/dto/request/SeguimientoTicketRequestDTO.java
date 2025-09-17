package com.example.demo.ticket.dto.request;

import jakarta.validation.constraints.NotBlank;

public class SeguimientoTicketRequestDTO {
    
    @NotBlank(message = "El ID del ticket es obligatorio")
    private String ticketId;
    
    private String emailUsuario;

    public SeguimientoTicketRequestDTO() {}

    public SeguimientoTicketRequestDTO(String ticketId, String emailUsuario) {
        this.ticketId = ticketId;
        this.emailUsuario = emailUsuario;
    }

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }

    public String getEmailUsuario() { return emailUsuario; }
    public void setEmailUsuario(String emailUsuario) { this.emailUsuario = emailUsuario; }
}
