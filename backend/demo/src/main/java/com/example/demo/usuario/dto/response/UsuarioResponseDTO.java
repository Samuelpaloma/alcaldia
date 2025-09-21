package com.example.demo.usuario.dto.response;

import com.example.demo.usuario.model.TipoUsuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {
    
    private Long idUsuario;
    private String email;
    private String nombre;
    private String apellido;
    private String telefono;
    private TipoUsuario tipoUsuario;
    private Boolean activo;
    private Boolean emailVerificado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    
    // Método de utilidad
    public String getNombreCompleto() {
        return nombre + " " + apellido;
    }
}


