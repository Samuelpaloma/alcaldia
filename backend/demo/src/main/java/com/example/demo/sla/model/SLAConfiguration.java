package com.example.demo.sla.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sla_configurations")
public class SLAConfiguration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "nombre", nullable = false)
    private String nombre;
    
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "categoria_id")
    private Long categoriaId;
    
    @Column(name = "categoria_nombre")
    private String categoriaNombre;
    
    @Column(name = "prioridad", length = 20)
    private String prioridad;
    
    @Column(name = "tiempo_respuesta_horas", nullable = false)
    private Integer tiempoRespuestaHoras;
    
    @Column(name = "tiempo_resolucion_horas", nullable = false)
    private Integer tiempoResolucionHoras;
    
    @Column(name = "tiempo_alerta_horas", nullable = false)
    private Integer tiempoAlertaHoras = 2;
    
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
    
    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @UpdateTimestamp
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
    
    // Constructores
    public SLAConfiguration() {}
    
    public SLAConfiguration(Long id, String nombre, String descripcion, Long categoriaId, String categoriaNombre, String prioridad, Integer tiempoRespuestaHoras, 
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
