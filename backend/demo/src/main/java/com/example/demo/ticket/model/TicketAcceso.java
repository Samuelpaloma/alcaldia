package com.example.demo.ticket.model;

import com.example.demo.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_accesos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketAcceso {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_id", nullable = false)
    private Usuario tecnico;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoAcceso tipoAcceso;
    
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;
    
    @CreationTimestamp
    @Column(name = "fecha_asignacion", nullable = false, updatable = false)
    private LocalDateTime fechaAsignacion;
    
    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;
    
    @Column(name = "motivo_cierre", length = 500)
    private String motivoCierre;
    
    public enum TipoAcceso {
        ASIGNADO,    // Técnico asignado inicialmente
        ESCALADO,    // Técnico al que se escaló el ticket
        CERRADO      // Técnico que perdió acceso por escalación
    }
}
