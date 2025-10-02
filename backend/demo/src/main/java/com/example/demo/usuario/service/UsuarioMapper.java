package com.example.demo.usuario.service;

import com.example.demo.usuario.dto.response.UsuarioDTO;
import com.example.demo.usuario.model.Usuario;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class UsuarioMapper {
    
    public UsuarioDTO toDTO(Usuario usuario) {
        if (usuario == null) {
            return null;
        }
        
        return UsuarioDTO.builder()
            .id(usuario.getId())
            .email(usuario.getEmail())
            .nombre(usuario.getFirstName())
            .apellido(usuario.getLastName())
            .nombreCompleto(usuario.getFullName())
            .ubicacion(usuario.getLocation())
            .departamento(usuario.getDepartment())
            .cargo(usuario.getPosition())
            .tipoUsuario(usuario.getUserType().getDescripcion())
            .activo(usuario.getActive())
            .require2fa(usuario.getRequire2fa())
            .creadoPorNombre(getCreadoPorNombre(usuario))
            .ultimoAcceso(usuario.getLastAccess())
            .fechaCreacion(usuario.getCreatedAt())
            .estadoTexto(usuario.getActive() ? "Activo" : "Inactivo")
            .tiempoSinAcceso(formatTiempoSinAcceso(usuario.getLastAccess()))
            .puedeEditar(true) // Se calculará en el servicio según permisos
            .puedeEliminar(true) // Se calculará en el servicio según permisos
            .build();
    }
    
    private String getCreadoPorNombre(Usuario usuario) {
        if (usuario.getCreatedBy() == null) {
            return "Auto-registro";
        }
        return usuario.getCreatedBy().getFullName();
    }
    
    private String formatTiempoSinAcceso(LocalDateTime ultimoAcceso) {
        if (ultimoAcceso == null) {
            return "Nunca";
        }
        
        LocalDateTime now = LocalDateTime.now();
        long days = ChronoUnit.DAYS.between(ultimoAcceso, now);
        long hours = ChronoUnit.HOURS.between(ultimoAcceso, now);
        long minutes = ChronoUnit.MINUTES.between(ultimoAcceso, now);
        
        if (days > 0) {
            return days == 1 ? "Hace 1 día" : "Hace " + days + " días";
        } else if (hours > 0) {
            return hours == 1 ? "Hace 1 hora" : "Hace " + hours + " horas";
        } else if (minutes > 0) {
            return minutes == 1 ? "Hace 1 minuto" : "Hace " + minutes + " minutos";
        } else {
            return "Ahora";
        }
    }
}
