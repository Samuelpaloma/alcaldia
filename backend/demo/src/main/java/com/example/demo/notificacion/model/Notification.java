package com.example.demo.notificacion.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "type", nullable = false)
    private String type; // ticket_created, ticket_assigned, ticket_resolved, etc.
    
    @Column(name = "message", nullable = false, length = 1000)
    private String message; // Custom message based on role
    
    @Column(name = "recipients", nullable = false, length = 2000)
    private String recipients; // JSON array of recipients
    
    @Column(name = "ticket_id")
    private Long ticketId;
    
    @Column(name = "actor_user_id")
    private Long actorUserId; // Who performed the action
    
    @Column(name = "actor_user_email")
    private String actorUserEmail;
    
    @Column(name = "actor_user_name")
    private String actorUserName;
    
    @Column(name = "priority")
    private String priority = "normal"; // normal, high, critical
    
    @Column(name = "is_read")
    private Boolean read = false;
    
    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    // Notification types
    public static final String TYPE_TICKET_CREATED = "ticket_created";
    public static final String TYPE_TICKET_ASSIGNED = "ticket_assigned";
    public static final String TYPE_TICKET_IN_PROGRESS = "ticket_in_progress";
    public static final String TYPE_TICKET_RESOLVED = "ticket_resolved";
    public static final String TYPE_TICKET_CLOSED = "ticket_closed";
    public static final String TYPE_TICKET_ESCALATED = "ticket_escalated";
    public static final String TYPE_COMMENT_ADDED = "comment_added";
    public static final String TYPE_EVIDENCE_ADDED = "evidence_added";
    public static final String TYPE_SLA_EXPIRED = "sla_expired";
    public static final String TYPE_SYSTEM_ALERT = "system_alert";
    
    // Priorities
    public static final String PRIORITY_NORMAL = "normal";
    public static final String PRIORITY_HIGH = "high";
    public static final String PRIORITY_CRITICAL = "critical";
    
    // Roles
    public static final String ROLE_EMPLOYEE = "employee";
    public static final String ROLE_TECHNICIAN = "technician";
    public static final String ROLE_ADMINISTRATOR = "administrator";
    public static final String ROLE_SUPER_ADMIN = "super_admin";
}
