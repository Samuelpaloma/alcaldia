package com.example.demo.asignacion.model;

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
    
    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;
    
    @Column(name = "tecnico_id")
    private Long tecnicoId;
    
    @Column(name = "usuario_que_asigna_id", nullable = false)
    private Long usuarioQueAsignaId;
    
    @Column(name = "email_usuario")
    private String emailUsuario;
    
    @Column(name = "tipo_operacion", nullable = false)
    private String tipoOperacion;
    
    @Column(name = "tipo_accion")
    private String tipoAccion;
    
    @Column(name = "estado_anterior")
    private String estadoAnterior;
    
    @Column(name = "estado_nuevo")
    private String estadoNuevo;
    
    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario;
    
    @CreationTimestamp
    @Column(name = "fecha_operacion", nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaOperacion;
    
    // Campos de compatibilidad (para mantener funcionalidad existente)
    @Transient
    private LocalDateTime fechaAccion;
}
