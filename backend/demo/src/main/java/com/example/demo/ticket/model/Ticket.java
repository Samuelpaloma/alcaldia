package com.example.demo.ticket.model;

import com.example.demo.usuario.model.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Usuario que crea el ticket (puede ser usuario normal o admin)
    @ManyToOne
    @JoinColumn(name = "creador_id")
    private User creador;

    // Técnico asignado al ticket
    @ManyToOne
    @JoinColumn(name = "tecnico_id")
    private User tecnicoAsignado;

    // Estado del ticket
    private String estado;

    // Campos del formulario de funcionarios
    @Column(name = "ubicacion", nullable = false)
    private String ubicacion;

    @Column(name = "consulta", columnDefinition = "TEXT")
    private String consulta;

    @Column(name = "categoria", nullable = false)
    private String categoria;

    @Column(name = "archivo_adjunto")
    private String archivoAdjunto;

    @Column(name = "nombre_archivo")
    private String nombreArchivo;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Campos existentes
    private String descripcion;
    private String prioridad;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getCreador() { return creador; }
    public void setCreador(User creador) { this.creador = creador; }

    public User getTecnicoAsignado() { return tecnicoAsignado; }
    public void setTecnicoAsignado(User tecnicoAsignado) { this.tecnicoAsignado = tecnicoAsignado; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    // Getters y setters para campos del formulario
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }

    public String getConsulta() { return consulta; }
    public void setConsulta(String consulta) { this.consulta = consulta; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getArchivoAdjunto() { return archivoAdjunto; }
    public void setArchivoAdjunto(String archivoAdjunto) { this.archivoAdjunto = archivoAdjunto; }

    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }

    // Método para inicializar fechas
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}