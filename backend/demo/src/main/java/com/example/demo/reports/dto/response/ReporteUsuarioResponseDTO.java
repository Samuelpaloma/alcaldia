package com.example.demo.reports.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteUsuarioResponseDTO {
    
    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioEmail;
    private String titulo;
    private String subtitulo;
    private String tipoPeriodo;
    private String valorPeriodo;
    private String nombreArchivo;
    private String datosReporte;
    private String estadisticas;
    private String categoriasTop;
    private String tecnicosTop;
    private LocalDateTime fechaGeneracion;
    private String observaciones;
    private Boolean activo;
}

