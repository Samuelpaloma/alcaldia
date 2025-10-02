package com.example.demo.usuario.model;

import lombok.Getter;

@Getter
public enum TipoUsuario {
    FUNCIONARIO("Funcionario"),
    TECNICO("Técnico"),
    ADMINISTRADOR("Administrador"),
    SUPERADMIN("Super Administrador");
    
    private final String descripcion;
    
    TipoUsuario(String descripcion) {
        this.descripcion = descripcion;
    }
    
    // Método para obtener por descripción
    public static TipoUsuario fromDescripcion(String descripcion) {
        for (TipoUsuario tipo : values()) {
            if (tipo.descripcion.equals(descripcion)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Tipo de usuario no válido: " + descripcion);
    }
}
