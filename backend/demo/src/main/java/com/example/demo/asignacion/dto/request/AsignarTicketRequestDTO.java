package com.example.demo.asignacion.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsignarTicketRequestDTO {
    
    @NotNull(message = "El ID del ticket es obligatorio")
    private Long ticketId;
    
    @NotNull(message = "El ID del técnico es obligatorio")
    private Long tecnicoId;
    
    private String comentario; // Comentario opcional para la asignación
    private String prioridad; // Cambiar prioridad al asignar
}


