package com.example.demo.usuario.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
    
    private Long id;
    private String email;
    private String nombre;
    private String apellido;
    private String nombreCompleto;
    private String telefono;
    private String ubicacion;
    private String departamento;
    private String cargo;
    private String tipoUsuario;        // String legible para frontend
    private Boolean activo;
    private Boolean require2fa;
    private String creadoPorNombre;    // Nombre de quien lo creó
    private LocalDateTime ultimoAcceso;
    private LocalDateTime fechaCreacion;
    
    // Campos específicos para técnicos
    private String nivelTecnico;       // BAJO, MEDIO, ALTO
    private String areaEspecializacion;
    private String observaciones;
    
    // Campos calculados para el frontend
    private String estadoTexto;        // "Activo" / "Inactivo"
    private String tiempoSinAcceso;    // "Hace 2 días"
    private Boolean puedeEditar;       // Según permisos del usuario actual
    private Boolean puedeEliminar;     // Según permisos del usuario actual
}