package com.example.demo.ai.dto.response;

import java.util.List;

public class SugerenciaIAResponseDTO {
    
    private String categoriaSugerida;
    private String prioridadSugerida;
    private String tecnicoSugerido;
    private List<String> solucionesSugeridas;
    private Integer confianza;
    private String razonamiento;

    // Constructores
    public SugerenciaIAResponseDTO() {}

    public SugerenciaIAResponseDTO(String categoriaSugerida, String prioridadSugerida, 
                                  String tecnicoSugerido, List<String> solucionesSugeridas,
                                  Integer confianza, String razonamiento) {
        this.categoriaSugerida = categoriaSugerida;
        this.prioridadSugerida = prioridadSugerida;
        this.tecnicoSugerido = tecnicoSugerido;
        this.solucionesSugeridas = solucionesSugeridas;
        this.confianza = confianza;
        this.razonamiento = razonamiento;
    }

    // Getters y Setters
    public String getCategoriaSugerida() { return categoriaSugerida; }
    public void setCategoriaSugerida(String categoriaSugerida) { this.categoriaSugerida = categoriaSugerida; }
    
    public String getPrioridadSugerida() { return prioridadSugerida; }
    public void setPrioridadSugerida(String prioridadSugerida) { this.prioridadSugerida = prioridadSugerida; }
    
    public String getTecnicoSugerido() { return tecnicoSugerido; }
    public void setTecnicoSugerido(String tecnicoSugerido) { this.tecnicoSugerido = tecnicoSugerido; }
    
    public List<String> getSolucionesSugeridas() { return solucionesSugeridas; }
    public void setSolucionesSugeridas(List<String> solucionesSugeridas) { this.solucionesSugeridas = solucionesSugeridas; }
    
    public Integer getConfianza() { return confianza; }
    public void setConfianza(Integer confianza) { this.confianza = confianza; }
    
    public String getRazonamiento() { return razonamiento; }
    public void setRazonamiento(String razonamiento) { this.razonamiento = razonamiento; }
}






