package com.example.demo.automation.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reglas_automatizacion")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReglaAutomatizacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_regla")
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String nombre;
    
    @Column(length = 500)
    private String descripcion;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String condicion;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String accion;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer prioridad = 1;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean activa = true;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer ejecuciones = 0;
    
    @Column(name = "ultima_ejecucion")
    private LocalDateTime ultimaEjecucion;
    
    @Column(name = "creado_por", length = 100)
    private String creadoPor;
    
    @CreationTimestamp
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    // Métodos de utilidad
    public boolean isActiva() {
        return Boolean.TRUE.equals(activa);
    }
    
    public void incrementarEjecuciones() {
        this.ejecuciones = (this.ejecuciones != null ? this.ejecuciones : 0) + 1;
        this.ultimaEjecucion = LocalDateTime.now();
    }
    
    public String getPrioridadTexto() {
        if (prioridad == null) return "Baja";
        return switch (prioridad) {
            case 1 -> "Baja";
            case 2 -> "Media";
            case 3 -> "Alta";
            case 4 -> "Crítica";
            default -> "Baja";
        };
    }
}
