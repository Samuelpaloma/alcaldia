package com.example.demo.sla.dto;

import java.time.LocalDateTime;

public class SLAConfigurationDTO {
    
    private Long id;
    private String nombre;
    private String descripcion;
    private Long categoriaId;
    private String categoriaNombre;
    private String prioridad;
    private Integer tiempoRespuestaHoras;
    private Integer tiempoResolucionHoras;
    private Integer tiempoAlertaHoras;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    
    // Constructores
    public SLAConfigurationDTO() {}
    
    public SLAConfigurationDTO(Long id, String nombre, String descripcion, Long categoriaId, 
                               String categoriaNombre, String prioridad, Integer tiempoRespuestaHoras, 
                               Integer tiempoResolucionHoras, Integer tiempoAlertaHoras, Boolean activo, 
                               LocalDateTime fechaCreacion, LocalDateTime fechaActualizacion) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoriaId = categoriaId;
        this.categoriaNombre = categoriaNombre;
        this.prioridad = prioridad;
        this.tiempoRespuestaHoras = tiempoRespuestaHoras;
        this.tiempoResolucionHoras = tiempoResolucionHoras;
        this.tiempoAlertaHoras = tiempoAlertaHoras;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public Long getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Long categoriaId) { this.categoriaId = categoriaId; }
    
    public String getCategoriaNombre() { return categoriaNombre; }
    public void setCategoriaNombre(String categoriaNombre) { this.categoriaNombre = categoriaNombre; }
    
    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }
    
    public Integer getTiempoRespuestaHoras() { return tiempoRespuestaHoras; }
    public void setTiempoRespuestaHoras(Integer tiempoRespuestaHoras) { this.tiempoRespuestaHoras = tiempoRespuestaHoras; }
    
    public Integer getTiempoResolucionHoras() { return tiempoResolucionHoras; }
    public void setTiempoResolucionHoras(Integer tiempoResolucionHoras) { this.tiempoResolucionHoras = tiempoResolucionHoras; }
    
    public Integer getTiempoAlertaHoras() { return tiempoAlertaHoras; }
    public void setTiempoAlertaHoras(Integer tiempoAlertaHoras) { this.tiempoAlertaHoras = tiempoAlertaHoras; }
    
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}