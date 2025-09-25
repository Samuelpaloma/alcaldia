package com.example.demo.automation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReglaAutomatizacionRequestDTO {
    
    @NotBlank(message = "El nombre de la regla es obligatorio")
    private String nombre;
    
    private String descripcion;
    
    @NotNull(message = "La condición es obligatoria")
    private String condicion;
    
    @NotNull(message = "La acción es obligatoria")
    private String accion;
    
    private Integer prioridad;
    
    private Boolean activa;

    // Constructores
    public ReglaAutomatizacionRequestDTO() {}

    public ReglaAutomatizacionRequestDTO(String nombre, String descripcion, String condicion, 
                                       String accion, Integer prioridad, Boolean activa) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.condicion = condicion;
        this.accion = accion;
        this.prioridad = prioridad;
        this.activa = activa;
    }

    // Getters y Setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public String getCondicion() { return condicion; }
    public void setCondicion(String condicion) { this.condicion = condicion; }
    
    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }
    
    public Integer getPrioridad() { return prioridad; }
    public void setPrioridad(Integer prioridad) { this.prioridad = prioridad; }
    
    public Boolean getActiva() { return activa; }
    public void setActiva(Boolean activa) { this.activa = activa; }
}






