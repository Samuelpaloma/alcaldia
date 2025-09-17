package com.example.demo.auth.model;

import com.example.demo.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_verification_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 6)
    private String token;  // Código de 6 dígitos
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @Column(nullable = false)
    private LocalDateTime fechaExpiracion;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean usado = false;
    
    @CreationTimestamp
    private LocalDateTime fechaCreacion;
    
    // Método de utilidad para verificar si expiró
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(fechaExpiracion);
    }
    
    // Método para verificar si es válido
    public boolean isValid() {
        return !usado && !isExpired();
    }
}
