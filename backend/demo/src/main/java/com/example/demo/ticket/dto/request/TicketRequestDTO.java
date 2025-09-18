package com.example.demo.ticket.dto.request;

import jakarta.validation.constraints.NotBlank;

public class TicketRequestDTO {
    
    // Campos del formulario de funcionarios
    @NotBlank(message = "La ubicación es obligatoria")
    private String ubicacion;
    
    // La consulta es opcional - solo se llena si selecciona "Otros" y escribe mensaje personalizado
    private String consulta;
    
    @NotBlank(message = "La categoría es obligatoria")
    private String categoria;
    
    private String prioridad;
    
    // Campos opcionales para archivos
    private String archivoAdjunto;
    private String nombreArchivo;

    // Constructores
    public TicketRequestDTO() {}

    public TicketRequestDTO(String ubicacion, String consulta, String categoria, String prioridad) {
        this.ubicacion = ubicacion;
        this.consulta = consulta;
        this.categoria = categoria;
        this.prioridad = prioridad;
    }

    // Getters y setters
    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }

    public String getConsulta() { return consulta; }
    public void setConsulta(String consulta) { this.consulta = consulta; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public String getArchivoAdjunto() { return archivoAdjunto; }
    public void setArchivoAdjunto(String archivoAdjunto) { this.archivoAdjunto = archivoAdjunto; }

    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }
}
