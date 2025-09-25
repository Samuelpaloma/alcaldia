package com.example.demo.asignacion.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "asignaciones_tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionTicket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asignacion")
    private Long id;
    
    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;
    
    @Column(name = "tecnico_id", nullable = false)
    private Long tecnicoId;
    
    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario;
    
    @CreationTimestamp
    @Column(name = "fecha_asignacion")
    private LocalDateTime fechaAsignacion;
    
    @Column(name = "activa", nullable = false)
    @Builder.Default
    private Boolean activa = true;
}


