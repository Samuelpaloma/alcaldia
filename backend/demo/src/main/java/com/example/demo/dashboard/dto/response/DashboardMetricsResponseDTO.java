package com.example.demo.dashboard.dto.response;

import java.util.List;

public class DashboardMetricsResponseDTO {
    
    private TicketMetrics tickets;
    private TimeMetrics tiempos;
    private TechnicianMetrics tecnicos;
    private List<CategoryMetrics> categorias;
    private List<TrendMetrics> tendencias;

    // Constructores
    public DashboardMetricsResponseDTO() {}

    public DashboardMetricsResponseDTO(TicketMetrics tickets, TimeMetrics tiempos, 
                                     TechnicianMetrics tecnicos, List<CategoryMetrics> categorias,
                                     List<TrendMetrics> tendencias) {
        this.tickets = tickets;
        this.tiempos = tiempos;
        this.tecnicos = tecnicos;
        this.categorias = categorias;
        this.tendencias = tendencias;
    }

    // Clases internas
    public static class TicketMetrics {
        private Integer total;
        private Integer pendientes;
        private Integer enProceso;
        private Integer resueltos;
        private Integer cerrados;

        public TicketMetrics() {}

        public TicketMetrics(Integer total, Integer pendientes, Integer enProceso, 
                           Integer resueltos, Integer cerrados) {
            this.total = total;
            this.pendientes = pendientes;
            this.enProceso = enProceso;
            this.resueltos = resueltos;
            this.cerrados = cerrados;
        }

        // Getters y Setters
        public Integer getTotal() { return total; }
        public void setTotal(Integer total) { this.total = total; }
        public Integer getPendientes() { return pendientes; }
        public void setPendientes(Integer pendientes) { this.pendientes = pendientes; }
        public Integer getEnProceso() { return enProceso; }
        public void setEnProceso(Integer enProceso) { this.enProceso = enProceso; }
        public Integer getResueltos() { return resueltos; }
        public void setResueltos(Integer resueltos) { this.resueltos = resueltos; }
        public Integer getCerrados() { return cerrados; }
        public void setCerrados(Integer cerrados) { this.cerrados = cerrados; }
    }

    public static class TimeMetrics {
        private Double promedioAtencion;
        private Double promedioResolucion;
        private Double cumplimientoSLA;

        public TimeMetrics() {}

        public TimeMetrics(Double promedioAtencion, Double promedioResolucion, Double cumplimientoSLA) {
            this.promedioAtencion = promedioAtencion;
            this.promedioResolucion = promedioResolucion;
            this.cumplimientoSLA = cumplimientoSLA;
        }

        // Getters y Setters
        public Double getPromedioAtencion() { return promedioAtencion; }
        public void setPromedioAtencion(Double promedioAtencion) { this.promedioAtencion = promedioAtencion; }
        public Double getPromedioResolucion() { return promedioResolucion; }
        public void setPromedioResolucion(Double promedioResolucion) { this.promedioResolucion = promedioResolucion; }
        public Double getCumplimientoSLA() { return cumplimientoSLA; }
        public void setCumplimientoSLA(Double cumplimientoSLA) { this.cumplimientoSLA = cumplimientoSLA; }
    }

    public static class TechnicianMetrics {
        private Integer total;
        private Integer activos;
        private Double cargaPromedio;
        private String mejorRendimiento;

        public TechnicianMetrics() {}

        public TechnicianMetrics(Integer total, Integer activos, Double cargaPromedio, String mejorRendimiento) {
            this.total = total;
            this.activos = activos;
            this.cargaPromedio = cargaPromedio;
            this.mejorRendimiento = mejorRendimiento;
        }

        // Getters y Setters
        public Integer getTotal() { return total; }
        public void setTotal(Integer total) { this.total = total; }
        public Integer getActivos() { return activos; }
        public void setActivos(Integer activos) { this.activos = activos; }
        public Double getCargaPromedio() { return cargaPromedio; }
        public void setCargaPromedio(Double cargaPromedio) { this.cargaPromedio = cargaPromedio; }
        public String getMejorRendimiento() { return mejorRendimiento; }
        public void setMejorRendimiento(String mejorRendimiento) { this.mejorRendimiento = mejorRendimiento; }
    }

    public static class CategoryMetrics {
        private String nombre;
        private Integer cantidad;
        private Double porcentaje;

        public CategoryMetrics() {}

        public CategoryMetrics(String nombre, Integer cantidad, Double porcentaje) {
            this.nombre = nombre;
            this.cantidad = cantidad;
            this.porcentaje = porcentaje;
        }

        // Getters y Setters
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
        public Double getPorcentaje() { return porcentaje; }
        public void setPorcentaje(Double porcentaje) { this.porcentaje = porcentaje; }
    }

    public static class TrendMetrics {
        private String fecha;
        private Integer tickets;
        private Integer resueltos;

        public TrendMetrics() {}

        public TrendMetrics(String fecha, Integer tickets, Integer resueltos) {
            this.fecha = fecha;
            this.tickets = tickets;
            this.resueltos = resueltos;
        }

        // Getters y Setters
        public String getFecha() { return fecha; }
        public void setFecha(String fecha) { this.fecha = fecha; }
        public Integer getTickets() { return tickets; }
        public void setTickets(Integer tickets) { this.tickets = tickets; }
        public Integer getResueltos() { return resueltos; }
        public void setResueltos(Integer resueltos) { this.resueltos = resueltos; }
    }

    // Getters y Setters principales
    public TicketMetrics getTickets() { return tickets; }
    public void setTickets(TicketMetrics tickets) { this.tickets = tickets; }
    public TimeMetrics getTiempos() { return tiempos; }
    public void setTiempos(TimeMetrics tiempos) { this.tiempos = tiempos; }
    public TechnicianMetrics getTecnicos() { return tecnicos; }
    public void setTecnicos(TechnicianMetrics tecnicos) { this.tecnicos = tecnicos; }
    public List<CategoryMetrics> getCategorias() { return categorias; }
    public void setCategorias(List<CategoryMetrics> categorias) { this.categorias = categorias; }
    public List<TrendMetrics> getTendencias() { return tendencias; }
    public void setTendencias(List<TrendMetrics> tendencias) { this.tendencias = tendencias; }
}






