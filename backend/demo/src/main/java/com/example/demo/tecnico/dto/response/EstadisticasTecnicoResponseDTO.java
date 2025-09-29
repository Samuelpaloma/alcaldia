package com.example.demo.tecnico.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasTecnicoResponseDTO {
    
    private long totalTickets;
    private long ticketsPendientes;
    private long ticketsEnEjecucion;
    private long ticketsTerminados;
    private long totalEvidencias;
    private long totalNotificaciones;
    private String tecnicoNombre;
    private String tecnicoEmail;
    
    // Métodos de utilidad
    public double getPorcentajeCompletados() {
        if (totalTickets == 0) return 0.0;
        return (double) ticketsTerminados / totalTickets * 100;
    }
    
    public double getPorcentajeEnProgreso() {
        if (totalTickets == 0) return 0.0;
        return (double) ticketsEnEjecucion / totalTickets * 100;
    }
    
    public String getResumenEstadisticas() {
        return String.format("%s: %d tickets totales (%d pendientes, %d en ejecución, %d terminados)", 
            tecnicoNombre, totalTickets, ticketsPendientes, ticketsEnEjecucion, ticketsTerminados);
    }
}


