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
    
    @Column(nullable = false)
    private String tipo;
    
    @Column(nullable = false)
    private Boolean leida = false;
    
    @Column(name = "usuario_email", nullable = false)
    private String usuarioEmail;
    
    @Column(name = "creador_email")
    private String creadorEmail;
    
    @Column(name = "ticket_id")
    private Long ticketId;
    
    @Column(name = "fecha_creacion")
    @CreationTimestamp
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_leida")
    private LocalDateTime fechaLeida;
    
    @Column(name = "fecha_actualizacion")
    @UpdateTimestamp
    private LocalDateTime fechaActualizacion;
    
    // Constantes para tipos de notificación
    public static final String TIPO_TICKET_CREADO = "TICKET_CREADO";
    public static final String TIPO_TICKET_ASIGNADO = "TICKET_ASIGNADO";
    public static final String TIPO_TICKET_ACTUALIZADO = "TICKET_ACTUALIZADO";
    public static final String TIPO_TICKET_RESUELTO = "TICKET_RESUELTO";
    public static final String TIPO_TICKET_CERRADO = "TICKET_CERRADO";
    public static final String TIPO_USUARIO_CREADO = "USUARIO_CREADO";
    public static final String TIPO_USUARIO_ACTUALIZADO = "USUARIO_ACTUALIZADO";
    public static final String TIPO_SISTEMA_ALERTA = "SISTEMA_ALERTA";
    public static final String TIPO_SISTEMA_MANTENIMIENTO = "SISTEMA_MANTENIMIENTO";
}
