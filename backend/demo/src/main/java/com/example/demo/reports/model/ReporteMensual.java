package com.example.demo.reports.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reportes_mensuales")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteMensual {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "tipo_reporte", nullable = false)
    private String tipoReporte; // MENSUAL, SATISFACCION, RENDIMIENTO, CATEGORIA
    
    @Column(name = "mes", nullable = false)
    private Integer mes;
    
    @Column(name = "año", nullable = false)
    private Integer año;
    
    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo;
    
    @Column(name = "ruta_archivo", nullable = false)
    private String rutaArchivo;
    
    @Column(name = "tamaño_archivo")
    private Long tamañoArchivo;
    
    @CreationTimestamp
    @Column(name = "fecha_generacion", nullable = false, updatable = false)
    private LocalDateTime fechaGeneracion;
    
    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
    
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
}
