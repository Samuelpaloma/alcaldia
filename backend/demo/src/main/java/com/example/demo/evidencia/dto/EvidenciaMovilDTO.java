package com.example.demo.evidencia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenciaMovilDTO {
    
    private Long idEvidencia;
    private Long ticketId;
    private String tipoEvidencia;
    private String descripcion;
    private String nombreArchivo;
    private String extensionArchivo;
    private Long tamanioArchivo;
    private String tamanioFormateado;
    private String urlArchivo;
    private LocalDateTime fechaSubida;
    private String subidoPorNombre;
    private String subidoPorEmail;
    
    // Métodos de utilidad
    public String getNombreCompletoArchivo() {
        return nombreArchivo + (extensionArchivo != null && !extensionArchivo.isEmpty() ? "." + extensionArchivo : "");
    }
    
    public boolean isImagen() {
        return "IMAGEN".equals(tipoEvidencia);
    }
    
    public boolean isVideo() {
        return "VIDEO".equals(tipoEvidencia);
    }
    
    public boolean isDocumento() {
        return "DOCUMENTO".equals(tipoEvidencia);
    }
    
    public boolean isAudio() {
        return "AUDIO".equals(tipoEvidencia);
    }
}
