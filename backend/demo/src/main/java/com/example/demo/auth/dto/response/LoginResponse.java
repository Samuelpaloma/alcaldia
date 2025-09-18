package com.example.demo.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    
    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long expiresIn; // Segundos hasta expiración
    
    // Información del usuario
    private Long userId;
    private String nombre;
    private String apellido;
    private String email;
    private String tipoUsuario; // String legible para frontend
    private Boolean require2fa;
    
    // Para redirección del frontend
    private String redirectUrl;
}