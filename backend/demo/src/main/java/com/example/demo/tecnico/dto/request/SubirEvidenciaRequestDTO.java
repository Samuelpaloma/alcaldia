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
public class SubirEvidenciaRequestDTO {
    
    @NotNull(message = "El ID del ticket es obligatorio")
    private Long ticketId;
    
    @NotBlank(message = "El tipo de evidencia es obligatorio")
    private String tipoEvidencia; // IMAGEN, DOCUMENTO, VIDEO, AUDIO
    
    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;
    
    private String archivoBase64; // Archivo en base64
    private String nombreArchivo;
    private String extensionArchivo;
    private Long tamanioArchivo; // En bytes
}


