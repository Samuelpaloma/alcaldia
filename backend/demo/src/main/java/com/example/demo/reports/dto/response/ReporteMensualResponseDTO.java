package com.example.demo.reports.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteMensualResponseDTO {
    private Long id;
    private String mes;
    private Integer año;
    private Long totalTickets;
    private Long ticketsResueltos;
    private Long ticketsPendientes;
    private Long ticketsEnProceso;
    private Double tiempoPromedioResolucion; // en días
    private Double satisfaccionPromedio; // de 1 a 5
    private List<TopCategoriaDTO> topCategorias;
    private List<TopTecnicoDTO> topTecnicos;
    private LocalDateTime fechaGeneracion;
    private String archivoUrl;
    private String nombreArchivo;
    private Long tamañoArchivo; // en bytes
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopCategoriaDTO {
        private String categoria;
        private Long cantidad;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopTecnicoDTO {
        private String tecnico;
        private Long ticketsResueltos;
        private Double tiempoPromedioResolucion;
    }
}
