package com.example.demo.automation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReglaAutomatizacionResponseDTO {
    
    private Long id;
    private String nombre;
    private String descripcion;
    private String condicion;
    private String accion;
    private Integer prioridad;
    private Boolean activa;
    private Integer ejecuciones;
    private LocalDateTime ultimaEjecucion;
    private String creadoPor;
    private LocalDateTime fechaCreacion;
}






