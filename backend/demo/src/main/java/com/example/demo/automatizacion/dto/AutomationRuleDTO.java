package com.example.demo.automatizacion.dto;

import java.time.LocalDateTime;

public class AutomationRuleDTO {
    
    private Long id;
    private String nombre;
    private String descripcion;
    private String condicion;
    private String accion;
    private String prioridad;
    private Boolean activa;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private Integer ejecuciones;
    private LocalDateTime ultimaEjecucion;
    
    // Constructores
    public AutomationRuleDTO() {}
    
    public AutomationRuleDTO(Long id, String nombre, String descripcion, String condicion, 
                           String accion, String prioridad, Boolean activa, 
                           LocalDateTime fechaCreacion, LocalDateTime fechaActualizacion, 
                           Integer ejecuciones, LocalDateTime ultimaEjecucion) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.condicion = condicion;
        this.accion = accion;
        this.prioridad = prioridad;
        this.activa = activa;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
        this.ejecuciones = ejecuciones;
        this.ultimaEjecucion = ultimaEjecucion;
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public String getCondicion() { return condicion; }
    public void setCondicion(String condicion) { this.condicion = condicion; }
    
    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }
    
    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }
    
    public Boolean getActiva() { return activa; }
    public void setActiva(Boolean activa) { this.activa = activa; }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
    
    public Integer getEjecuciones() { return ejecuciones; }
    public void setEjecuciones(Integer ejecuciones) { this.ejecuciones = ejecuciones; }
    
    public LocalDateTime getUltimaEjecucion() { return ultimaEjecucion; }
    public void setUltimaEjecucion(LocalDateTime ultimaEjecucion) { this.ultimaEjecucion = ultimaEjecucion; }
}
