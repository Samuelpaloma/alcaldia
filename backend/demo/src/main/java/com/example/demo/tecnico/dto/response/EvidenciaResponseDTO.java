package com.example.demo.tecnico.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenciaResponseDTO {
    
    private Long idEvidencia;
    private Long ticketId;
    private String tipoEvidencia;
    private String descripcion;
    private String nombreArchivo;
    private String extensionArchivo;
    private Long tamanioArchivo;
    private String urlArchivo;
    private LocalDateTime fechaSubida;
    private String subidoPor;
}


