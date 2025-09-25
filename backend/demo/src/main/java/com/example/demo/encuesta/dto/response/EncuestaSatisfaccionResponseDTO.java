package com.example.demo.encuesta.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class EncuestaSatisfaccionResponseDTO {
    
    private Long id;
    private Long ticketId;
    private String ticketAsunto;
    private Integer calificacion;
    private String comentario;
    private List<String> aspectosPositivos;
    private List<String> aspectosNegativos;
    private String nombreUsuario;
    private String emailUsuario;
    private LocalDateTime fechaCreacion;
    private String nivelSatisfaccion;

    // Constructores
    public EncuestaSatisfaccionResponseDTO() {}

    public EncuestaSatisfaccionResponseDTO(Long id, Long ticketId, String ticketAsunto, Integer calificacion, 
                                         String comentario, List<String> aspectosPositivos, List<String> aspectosNegativos,
                                         String nombreUsuario, String emailUsuario, LocalDateTime fechaCreacion) {
        this.id = id;
        this.ticketId = ticketId;
        this.ticketAsunto = ticketAsunto;
        this.calificacion = calificacion;
        this.comentario = comentario;
        this.aspectosPositivos = aspectosPositivos;
        this.aspectosNegativos = aspectosNegativos;
        this.nombreUsuario = nombreUsuario;
        this.emailUsuario = emailUsuario;
        this.fechaCreacion = fechaCreacion;
        this.nivelSatisfaccion = calcularNivelSatisfaccion(calificacion);
    }

    private String calcularNivelSatisfaccion(Integer calificacion) {
        if (calificacion >= 5) return "Excelente";
        if (calificacion >= 4) return "Bueno";
        if (calificacion >= 3) return "Regular";
        if (calificacion >= 2) return "Malo";
        return "Terrible";
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

    public String getTicketAsunto() {
        return ticketAsunto;
    }

    public void setTicketAsunto(String ticketAsunto) {
        this.ticketAsunto = ticketAsunto;
    }

    public Integer getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(Integer calificacion) {
        this.calificacion = calificacion;
        this.nivelSatisfaccion = calcularNivelSatisfaccion(calificacion);
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public List<String> getAspectosPositivos() {
        return aspectosPositivos;
    }

    public void setAspectosPositivos(List<String> aspectosPositivos) {
        this.aspectosPositivos = aspectosPositivos;
    }

    public List<String> getAspectosNegativos() {
        return aspectosNegativos;
    }

    public void setAspectosNegativos(List<String> aspectosNegativos) {
        this.aspectosNegativos = aspectosNegativos;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getEmailUsuario() {
        return emailUsuario;
    }

    public void setEmailUsuario(String emailUsuario) {
        this.emailUsuario = emailUsuario;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public String getNivelSatisfaccion() {
        return nivelSatisfaccion;
    }

    public void setNivelSatisfaccion(String nivelSatisfaccion) {
        this.nivelSatisfaccion = nivelSatisfaccion;
    }
}






