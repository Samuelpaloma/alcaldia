package com.example.demo.usuario.DTO.request;

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
    private String area;          // Para técnicos
    private String nivel;         // Para técnicos
    private String observaciones; // Para técnicos
}