package com.example.demo.categoria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaSimpleDTO {
    
    private Long id;
    private String nombre;
    private String colorHex;
    private String icono;
    private Integer orden;
    private Boolean activa;
    
    // Para selects y listas simples
    public String getDisplayName() {
        return nombre;
    }
}


