package com.example.demo.notificacion.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreferenciasNotificacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "usuario_id", nullable = false, unique = true)
    private Long usuarioId;
    
    @Column(name = "push_activo", nullable = false)
    private Boolean pushActivo = true;
    
    @Column(name = "email_activo", nullable = false)
    private Boolean emailActivo = false;
    
    @Column(name = "notificaciones_ticket_asignado", nullable = false)
    private Boolean notificacionesTicketAsignado = true;
    
    @Column(name = "notificaciones_ticket_en_proceso", nullable = false)
    private Boolean notificacionesTicketEnProceso = true;
    
    @Column(name = "notificaciones_ticket_resuelto", nullable = false)
    private Boolean notificacionesTicketResuelto = true;
    
    @Column(name = "notificaciones_comentarios", nullable = false)
    private Boolean notificacionesComentarios = true;
    
    @Column(name = "notificaciones_evidencias", nullable = false)
    private Boolean notificacionesEvidencias = true;
    
    @Column(name = "notificaciones_sla", nullable = false)
    private Boolean notificacionesSla = true;
    
    @Column(name = "notificaciones_sistema", nullable = false)
    private Boolean notificacionesSistema = true;
    
    @Column(name = "frecuencia_email", nullable = false)
    private String frecuenciaEmail = "inmediata";
    
    @Column(name = "fecha_creacion")
    @CreationTimestamp
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    @UpdateTimestamp
    private LocalDateTime fechaActualizacion;
}
