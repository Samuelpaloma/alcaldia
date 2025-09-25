package com.example.demo.automation.dto.response;

import java.time.LocalDateTime;

public class ReglaAutomatizacionResponseDTO {
    
    private Long id;
    private String nombre;
    private String descripcion;
    private String condicion;
    private String accion;
    private Integer prioridad;
    private Boolean activa;
    private Integer ejecuciones;
    private LocalDateTime ultimaEjecucion;
    private String creadoPor;
    private LocalDateTime fechaCreacion;

    // Constructores
    public ReglaAutomatizacionResponseDTO() {}

    public ReglaAutomatizacionResponseDTO(Long id, String nombre, String descripcion, 
                                        String condicion, String accion, Integer prioridad,
                                        Boolean activa, Integer ejecuciones, LocalDateTime ultimaEjecucion,
                                        String creadoPor, LocalDateTime fechaCreacion) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.condicion = condicion;
        this.accion = accion;
        this.prioridad = prioridad;
        this.activa = activa;
        this.ejecuciones = ejecuciones;
        this.ultimaEjecucion = ultimaEjecucion;
        this.creadoPor = creadoPor;
        this.fechaCreacion = fechaCreacion;
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
    
    public Integer getPrioridad() { return prioridad; }
    public void setPrioridad(Integer prioridad) { this.prioridad = prioridad; }
    
    public Boolean getActiva() { return activa; }
    public void setActiva(Boolean activa) { this.activa = activa; }
    
    public Integer getEjecuciones() { return ejecuciones; }
    public void setEjecuciones(Integer ejecuciones) { this.ejecuciones = ejecuciones; }
    
    public LocalDateTime getUltimaEjecucion() { return ultimaEjecucion; }
    public void setUltimaEjecucion(LocalDateTime ultimaEjecucion) { this.ultimaEjecucion = ultimaEjecucion; }
    
    public String getCreadoPor() { return creadoPor; }
    public void setCreadoPor(String creadoPor) { this.creadoPor = creadoPor; }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}






