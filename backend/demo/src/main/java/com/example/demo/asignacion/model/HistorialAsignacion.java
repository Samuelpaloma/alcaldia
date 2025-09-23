package com.example.demo.asignacion.model;

import com.example.demo.ticket.model.Ticket;
import com.example.demo.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_asignaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistorialAsignacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_id")
    private Usuario tecnico;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_que_asigna_id", nullable = false)
    private Usuario usuarioQueAsigna;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoOperacion tipoOperacion;
    
    @Column(name = "estado_anterior")
    private String estadoAnterior;
    
    @Column(name = "estado_nuevo")
    private String estadoNuevo;
    
    @Column(name = "comentario", length = 1000)
    private String comentario;
    
    @CreationTimestamp
    @Column(name = "fecha_operacion", nullable = false, updatable = false)
    private LocalDateTime fechaOperacion;
    
    public enum TipoOperacion {
        ASIGNAR, REASIGNAR, ESCALAR, DESASIGNAR, REABRIR
    }
}
