package com.example.demo.ticket.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class HistorialTicketResponseDTO {
    
    private Long id;
    private String nombre;
    private String ubicacion;
    private String categoria;
    private String estado;
    private String prioridad;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private String tecnicoAsignado;
    private List<String> actualizaciones;

    public HistorialTicketResponseDTO() {}

    public HistorialTicketResponseDTO(Long id, String nombre, String ubicacion, String categoria,
                                     String estado, String prioridad, LocalDateTime fechaCreacion,
                                     LocalDateTime fechaActualizacion, String tecnicoAsignado) {
        this.id = id;
        this.nombre = nombre;
        this.ubicacion = ubicacion;
        this.categoria = categoria;
        this.estado = estado;
        this.prioridad = prioridad;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
        this.tecnicoAsignado = tecnicoAsignado;
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    public String getTecnicoAsignado() { return tecnicoAsignado; }
    public void setTecnicoAsignado(String tecnicoAsignado) { this.tecnicoAsignado = tecnicoAsignado; }

    public List<String> getActualizaciones() { return actualizaciones; }
    public void setActualizaciones(List<String> actualizaciones) { this.actualizaciones = actualizaciones; }
}
