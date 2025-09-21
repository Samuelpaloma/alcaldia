package com.example.demo.categoria.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "categorias")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Categoria {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Long idCategoria;
    
    @Column(nullable = false, length = 100, unique = true)
    private String nombre;
    
    @Column(length = 500)
    private String descripcion;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean activa = true;
    
    @Column(name = "color_hex", length = 7)
    private String colorHex; // Para UI: #FF5733
    
    @Column(name = "icono", length = 50)
    private String icono; // Para UI: "fa-tools", "fa-user", etc.
    
    @Column(name = "orden")
    @Builder.Default
    private Integer orden = 0; // Para ordenar en listas
    
    @CreationTimestamp
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    // Relación con tickets (opcional, para estadísticas)
    @OneToMany(mappedBy = "categoria", fetch = FetchType.LAZY)
    private List<com.example.demo.ticket.model.Ticket> tickets;
    
    // Métodos de utilidad
    public boolean isActiva() {
        return Boolean.TRUE.equals(activa);
    }
    
    public String getNombreCompleto() {
        return nombre + (descripcion != null ? " - " + descripcion : "");
    }
}
