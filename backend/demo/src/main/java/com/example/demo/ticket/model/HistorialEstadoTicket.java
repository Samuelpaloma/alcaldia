package com.example.demo.ticket.model;

import com.example.demo.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_status_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistorialEstadoTicket {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Long idHistorial;
    
    @ManyToOne
    @JoinColumn(name = "ticket_id")
    private Ticket ticket;
    
    @ManyToOne
    @JoinColumn(name = "cambiado_por_id")
    private Usuario cambiadoPor;
    
    @Column(name = "estado_anterior", length = 50)
    private String estadoAnterior;
    
    @Column(name = "estado_nuevo", length = 50)
    private String estadoNuevo;
    
    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario;
    
    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;
    
    @CreationTimestamp
    @Column(name = "fecha_cambio")
    private LocalDateTime fechaCambio;
    
    @Column(name = "tipo_usuario", length = 20)
    private String tipoUsuario; // TECNICO, ADMINISTRADOR, SUPERADMIN
    
    // Métodos de utilidad
    public String getResumenCambio() {
        return String.format("Estado cambiado de '%s' a '%s'", 
            estadoAnterior != null ? estadoAnterior : "N/A", 
            estadoNuevo);
    }
    
    public String getTiempoTranscurrido() {
        if (fechaCambio == null) return "N/A";
        
        LocalDateTime ahora = LocalDateTime.now();
        long minutos = java.time.Duration.between(fechaCambio, ahora).toMinutes();
        
        if (minutos < 60) return minutos + " min";
        if (minutos < 1440) return (minutos / 60) + " h";
        return (minutos / 1440) + " días";
    }
}


