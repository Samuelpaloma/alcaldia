package com.example.demo.superadmin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionResponseDTO {
    
    private Long idConfiguracion;
    private String clave;
    private String valor;
    private String descripcion;
    private String categoria;
    private Boolean activa;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    
    // Para respuestas agrupadas
    private Map<String, String> colores;
    private Map<String, String> logo;
    private Map<String, String> general;
    
    // Métodos de utilidad
    public String getValorCompleto() {
        return clave + ": " + valor;
    }
}


