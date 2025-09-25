package com.example.demo.ticket.model;

import com.example.demo.usuario.model.Usuario;
import com.example.demo.categoria.model.Categoria;
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
    private Usuario creador;

    // Técnico asignado al ticket
    @ManyToOne
    @JoinColumn(name = "tecnico_id")
    private Usuario tecnicoAsignado;
    
    // Email del técnico asignado (para compatibilidad)
    @Column(name = "tecnico_email")
    private String tecnicoEmail;

    // Categoría del ticket
    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoriaObjeto;

    // Estado del ticket
    private String estado;

    // Campos del formulario de funcionarios
    @Column(name = "ubicacion", nullable = false)
    private String ubicacion;

    @Column(name = "consulta", columnDefinition = "TEXT")
    private String consulta;

    // Campo de categoría como string (para compatibilidad temporal)
    @Column(name = "categoria_string")
    private String categoriaString;

    // Campo de categoría (requerido por la tabla)
    @Column(name = "categoria")
    private String categoriaNombre;

    @Column(name = "archivo_adjunto")
    private String archivoAdjunto;

    @Column(name = "nombre_archivo")
    private String nombreArchivo;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Campos existentes
    private String asunto;
    private String descripcion;
    private String prioridad;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getCreador() { return creador; }
    public void setCreador(Usuario creador) { this.creador = creador; }

    public Usuario getTecnicoAsignado() { return tecnicoAsignado; }
    public void setTecnicoAsignado(Usuario tecnicoAsignado) { this.tecnicoAsignado = tecnicoAsignado; }
    
    public String getTecnicoEmail() { return tecnicoEmail; }
    public void setTecnicoEmail(String tecnicoEmail) { this.tecnicoEmail = tecnicoEmail; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getAsunto() { return asunto; }
    public void setAsunto(String asunto) { this.asunto = asunto; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    // Getters y setters para campos del formulario
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }

    public String getConsulta() { return consulta; }
    public void setConsulta(String consulta) { this.consulta = consulta; }

    public Categoria getCategoria() { return categoriaObjeto; }
    public void setCategoria(Categoria categoria) { this.categoriaObjeto = categoria; }

    public String getCategoriaString() { return categoriaString; }
    public void setCategoriaString(String categoriaString) { this.categoriaString = categoriaString; }

    public String getCategoriaNombre() { return categoriaNombre; }
    public void setCategoriaNombre(String categoriaNombre) { this.categoriaNombre = categoriaNombre; }

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
