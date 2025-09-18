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
@Table(name = "usuarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
        private Long idUsuario;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(nullable = false, length = 100)
    private String apellido;
    
    @Column(length = 20)
    private String telefono;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_usuario", nullable = false)
    private TipoUsuario tipoUsuario;
    
    @Column(nullable = false)
    private Boolean activo = true;
    
    @Column(name = "require_2fa")
    private Boolean require2fa = false;
    
    @Column(name = "email_verificado", nullable = false)
    private Boolean emailVerificado = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por")
    private Usuario creadoPor;
    
    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;
    
    @CreationTimestamp
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
        // Tickets donde el usuario es el técnico asignado
        @OneToMany(mappedBy = "tecnicoAsignado")
        private java.util.List<com.example.demo.ticket.model.Ticket> ticketsAsignados;

        // Tickets creados por el usuario
        @OneToMany(mappedBy = "creador")
        private java.util.List<com.example.demo.ticket.model.Ticket> ticketsCreados;
    // Métodos de utilidad
    public String getNombreCompleto() {
        return nombre + " " + apellido;
    }
    
    public boolean isTecnico() {
        return TipoUsuario.TECNICO.equals(tipoUsuario);
    }
    
    public boolean isAdmin() {
        return TipoUsuario.ADMINISTRADOR.equals(tipoUsuario);
    }
    
    public boolean isSuperAdmin() {
        return TipoUsuario.SUPERADMIN.equals(tipoUsuario);
    }
    
    public boolean isFuncionario() {
        return TipoUsuario.FUNCIONARIO.equals(tipoUsuario);
    }
}