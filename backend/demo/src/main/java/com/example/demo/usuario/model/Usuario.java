package com.example.demo.usuario.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
        private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "password", nullable = false)
    private String password;
    
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;
    
    @Column(name = "location", length = 200)
    private String location;
    
    @Column(name = "department", length = 100)
    private String department;
    
    @Column(name = "position", length = 100)
    private String position;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false)
    private TipoUsuario userType;
    
    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @Column(name = "require_2fa")
    @Builder.Default
    private Boolean require2fa = false;
    
    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;
    
    @Column(name = "temporary_password", nullable = false)
    @Builder.Default
    private Boolean temporaryPassword = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Usuario createdBy;
    
    @Column(name = "last_access")
    private LocalDateTime lastAccess;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "device_token")
    private String deviceToken; // Token for push notifications
    
    @Column(name = "preferred_theme", length = 10, columnDefinition = "VARCHAR(10) DEFAULT 'light'")
    private String preferredTheme = "light"; // Preferred theme: 'light' or 'dark'
    
    // Tickets where the user is the assigned technician
        @OneToMany(mappedBy = "assignedTechnician")
        private java.util.List<com.example.demo.ticket.model.Ticket> assignedTickets;

        // Tickets created by the user
        @OneToMany(mappedBy = "creator")
        private java.util.List<com.example.demo.ticket.model.Ticket> createdTickets;
    // Utility methods
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    public boolean isTecnico() {
        return TipoUsuario.TECNICO.equals(userType);
    }
    
    public boolean isAdmin() {
        return TipoUsuario.ADMINISTRADOR.equals(userType);
    }
    
    public boolean isSuperAdmin() {
        return TipoUsuario.SUPERADMIN.equals(userType);
    }
    
    public boolean isFuncionario() {
        return TipoUsuario.FUNCIONARIO.equals(userType);
    }
    
    // Getter methods for service compatibility
    public boolean isActivo() {
        return active != null && active;
    }
    
    public boolean isEmailVerificado() {
        return emailVerified != null && emailVerified;
    }
}
