package com.example.demo.escalamiento.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EscalamientoStatsDTO {
    
    private long ticketsEscalados;
    private long ticketsEnNivelBajo;
    private long ticketsEnNivelMedio;
    private long ticketsEnNivelAlto;
    
    public long getTotalTicketsActivos() {
        return ticketsEnNivelBajo + ticketsEnNivelMedio + ticketsEnNivelAlto;
    }
    
    public double getPorcentajeEscalamiento() {
        long total = getTotalTicketsActivos() + ticketsEscalados;
        if (total == 0) return 0.0;
        return (double) ticketsEscalados / total * 100;
    }
}
