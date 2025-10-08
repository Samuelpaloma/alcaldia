package com.example.demo.superadmin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemaRequestDTO {
    
    @NotBlank(message = "El tema es obligatorio")
    @Pattern(regexp = "^(claro|oscuro)$", 
             message = "El tema debe ser 'claro' o 'oscuro'")
    private String tema;
}
