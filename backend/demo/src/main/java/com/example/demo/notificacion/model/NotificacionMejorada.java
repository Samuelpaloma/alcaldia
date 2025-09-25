package com.example.demo.notificacion.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones_mejoradas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionMejorada {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "tipo", nullable = false)
    private String tipo; // ticket_creado, ticket_asignado, ticket_resuelto, etc.
    
    @Column(name = "mensaje", nullable = false, length = 1000)
    private String mensaje; // Mensaje personalizado según el rol
    
    @Column(name = "destinatarios", nullable = false, length = 2000)
    private String destinatarios; // JSON array de destinatarios
    
    @Column(name = "ticket_id")
    private Long ticketId;
    
    @Column(name = "usuario_actor_id")
    private Long usuarioActorId; // Quien realizó la acción
    
    @Column(name = "usuario_actor_email")
    private String usuarioActorEmail;
    
    @Column(name = "usuario_actor_nombre")
    private String usuarioActorNombre;
    
    @Column(name = "prioridad")
    private String prioridad = "normal"; // normal, alta, critica
    
    @Column(name = "leida")
    private Boolean leida = false;
    
    @Column(name = "fecha_creacion")
    @CreationTimestamp
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_lectura")
    private LocalDateTime fechaLectura;
    
    // Tipos de notificación
    public static final String TIPO_TICKET_CREADO = "ticket_creado";
    public static final String TIPO_TICKET_ASIGNADO = "ticket_asignado";
    public static final String TIPO_TICKET_EN_PROCESO = "ticket_en_proceso";
    public static final String TIPO_TICKET_RESUELTO = "ticket_resuelto";
    public static final String TIPO_TICKET_CERRADO = "ticket_cerrado";
    public static final String TIPO_TICKET_ESCALADO = "ticket_escalado";
    public static final String TIPO_COMENTARIO_AGREGADO = "comentario_agregado";
    public static final String TIPO_EVIDENCIA_AGREGADA = "evidencia_agregada";
    public static final String TIPO_SLA_VENCIDO = "sla_vencido";
    public static final String TIPO_ALERTA_SISTEMA = "alerta_sistema";
    
    // Prioridades
    public static final String PRIORIDAD_NORMAL = "normal";
    public static final String PRIORIDAD_ALTA = "alta";
    public static final String PRIORIDAD_CRITICA = "critica";
    
    // Roles
    public static final String ROL_FUNCIONARIO = "funcionario";
    public static final String ROL_TECNICO = "tecnico";
    public static final String ROL_ADMINISTRADOR = "administrador";
    public static final String ROL_SUPER_ADMIN = "super_admin";
}
