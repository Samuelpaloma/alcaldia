package com.example.demo.superadmin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasSistemaResponseDTO {
    
    private long totalUsuarios;
    private long totalSuperAdmins;
    private long totalAdmins;
    private long totalTecnicos;
    private long totalFuncionarios;
    
    // Métodos de utilidad
    public double getPorcentajeAdmins() {
        return totalUsuarios > 0 ? (double) totalAdmins / totalUsuarios * 100 : 0;
    }
    
    public double getPorcentajeTecnicos() {
        return totalUsuarios > 0 ? (double) totalTecnicos / totalUsuarios * 100 : 0;
    }
    
    public double getPorcentajeFuncionarios() {
        return totalUsuarios > 0 ? (double) totalFuncionarios / totalUsuarios * 100 : 0;
    }
    
    public long getTotalUsuariosActivos() {
        return totalAdmins + totalTecnicos + totalFuncionarios;
    }
}


