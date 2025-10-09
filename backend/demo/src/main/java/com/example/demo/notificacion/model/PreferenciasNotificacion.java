package com.example.demo.notificacion.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "preferencias_notificacion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreferenciasNotificacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;
    
    @Column(name = "push_activo", nullable = false)
    private Boolean pushActivo = true; // Siempre activo por defecto
    
    @Column(name = "email_activo", nullable = false)
    private Boolean emailActivo = false; // Por defecto desactivado
    
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
    
    @Column(name = "frecuencia_email")
    private String frecuenciaEmail = "inmediata";
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private java.time.LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
        updatedAt = java.time.LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}