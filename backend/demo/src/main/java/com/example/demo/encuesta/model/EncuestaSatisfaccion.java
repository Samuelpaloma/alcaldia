package com.example.demo.encuesta.model;

import com.example.demo.ticket.model.Ticket;
import com.example.demo.usuario.model.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "encuestas_satisfaccion")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EncuestaSatisfaccion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @Column(name = "calificacion", nullable = false)
    @Min(1)
    @Max(5)
    private Integer calificacion;
    
    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario;
    
    @Column(name = "aspectos_positivos", columnDefinition = "TEXT")
    private String aspectosPositivos; // JSON string
    
    @Column(name = "aspectos_negativos", columnDefinition = "TEXT")
    private String aspectosNegativos; // JSON string
    
    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
    
    // Método de conveniencia para obtener el nivel de satisfacción
    public String getNivelSatisfaccion() {
        if (calificacion >= 5) return "Excelente";
        if (calificacion >= 4) return "Bueno";
        if (calificacion >= 3) return "Regular";
        if (calificacion >= 2) return "Malo";
        return "Terrible";
    }
}
