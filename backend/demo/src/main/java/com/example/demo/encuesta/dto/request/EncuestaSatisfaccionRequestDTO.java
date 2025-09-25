package com.example.demo.encuesta.dto.request;

import jakarta.validation.constraints.*;
import java.util.List;

public class EncuestaSatisfaccionRequestDTO {
    
    @NotNull(message = "El ID del ticket es obligatorio")
    private Long ticketId;
    
    @NotNull(message = "La calificación es obligatoria")
    @Min(value = 1, message = "La calificación mínima es 1")
    @Max(value = 5, message = "La calificación máxima es 5")
    private Integer calificacion;
    
    private String comentario;
    
    private List<String> aspectosPositivos;
    
    private List<String> aspectosNegativos;

    // Constructores
    public EncuestaSatisfaccionRequestDTO() {}

    public EncuestaSatisfaccionRequestDTO(Long ticketId, Integer calificacion, String comentario, 
                                        List<String> aspectosPositivos, List<String> aspectosNegativos) {
        this.ticketId = ticketId;
        this.calificacion = calificacion;
        this.comentario = comentario;
        this.aspectosPositivos = aspectosPositivos;
        this.aspectosNegativos = aspectosNegativos;
    }

    // Getters y Setters
    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public Integer getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(Integer calificacion) {
        this.calificacion = calificacion;
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
}






