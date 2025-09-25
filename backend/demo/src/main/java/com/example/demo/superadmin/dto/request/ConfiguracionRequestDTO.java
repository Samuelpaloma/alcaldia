package com.example.demo.superadmin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionRequestDTO {
    
    @NotBlank(message = "La clave es obligatoria")
    private String clave;
    
    @NotBlank(message = "El valor es obligatorio")
    private String valor;
    
    private String descripcion;
    private String categoria;
    
    // DTOs específicos para colores
    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", 
             message = "El color primario debe ser un código hexadecimal válido")
    private String colorPrimario;
    
    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", 
             message = "El color secundario debe ser un código hexadecimal válido")
    private String colorSecundario;
    
    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", 
             message = "El color de fondo debe ser un código hexadecimal válido")
    private String colorFondo;
    
    // DTOs específicos para logo
    private String logoUrl;
    private String nombreApp;
}


