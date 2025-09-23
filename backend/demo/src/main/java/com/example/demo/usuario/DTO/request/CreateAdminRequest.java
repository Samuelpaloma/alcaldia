package com.example.demo.usuario.DTO.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAdminRequest {
    
    @NotBlank(message = "El email es requerido")
    @Email(message = "El email debe tener un formato válido")
    private String email;
    
    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$")
    private String password;
    
    @NotBlank(message = "El nombre es requerido")
    @Size(min = 2, max = 50)
    private String nombre;
    
    @NotBlank(message = "El apellido es requerido")
    @Size(min = 2, max = 50)
    private String apellido;
    
    @Pattern(regexp = "^[0-9+\\-\\s()]*$")
    private String telefono;
    
    private Boolean require2fa = true; // Admins por defecto con 2FA
    
    // Permisos específicos del admin
    private Boolean puedeCrearTecnicos = true;
    private Boolean puedeVerReportes = true;
    private Boolean puedeGestionarTickets = true;
}