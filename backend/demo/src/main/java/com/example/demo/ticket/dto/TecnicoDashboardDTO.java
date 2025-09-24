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
    
}