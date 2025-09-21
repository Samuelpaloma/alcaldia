package com.example.demo.ticket.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class TicketResponseDTO {

    private Long id;
    private String descripcion;
    private String prioridad;
    private String estado;
    private String creadorEmail;
    private String tecnicoEmail;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    
    // Campos del formulario de funcionarios
    private String nombre;
    private String ubicacion;
    private String consulta;
    private String categoria;
    private String archivoAdjunto;
    private String nombreArchivo;
    
    // Evidencias del ticket
    private List<EvidenciaResponseDTO> evidencias;
    
    // Historial de cambios de estado
    private List<HistorialEstadoResponseDTO> historialEstados;

    // Constructor completo
    public TicketResponseDTO(Long id, String descripcion, String prioridad, String estado,
                             String creadorEmail, String tecnicoEmail, LocalDateTime fechaCreacion,
                             LocalDateTime fechaActualizacion, String nombre, String ubicacion,
                             String consulta, String categoria, String archivoAdjunto, String nombreArchivo,
                             List<EvidenciaResponseDTO> evidencias, List<HistorialEstadoResponseDTO> historialEstados) {
        this.id = id;
        this.descripcion = descripcion;
        this.prioridad = prioridad;
        this.estado = estado;
        this.creadorEmail = creadorEmail;
        this.tecnicoEmail = tecnicoEmail;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
        this.nombre = nombre;
        this.ubicacion = ubicacion;
        this.consulta = consulta;
        this.categoria = categoria;
        this.archivoAdjunto = archivoAdjunto;
        this.nombreArchivo = nombreArchivo;
        this.evidencias = evidencias;
        this.historialEstados = historialEstados;
    }

    // Constructor básico para compatibilidad
    public TicketResponseDTO(Long id, String descripcion, String prioridad, String estado,
                             String creadorEmail, String tecnicoEmail, LocalDateTime fechaCreacion) {
        this.id = id;
        this.descripcion = descripcion;
        this.prioridad = prioridad;
        this.estado = estado;
        this.creadorEmail = creadorEmail;
        this.tecnicoEmail = tecnicoEmail;
        this.fechaCreacion = fechaCreacion;
    }

    // Getters
    public Long getId() { return id; }
    public String getDescripcion() { return descripcion; }
    public String getPrioridad() { return prioridad; }
    public String getEstado() { return estado; }
    public String getCreadorEmail() { return creadorEmail; }
    public String getTecnicoEmail() { return tecnicoEmail; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public LocalDateTime getFechaActualizacion() { return fechaActualizacion; }
    public String getNombre() { return nombre; }
    public String getUbicacion() { return ubicacion; }
    public String getConsulta() { return consulta; }
    public String getCategoria() { return categoria; }
    public String getArchivoAdjunto() { return archivoAdjunto; }
    public String getNombreArchivo() { return nombreArchivo; }
    public List<EvidenciaResponseDTO> getEvidencias() { return evidencias; }
    public List<HistorialEstadoResponseDTO> getHistorialEstados() { return historialEstados; }
    
    // Setters
    public void setEvidencias(List<EvidenciaResponseDTO> evidencias) { this.evidencias = evidencias; }
    public void setHistorialEstados(List<HistorialEstadoResponseDTO> historialEstados) { this.historialEstados = historialEstados; }
}
