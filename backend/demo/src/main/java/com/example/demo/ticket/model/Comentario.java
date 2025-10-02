package com.example.demo.ticket.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comentario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;
    
    @Column(name = "mensaje", nullable = false, columnDefinition = "TEXT")
    private String mensaje;
    
    @Column(name = "autor", nullable = false)
    private String autor;
    
    @Column(name = "autor_email", nullable = false)
    private String autorEmail;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_autor", nullable = false)
    private TipoAutor tipoAutor;
    
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    // Constructores
    public Comentario() {}

    public Comentario(Long ticketId, String mensaje, String autor, String autorEmail, TipoAutor tipoAutor, Long usuarioId) {
        this.ticketId = ticketId;
        this.mensaje = mensaje;
        this.autor = autor;
        this.autorEmail = autorEmail;
        this.tipoAutor = tipoAutor;
        this.usuarioId = usuarioId;
        this.fechaCreacion = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public String getAutorEmail() {
        return autorEmail;
    }

    public void setAutorEmail(String autorEmail) {
        this.autorEmail = autorEmail;
    }

    public TipoAutor getTipoAutor() {
        return tipoAutor;
    }

    public void setTipoAutor(TipoAutor tipoAutor) {
        this.tipoAutor = tipoAutor;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    // Enum para tipo de autor
    public enum TipoAutor {
        CLIENTE, TECNICO, ADMINISTRADOR
    }
}













