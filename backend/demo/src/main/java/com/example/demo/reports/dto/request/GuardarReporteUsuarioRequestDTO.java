package com.example.demo.reports.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuardarReporteUsuarioRequestDTO {
    
    @NotBlank(message = "El título es obligatorio")
    private String titulo;
    
    private String subtitulo;
    
    @NotBlank(message = "El tipo de período es obligatorio")
    private String tipoPeriodo; // daily, weekly, monthly, yearly
    
    @NotNull(message = "El valor del período es obligatorio")
    private String valorPeriodo;
    
    @NotBlank(message = "El nombre del archivo es obligatorio")
    private String nombreArchivo;
    
    @NotBlank(message = "Los datos del reporte son obligatorios")
    private String datosReporte; // JSON con los datos del reporte
    
    private String estadisticas; // JSON con las estadísticas
    
    private String categoriasTop; // JSON con las categorías top
    
    private String tecnicosTop; // JSON con los técnicos top
    
    private String observaciones;
}

