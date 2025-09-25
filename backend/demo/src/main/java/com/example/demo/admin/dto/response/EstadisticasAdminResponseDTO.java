package com.example.demo.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasAdminResponseDTO {
    
    private long totalTickets;
    private long ticketsPendientes;
    private long ticketsAsignados;
    private long ticketsEnEjecucion;
    private long ticketsTerminados;
    private long ticketsSinAsignar;
    private LocalDateTime fechaConsulta;
    
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
        return String.format("Total: %d tickets (%d pendientes, %d asignados, %d en ejecución, %d terminados, %d sin asignar)", 
            totalTickets, ticketsPendientes, ticketsAsignados, ticketsEnEjecucion, ticketsTerminados, ticketsSinAsignar);
    }
}


