package com.example.demo.ticket.model;

import com.example.demo.usuario.model.Usuario;
import jakarta.persistence.*;

@Entity
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

    // Estado del ticket
    private String estado;

    // Otros campos opcionales
    private String descripcion;
    private String prioridad;

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getCreador() { return creador; }
    public void setCreador(Usuario creador) { this.creador = creador; }

    public Usuario getTecnicoAsignado() { return tecnicoAsignado; }
    public void setTecnicoAsignado(Usuario tecnicoAsignado) { this.tecnicoAsignado = tecnicoAsignado; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }
}
