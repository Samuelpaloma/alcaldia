package com.example.demo.reports.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "configuracion_reportes_automaticos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionReporteAutomatico {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "tipo_reporte", nullable = false)
    private String tipoReporte; // MENSUAL, SATISFACCION, RENDIMIENTO, CATEGORIA
    
    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
    
    @Column(name = "dia_generacion", nullable = false)
    private Integer diaGeneracion; // Día del mes (1-31)
    
    @Column(name = "hora_generacion", nullable = false)
    private String horaGeneracion; // Formato HH:mm
    
    @Column(name = "ultima_generacion")
    private LocalDateTime ultimaGeneracion;
    
    @Column(name = "proxima_generacion")
    private LocalDateTime proximaGeneracion;
    
    @Column(name = "email_destinatarios", columnDefinition = "TEXT")
    private String emailDestinatarios; // JSON array de emails
    
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
    
    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @UpdateTimestamp
    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;
    
    // Método para calcular la próxima generación
    public void calcularProximaGeneracion() {
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime proxima = ahora.plusMonths(1)
                .withDayOfMonth(Math.min(diaGeneracion, ahora.plusMonths(1).toLocalDate().lengthOfMonth()))
                .withHour(Integer.parseInt(horaGeneracion.split(":")[0]))
                .withMinute(Integer.parseInt(horaGeneracion.split(":")[1]))
                .withSecond(0)
                .withNano(0);
        
        this.proximaGeneracion = proxima;
    }
}
