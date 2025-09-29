package com.example.demo.automatizacion.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "automation_rules")
public class AutomationRule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(nullable = false)
    private String condicion;
    
    @Column(nullable = false)
    private String accion;
    
    @Column(nullable = false)
    private String prioridad;
    
    @Column(nullable = false)
    private Boolean activa = true;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @Column(nullable = false)
    private Integer ejecuciones = 0;
    
    @Column(name = "ultima_ejecucion")
    private LocalDateTime ultimaEjecucion;
    
    // Constructores
    public AutomationRule() {
        this.fechaCreacion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
    }
    
    public AutomationRule(String nombre, String descripcion, String condicion, String accion, String prioridad) {
        this();
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.condicion = condicion;
        this.accion = accion;
        this.prioridad = prioridad;
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
    public void setActiva(Boolean activa) { 
        this.activa = activa; 
        this.fechaActualizacion = LocalDateTime.now();
    }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
    
    public Integer getEjecuciones() { return ejecuciones; }
    public void setEjecuciones(Integer ejecuciones) { this.ejecuciones = ejecuciones; }
    
    public LocalDateTime getUltimaEjecucion() { return ultimaEjecucion; }
    public void setUltimaEjecucion(LocalDateTime ultimaEjecucion) { this.ultimaEjecucion = ultimaEjecucion; }
    
    // Métodos de utilidad
    public void incrementarEjecuciones() {
        this.ejecuciones++;
        this.ultimaEjecucion = LocalDateTime.now();
        this.fechaActualizacion = LocalDateTime.now();
    }
}
