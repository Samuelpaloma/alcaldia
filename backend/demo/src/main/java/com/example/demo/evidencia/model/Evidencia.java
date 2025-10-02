package com.example.demo.evidencia.model;

import com.example.demo.ticket.model.Ticket;
import com.example.demo.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "evidence")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Evidencia {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evidencia")
    private Long idEvidencia;
    
    @ManyToOne
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;
    
    @ManyToOne
    @JoinColumn(name = "subido_por_id")
    private Usuario subidoPor;
    
    @Column(name = "tipo_evidencia", nullable = false, length = 20)
    private String tipoEvidencia; // IMAGEN, DOCUMENTO, VIDEO, AUDIO
    
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo;
    
    @Column(name = "extension_archivo", length = 10)
    private String extensionArchivo;
    
    @Column(name = "tamanio_archivo")
    private Long tamanioArchivo;
    
    @Column(name = "url_archivo", columnDefinition = "TEXT")
    private String urlArchivo;
    
    @Column(name = "ruta_archivo", columnDefinition = "TEXT")
    private String rutaArchivo;
    
    @CreationTimestamp
    @Column(name = "fecha_subida")
    private LocalDateTime fechaSubida;
    
    @Column(name = "activa")
    @Builder.Default
    private Boolean activa = true;
    
    // Métodos de utilidad
    public String getTamanioFormateado() {
        if (tamanioArchivo == null) return "0 B";
        
        long bytes = tamanioArchivo;
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }
    
    public String getNombreCompletoArchivo() {
        return nombreArchivo + (extensionArchivo != null ? "." + extensionArchivo : "");
    }
}


