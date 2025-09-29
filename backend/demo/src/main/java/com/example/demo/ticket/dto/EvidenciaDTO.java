package com.example.demo.ticket.dto;

import com.example.demo.evidencia.model.Evidencia;
import java.time.LocalDateTime;

public class EvidenciaDTO {
    private Long id;
    private String nombreArchivo;
    private String rutaArchivo;
    private String tipoArchivo;
    private Long tamañoArchivo;
    private String descripcion;
    private LocalDateTime fechaSubida;

    public EvidenciaDTO() {}

    public EvidenciaDTO(Evidencia evidencia) {
        this.id = evidencia.getIdEvidencia();
        this.nombreArchivo = evidencia.getNombreArchivo();
        this.rutaArchivo = evidencia.getRutaArchivo();
        this.tipoArchivo = evidencia.getTipoEvidencia();
        this.tamañoArchivo = evidencia.getTamanioArchivo();
        this.descripcion = evidencia.getDescripcion();
        this.fechaSubida = evidencia.getFechaSubida();
    }

    // Getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombreArchivo() { return nombreArchivo; }
    public void setNombreArchivo(String nombreArchivo) { this.nombreArchivo = nombreArchivo; }

    public String getRutaArchivo() { return rutaArchivo; }
    public void setRutaArchivo(String rutaArchivo) { this.rutaArchivo = rutaArchivo; }

    public String getTipoArchivo() { return tipoArchivo; }
    public void setTipoArchivo(String tipoArchivo) { this.tipoArchivo = tipoArchivo; }

    public Long getTamañoArchivo() { return tamañoArchivo; }
    public void setTamañoArchivo(Long tamañoArchivo) { this.tamañoArchivo = tamañoArchivo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDateTime getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(LocalDateTime fechaSubida) { this.fechaSubida = fechaSubida; }
}
