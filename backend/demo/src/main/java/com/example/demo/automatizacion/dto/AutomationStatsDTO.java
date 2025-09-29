package com.example.demo.automatizacion.dto;

public class AutomationStatsDTO {
    
    private long totalReglas;
    private long reglasActivas;
    private long totalEjecuciones;
    
    // Constructores
    public AutomationStatsDTO() {}
    
    public AutomationStatsDTO(long totalReglas, long reglasActivas, long totalEjecuciones) {
        this.totalReglas = totalReglas;
        this.reglasActivas = reglasActivas;
        this.totalEjecuciones = totalEjecuciones;
    }
    
    // Getters y Setters
    public long getTotalReglas() { return totalReglas; }
    public void setTotalReglas(long totalReglas) { this.totalReglas = totalReglas; }
    
    public long getReglasActivas() { return reglasActivas; }
    public void setReglasActivas(long reglasActivas) { this.reglasActivas = reglasActivas; }
    
    public long getTotalEjecuciones() { return totalEjecuciones; }
    public void setTotalEjecuciones(long totalEjecuciones) { this.totalEjecuciones = totalEjecuciones; }
}
