package com.example.demo.reports.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasReportesResponseDTO {
    private Long totalTickets;
    private Long ticketsResueltos;
    private Long ticketsPendientes;
    private Long ticketsEnProceso;
    private Double tiempoPromedioResolucion; // en días
    private Double satisfaccionPromedio; // de 1 a 5
    private Map<String, Long> ticketsPorCategoria;
    private Map<String, Long> ticketsPorTecnico;
    private Map<String, Long> tendenciaMensual; // mes -> cantidad
}
