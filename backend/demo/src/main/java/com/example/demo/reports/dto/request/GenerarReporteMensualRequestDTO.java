package com.example.demo.reports.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerarReporteMensualRequestDTO {
    
    @NotNull(message = "El mes es obligatorio")
    private Integer mes;
    
    @NotNull(message = "El año es obligatorio")
    private Integer año;
    
    @NotNull(message = "El tipo de reporte es obligatorio")
    @Pattern(regexp = "^(MENSUAL|SATISFACCION|RENDIMIENTO|CATEGORIA)$", 
             message = "El tipo de reporte debe ser: MENSUAL, SATISFACCION, RENDIMIENTO o CATEGORIA")
    private String tipoReporte;
    
    private String observaciones;
}
