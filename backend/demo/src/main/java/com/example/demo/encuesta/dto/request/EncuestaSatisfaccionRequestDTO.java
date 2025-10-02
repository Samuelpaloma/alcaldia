package com.example.demo.encuesta.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EncuestaSatisfaccionRequestDTO {
    
    @NotNull(message = "El ID del ticket es obligatorio")
    private Long ticketId;
    
    @NotNull(message = "La calificación es obligatoria")
    @Min(value = 1, message = "La calificación mínima es 1")
    @Max(value = 5, message = "La calificación máxima es 5")
    private Integer calificacion;
    
    private String comentario;
    
    private List<String> aspectosPositivos;
    
    private List<String> aspectosNegativos;
}