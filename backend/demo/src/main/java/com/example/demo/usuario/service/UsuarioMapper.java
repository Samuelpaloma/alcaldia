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
            .id(usuario.getIdUsuario())
            .email(usuario.getEmail())
            .nombre(usuario.getNombre())
            .apellido(usuario.getApellido())
            .nombreCompleto(usuario.getNombreCompleto())
            .telefono(usuario.getTelefono())
            .ubicacion(usuario.getUbicacion())
            .departamento(usuario.getDepartamento())
            .cargo(usuario.getCargo())
            .tipoUsuario(usuario.getTipoUsuario().getDescripcion())
            .activo(usuario.getActivo())
            .require2fa(usuario.getRequire2fa())
            .creadoPorNombre(getCreadoPorNombre(usuario))
            .ultimoAcceso(usuario.getUltimoAcceso())
            .fechaCreacion(usuario.getFechaCreacion())
            .estadoTexto(usuario.getActivo() ? "Activo" : "Inactivo")
            .tiempoSinAcceso(formatTiempoSinAcceso(usuario.getUltimoAcceso()))
            .puedeEditar(true) // Se calculará en el servicio según permisos
            .puedeEliminar(true) // Se calculará en el servicio según permisos
            .build();
    }
    
    private String getCreadoPorNombre(Usuario usuario) {
        if (usuario.getCreadoPor() == null) {
            return "Auto-registro";
        }
        return usuario.getCreadoPor().getNombreCompleto();
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