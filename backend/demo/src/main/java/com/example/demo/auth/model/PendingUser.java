package com.example.demo.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "pending_users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingUser {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(nullable = false)
    private String apellido;
    
    @Column(nullable = false)
    private String verificationCode;
    
    @Column(nullable = false)
    private LocalDateTime codeExpiration;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private boolean verified;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationType verificationType;
    
    public enum VerificationType {
        REGISTRATION,
        LOGIN,
        PASSWORD_RESET
    }
}
