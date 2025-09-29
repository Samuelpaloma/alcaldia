package com.example.demo.ticket.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

public class SubirArchivoRequestDTO {
    
    @NotNull(message = "El ID del ticket es obligatorio")
    private Long ticketId;
    
    @NotBlank(message = "El nombre del archivo es obligatorio")
    private String nombreArchivo;
    
    @NotBlank(message = "El tipo MIME es obligatorio")
    private String tipoMime;
    
    @NotNull(message = "El tamaño del archivo es obligatorio")
    private Long tamañoArchivo;
    
    @NotBlank(message = "La extensión es obligatoria")
    private String extension;
    
    @NotBlank(message = "El contenido del archivo es obligatorio")
    private String contenidoArchivo; // Base64
    
    private String comentario;
    
    // Constructores
    public SubirArchivoRequestDTO() {}
    
    public SubirArchivoRequestDTO(Long ticketId, String nombreArchivo, String tipoMime, Long tamañoArchivo, String extension, String contenidoArchivo) {
        this.ticketId = ticketId;
        this.nombreArchivo = nombreArchivo;
        this.tipoMime = tipoMime;
        this.tamañoArchivo = tamañoArchivo;
        this.extension = extension;
        this.contenidoArchivo = contenidoArchivo;
    }
    
    // Getters y Setters
    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }
    
    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }
    
    public String getTipoMime() { return tipoMime; }
    public void setTipoMime(String tipoMime) { this.tipoMime = tipoMime; }
    
    public Long getTamañoArchivo() { return tamañoArchivo; }
    public void setTamañoArchivo(Long tamañoArchivo) { this.tamañoArchivo = tamañoArchivo; }
    
    public String getExtension() { return extension; }
    public void setExtension(String extension) { this.extension = extension; }
    
    public String getContenidoArchivo() { return contenidoArchivo; }
    public void setContenidoArchivo(String contenidoArchivo) { this.contenidoArchivo = contenidoArchivo; }
    
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
}
