package com.example.demo.usuario.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFuncionarioRequest {
    
    @NotBlank(message = "El email es requerido")
    @Email(message = "El email debe tener un formato válido")
    private String email;
    
    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", 
             message = "La contraseña debe tener al menos una mayúscula, una minúscula y un número")
    private String password;
    
    @NotBlank(message = "El nombre es requerido")
    @Size(min = 2, max = 50)
    private String nombre;
    
    @NotBlank(message = "El apellido es requerido")
    @Size(min = 2, max = 50)
    private String apellido;
    
    @Size(max = 100)
    private String ubicacion;
    
    @Size(max = 100)
    private String departamento;
    
    @Size(max = 100)
    private String cargo;
    
    private Boolean require2fa = false; // Funcionarios por defecto sin 2FA
}

