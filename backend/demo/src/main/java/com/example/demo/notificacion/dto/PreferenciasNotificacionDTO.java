package com.example.demo.notificacion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreferenciasNotificacionDTO {
    
    private Long id;
    private Long usuarioId;
    private Boolean pushActivo = true;
    private Boolean emailActivo = false;
    private Boolean notificacionesTicketAsignado = true;
    private Boolean notificacionesTicketEnProceso = true;
    private Boolean notificacionesTicketResuelto = true;
    private Boolean notificacionesComentarios = true;
    private Boolean notificacionesEvidencias = true;
    private Boolean notificacionesSla = true;
    private Boolean notificacionesSistema = true;
    private String frecuenciaEmail = "inmediata";
}
