package com.example.demo.superadmin.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_configurations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionSistema {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_configuracion")
    private Long idConfiguracion;
    
    @Column(nullable = false, unique = true, length = 100)
    private String clave;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String valor;
    
    @Column(length = 500)
    private String descripcion;
    
    @Column(name = "categoria", length = 50)
    private String categoria; // "colores", "logo", "general"
    
    @Column(name = "es_activa")
    @Builder.Default
    private Boolean activa = true;
    
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
    
    public String getValorCompleto() {
        return clave + ": " + valor;
    }
}


