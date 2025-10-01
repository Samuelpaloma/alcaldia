package com.example.demo.cliente.dto.request;

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
public class ResponderResolucionRequestDTO {
    
    @NotNull(message = "El ID del ticket es obligatorio")
    private Long ticketId;
    
    @NotBlank(message = "La acción es obligatoria")
    private String accion; // CONFIRMAR o RECHAZAR
    
    private String comentario; // Comentario opcional del cliente
}

