package com.example.demo.asignacion.model;

import com.example.demo.ticket.model.Ticket;
import com.example.demo.usuario.model.Usuario;
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
    private Long idAsignacion;
    
    @ManyToOne
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;
    
    @ManyToOne
    @JoinColumn(name = "tecnico_id")
    private Usuario tecnico;
    
    @ManyToOne
    @JoinColumn(name = "asignado_por_id")
    private Usuario asignadoPor;
    
    @Column(name = "estado_anterior", length = 50)
    private String estadoAnterior;
    
    @Column(name = "estado_nuevo", length = 50)
    private String estadoNuevo;
    
    @Column(name = "prioridad", length = 20)
    private String prioridad;
    
    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario;
    
    @CreationTimestamp
    @Column(name = "fecha_asignacion")
    private LocalDateTime fechaAsignacion;
    
    // Métodos de utilidad
    public String getResumenAsignacion() {
        return String.format("Ticket #%d asignado a %s", 
            ticket != null ? ticket.getId() : 0, 
            tecnico != null ? tecnico.getNombreCompleto() : "N/A");
    }
}


