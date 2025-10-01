package com.example.demo.usuario.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUsuarioRequest {
    
    // Campos opcionales - solo se actualizan si se envían
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    private String nombre;
    
    @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres")
    private String apellido;
    
    private Boolean require2fa;
    
    // Solo para admins editando otros usuarios
    private Boolean activo;
    
    // Campos adicionales según tipo
    private String area;          // Para técnicos
    private String nivel;         // Para técnicos
    private String observaciones; // Para técnicos
    
    // Campos de perfil personal
    private String ubicacion;     // Ubicación del usuario
    private String departamento;  // Departamento del usuario
    private String cargo;         // Cargo del usuario
}