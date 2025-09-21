package com.example.demo.tecnico.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CambiarEstadoTicketRequestDTO {
    
    @NotNull(message = "El ID del ticket es obligatorio")
    private Long ticketId;
    
    @NotBlank(message = "El nuevo estado es obligatorio")
    private String nuevoEstado; // PENDIENTE, EN_EJECUCION, TERMINADO
    
    private String comentario; // Comentario del técnico
    private String observaciones; // Observaciones adicionales
}


