package com.example.demo.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TecnicoDashboardDTO {
    
    private long ticketsPendientes;
    private long ticketsEnProceso;
    private long ticketsCompletados;
    private long ticketsAsignados;
    
    // Nuevos campos para evidencias y notificaciones
    private long evidencias;
    private long notificaciones;
    
    // Constructor para compatibilidad con el código existente
    public TecnicoDashboardDTO(long ticketsPendientes, long ticketsEnProceso, long ticketsCompletados, long ticketsAsignados) {
        this.ticketsPendientes = ticketsPendientes;
        this.ticketsEnProceso = ticketsEnProceso;
        this.ticketsCompletados = ticketsCompletados;
        this.ticketsAsignados = ticketsAsignados;
        this.evidencias = 0; // Por defecto 0 hasta implementar el modelo
        this.notificaciones = 0; // Por defecto 0 hasta implementar el modelo
    }
}