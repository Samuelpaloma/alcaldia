package com.example.demo.categoria.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaResponseDTO {
    
    private Long idCategoria;
    private String nombre;
    private String descripcion;
    private Boolean activa;
    private String colorHex;
    private String icono;
    private Integer orden;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    
    // Campos calculados
    private String nombreCompleto;
    private Long totalTickets; // Número de tickets en esta categoría
    
    // Método para obtener nombre completo
    public String getNombreCompleto() {
        if (nombreCompleto == null) {
            nombreCompleto = nombre + (descripcion != null && !descripcion.trim().isEmpty() 
                ? " - " + descripcion : "");
        }
        return nombreCompleto;
    }
}


