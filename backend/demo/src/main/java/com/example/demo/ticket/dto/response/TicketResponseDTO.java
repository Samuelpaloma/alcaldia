package com.example.demo.ticket.dto.response;

import java.time.LocalDateTime;

public class TicketResponseDTO {

    private Long id;
    private String descripcion;
    private String prioridad;
    private String estado;
    private String creadorEmail;
    private String tecnicoEmail;
    private LocalDateTime fechaCreacion;

    public TicketResponseDTO(Long id, String descripcion, String prioridad, String estado,
                             String creadorEmail, String tecnicoEmail, LocalDateTime fechaCreacion) {
        this.id = id;
        this.descripcion = descripcion;
        this.prioridad = prioridad;
        this.estado = estado;
        this.creadorEmail = creadorEmail;
        this.tecnicoEmail = tecnicoEmail;
        this.fechaCreacion = fechaCreacion;
    }

    // Getters
    public Long getId() { return id; }
    public String getDescripcion() { return descripcion; }
    public String getPrioridad() { return prioridad; }
    public String getEstado() { return estado; }
    public String getCreadorEmail() { return creadorEmail; }
    public String getTecnicoEmail() { return tecnicoEmail; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    
}
