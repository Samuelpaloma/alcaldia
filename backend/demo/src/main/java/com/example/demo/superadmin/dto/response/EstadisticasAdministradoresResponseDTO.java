package com.example.demo.superadmin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasAdministradoresResponseDTO {
    private long totalAdministradores;
    private long administradoresActivos;
    private long administradoresInactivos;
}


