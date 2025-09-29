package com.example.demo.ticket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoTicketResponseDTO {
    
    private Long id;
    private Long ticketId;
    private String nombreArchivo;
    private String nombreOriginal;
    private String nombreCompleto;
    private String tipoMime;
    private String extension;
    private Long tamañoArchivo;
    private String tamañoFormateado;
    private String rutaArchivo;
    private LocalDateTime fechaSubida;
    private String subidoPor;
    private String subidoPorEmail;
    private String comentario;
    private boolean esImagen;
    private boolean esPDF;
    private boolean esVideo;
}
