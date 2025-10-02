package com.example.demo.encuesta.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EncuestaSatisfaccionResponseDTO {
    
    private Long id;
    private Long ticketId;
    private String ticketAsunto;
    private Integer calificacion;
    private String comentario;
    private List<String> aspectosPositivos;
    private List<String> aspectosNegativos;
    private String nombreUsuario;
    private String emailUsuario;
    private LocalDateTime fechaCreacion;
    private String nivelSatisfaccion;

    // Método para calcular nivel de satisfacción
    public String getNivelSatisfaccion() {
        if (nivelSatisfaccion == null && calificacion != null) {
            return calcularNivelSatisfaccion(calificacion);
        }
        return nivelSatisfaccion;
    }

    private String calcularNivelSatisfaccion(Integer calificacion) {
        if (calificacion >= 5) return "Excelente";
        if (calificacion >= 4) return "Bueno";
        if (calificacion >= 3) return "Regular";
        if (calificacion >= 2) return "Malo";
        return "Terrible";
    }
}