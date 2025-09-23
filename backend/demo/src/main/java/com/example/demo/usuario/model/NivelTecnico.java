package com.example.demo.usuario.model;

import lombok.Getter;

@Getter
public enum NivelTecnico {
    BAJO("Bajo", 1),
    MEDIO("Medio", 2),
    ALTO("Alto", 3);
    
    private final String descripcion;
    private final int prioridad; // Para comparaciones de escalamiento
    
    NivelTecnico(String descripcion, int prioridad) {
        this.descripcion = descripcion;
        this.prioridad = prioridad;
    }
    
    // Método para obtener por descripción
    public static NivelTecnico fromDescripcion(String descripcion) {
        for (NivelTecnico nivel : values()) {
            if (nivel.descripcion.equalsIgnoreCase(descripcion)) {
                return nivel;
            }
        }
        throw new IllegalArgumentException("Nivel de técnico no válido: " + descripcion);
    }
    
    // Método para comparar niveles
    public boolean esMayorQue(NivelTecnico otro) {
        return this.prioridad > otro.prioridad;
    }
    
    public boolean esMenorQue(NivelTecnico otro) {
        return this.prioridad < otro.prioridad;
    }
}
