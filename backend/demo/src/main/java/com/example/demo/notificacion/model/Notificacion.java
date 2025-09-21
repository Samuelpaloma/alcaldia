package com.example.demo.notificacion.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titulo;
    
    @Column(columnDefinition = "TEXT")
    private String mensaje;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoNotificacion tipo;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoNotificacion estado = EstadoNotificacion.NO_LEIDA;
    
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    
    @Column(name = "ticket_id")
    private Long ticketId;
    
    @Column(name = "fecha_creacion")
    @CreationTimestamp
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_lectura")
    private LocalDateTime fechaLectura;
    
    @Column(name = "fecha_actualizacion")
    @UpdateTimestamp
    private LocalDateTime fechaActualizacion;
    
    // Enums
    public enum TipoNotificacion {
        TICKET_CREADO,
        TICKET_ASIGNADO,
        TICKET_ACTUALIZADO,
        TICKET_RESUELTO,
        TICKET_CERRADO,
        USUARIO_CREADO,
        USUARIO_ACTUALIZADO,
        SISTEMA_ALERTA,
        SISTEMA_MANTENIMIENTO
    }
    
    public enum EstadoNotificacion {
        NO_LEIDA,
        LEIDA,
        ARCHIVADA
    }
}
