package com.example.demo.auth.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    
    @NotBlank(message = "El email es requerido")
    @Email(message = "El email debe tener un formato válido")
    private String email;
    
    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", 
             message = "La contraseña debe tener al menos una mayúscula, una minúscula y un número")
    private String password;
    
    @NotBlank(message = "La confirmación de contraseña es requerida")
    private String confirmPassword;
    
    @NotBlank(message = "El nombre es requerido")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    private String nombre;
    
    @NotBlank(message = "El apellido es requerido")
    @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres")
    private String apellido;
    
    @Pattern(regexp = "^[0-9+\\-\\s()]*$", message = "El teléfono debe contener solo números y caracteres permitidos")
    private String telefono;
    
    // Validación personalizada
    @AssertTrue(message = "Las contraseñas no coinciden")
    public boolean isPasswordMatching() {
        return password != null && password.equals(confirmPassword);
    }
}