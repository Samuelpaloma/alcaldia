package com.example.demo.reports.model;

import com.example.demo.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reportes_usuario")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteUsuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @Column(name = "titulo", nullable = false)
    private String titulo;
    
    @Column(name = "subtitulo")
    private String subtitulo;
    
    @Column(name = "tipo_periodo", nullable = false)
    private String tipoPeriodo; // daily, weekly, monthly, yearly
    
    @Column(name = "valor_periodo")
    private String valorPeriodo; // fecha, mes, año específico
    
    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo;
    
    @Column(name = "datos_reporte", columnDefinition = "TEXT")
    private String datosReporte; // JSON con los datos del reporte
    
    @Column(name = "estadisticas", columnDefinition = "TEXT")
    private String estadisticas; // JSON con las estadísticas
    
    @Column(name = "categorias_top", columnDefinition = "TEXT")
    private String categoriasTop; // JSON con las categorías top
    
    @Column(name = "tecnicos_top", columnDefinition = "TEXT")
    private String tecnicosTop; // JSON con los técnicos top
    
    @CreationTimestamp
    @Column(name = "fecha_generacion", nullable = false, updatable = false)
    private LocalDateTime fechaGeneracion;
    
    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
    
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
}
