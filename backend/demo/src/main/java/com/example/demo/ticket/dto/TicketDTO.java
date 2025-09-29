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
        this.estado = ticket.getEstado();
        this.descripcion = ticket.getDescripcion();
        this.prioridad = ticket.getPrioridad();
        this.ubicacion = ticket.getUbicacion();
        this.categoria = ticket.getCategoria() != null ? ticket.getCategoria().getNombre() : null;
        this.consulta = ticket.getConsulta();
        this.nombreArchivo = ticket.getNombreArchivo();
        this.fechaCreacion = ticket.getFechaCreacion();
        this.fechaActualizacion = ticket.getFechaActualizacion();
        this.tecnicoNombre = ticket.getTecnicoAsignado() != null
            ? ticket.getTecnicoAsignado().getNombreCompleto()
            : null;
    }
}
