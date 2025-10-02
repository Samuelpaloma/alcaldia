package com.example.demo.ticket.dto;

import com.example.demo.ticket.model.Ticket;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class TicketDTO {
    private Long id;
    private String estado;
    private String descripcion;
    private String prioridad;
    private String ubicacion;
    private String categoria;
    private String consulta;
    private String nombreArchivo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private String tecnicoNombre;

    public TicketDTO(Ticket ticket) {
        this.id = ticket.getId();
        this.estado = ticket.getStatus();
        this.descripcion = ticket.getDescription();
        this.prioridad = ticket.getPriority();
        this.ubicacion = ticket.getLocation();
        this.categoria = ticket.getCategory() != null ? ticket.getCategory().getName() : null;
        this.consulta = ticket.getQuery();
        this.nombreArchivo = ticket.getFileName();
        this.fechaCreacion = ticket.getCreatedAt();
        this.fechaActualizacion = ticket.getUpdatedAt();
        this.tecnicoNombre = ticket.getAssignedTechnician() != null
            ? ticket.getAssignedTechnician().getFullName()
            : null;
    }
}
