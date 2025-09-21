package com.example.demo.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasTecnicosResponseDTO {
    private long totalTecnicos;
    private long tecnicosActivos;
    private long tecnicosInactivos;
}


