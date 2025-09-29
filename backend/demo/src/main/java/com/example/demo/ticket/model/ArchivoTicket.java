package com.example.demo.ticket.model;

import com.example.demo.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "archivos_ticket")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchivoTicket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo;
    
    @Column(name = "nombre_original", nullable = false)
    private String nombreOriginal;
    
    @Column(name = "tipo_mime", nullable = false)
    private String tipoMime;
    
    @Column(name = "tamaño_archivo", nullable = false)
    private Long tamañoArchivo;
    
    @Column(name = "ruta_archivo", nullable = false)
    private String rutaArchivo;
    
    @Column(name = "extension", nullable = false)
    private String extension;
    
    @CreationTimestamp
    @Column(name = "fecha_subida", nullable = false, updatable = false)
    private LocalDateTime fechaSubida;
    
    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
    
    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario;
    
    // Métodos de utilidad
    public String getNombreCompleto() {
        return nombreOriginal + "." + extension;
    }
    
    public String getTamañoFormateado() {
        if (tamañoArchivo < 1024) {
            return tamañoArchivo + " B";
        } else if (tamañoArchivo < 1024 * 1024) {
            return String.format("%.1f KB", tamañoArchivo / 1024.0);
        } else {
            return String.format("%.1f MB", tamañoArchivo / (1024.0 * 1024.0));
        }
    }
    
    public boolean esImagen() {
        return tipoMime != null && tipoMime.startsWith("image/");
    }
    
    public boolean esPDF() {
        return "application/pdf".equals(tipoMime);
    }
    
    public boolean esVideo() {
        return tipoMime != null && tipoMime.startsWith("video/");
    }
}
