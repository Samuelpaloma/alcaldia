package com.example.demo.ticket.dto.response;

import java.time.LocalDateTime;

public class ComentarioResponseDTO {
    
    private Long id;
    private Long ticketId;
    private String mensaje;
    private String autor;
    private String autorEmail;
    private String tipoAutor;
    private LocalDateTime fechaCreacion;

    // Constructores
    public ComentarioResponseDTO() {}

    public ComentarioResponseDTO(Long id, Long ticketId, String mensaje, String autor, 
                                String autorEmail, String tipoAutor, LocalDateTime fechaCreacion) {
        this.id = id;
        this.ticketId = ticketId;
        this.mensaje = mensaje;
        this.autor = autor;
        this.autorEmail = autorEmail;
        this.tipoAutor = tipoAutor;
        this.fechaCreacion = fechaCreacion;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public String getAutorEmail() {
        return autorEmail;
    }

    public void setAutorEmail(String autorEmail) {
        this.autorEmail = autorEmail;
    }

    public String getTipoAutor() {
        return tipoAutor;
    }

    public void setTipoAutor(String tipoAutor) {
        this.tipoAutor = tipoAutor;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}













