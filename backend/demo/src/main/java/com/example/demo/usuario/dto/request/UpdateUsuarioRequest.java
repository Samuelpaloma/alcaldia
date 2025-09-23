package com.example.demo.usuario.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUsuarioRequest {
    
    @NotBlank(message = "El nombre es requerido")
    @Size(min = 2, max = 50)
    private String nombre;
    
    @NotBlank(message = "El apellido es requerido")
    @Size(min = 2, max = 50)
    private String apellido;
    
    @Pattern(regexp = "^[0-9+\\-\\s()]*$")
    private String telefono;
    
    private Boolean require2fa;
    
    // Solo para admins editando otros usuarios
    private Boolean activo;
    
    // Campos adicionales según tipo
    private String areaEspecializacion;  // Para técnicos
    private String nivelTecnico;         // Para técnicos
    private String observaciones;        // Para técnicos
    
    // Campos de perfil personal
    private String ubicacion;     // Ubicación del usuario
    private String departamento;  // Departamento del usuario
    private String cargo;         // Cargo del usuario
}