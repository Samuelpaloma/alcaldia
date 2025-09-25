package com.example.demo.ai.dto.response;

import java.util.List;

public class ClasificacionIAResponseDTO {
    
    private String categoria;
    private String prioridad;
    private String tecnicoSugerido;
    private String tiempoEstimado;
    private Integer confianza;
    private List<String> sugerencias;
    private String algoritmo;
    private String versionModelo;
    private List<String> palabrasClave;
    private Double similitud;

    // Constructores
    public ClasificacionIAResponseDTO() {}

    public ClasificacionIAResponseDTO(String categoria, String prioridad, String tecnicoSugerido, 
                                    String tiempoEstimado, Integer confianza, List<String> sugerencias,
                                    String algoritmo, String versionModelo, List<String> palabrasClave, 
                                    Double similitud) {
        this.categoria = categoria;
        this.prioridad = prioridad;
        this.tecnicoSugerido = tecnicoSugerido;
        this.tiempoEstimado = tiempoEstimado;
        this.confianza = confianza;
        this.sugerencias = sugerencias;
        this.algoritmo = algoritmo;
        this.versionModelo = versionModelo;
        this.palabrasClave = palabrasClave;
        this.similitud = similitud;
    }

    // Getters y Setters
    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getPrioridad() {
        return prioridad;
    }

    public void setPrioridad(String prioridad) {
        this.prioridad = prioridad;
    }

    public String getTecnicoSugerido() {
        return tecnicoSugerido;
    }

    public void setTecnicoSugerido(String tecnicoSugerido) {
        this.tecnicoSugerido = tecnicoSugerido;
    }

    public String getTiempoEstimado() {
        return tiempoEstimado;
    }

    public void setTiempoEstimado(String tiempoEstimado) {
        this.tiempoEstimado = tiempoEstimado;
    }

    public Integer getConfianza() {
        return confianza;
    }

    public void setConfianza(Integer confianza) {
        this.confianza = confianza;
    }

    public List<String> getSugerencias() {
        return sugerencias;
    }

    public void setSugerencias(List<String> sugerencias) {
        this.sugerencias = sugerencias;
    }

    public String getAlgoritmo() {
        return algoritmo;
    }

    public void setAlgoritmo(String algoritmo) {
        this.algoritmo = algoritmo;
    }

    public String getVersionModelo() {
        return versionModelo;
    }

    public void setVersionModelo(String versionModelo) {
        this.versionModelo = versionModelo;
    }

    public List<String> getPalabrasClave() {
        return palabrasClave;
    }

    public void setPalabrasClave(List<String> palabrasClave) {
        this.palabrasClave = palabrasClave;
    }

    public Double getSimilitud() {
        return similitud;
    }

    public void setSimilitud(Double similitud) {
        this.similitud = similitud;
    }
}






