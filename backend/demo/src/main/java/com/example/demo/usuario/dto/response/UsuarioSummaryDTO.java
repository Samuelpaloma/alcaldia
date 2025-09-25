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
public class UsuarioSummaryDTO {
    
    private Long id;
    private String nombreCompleto;
    private String email;
    private String tipoUsuario;
    private Boolean activo;
    private LocalDateTime ultimoAcceso;
    
    // Para selects/combos en frontend
    private String label;    // nombre + email
    private String value;    // id como string
        // Constructor requerido por JPQL
        public UsuarioSummaryDTO(Long id, String nombreCompleto, String email, com.example.demo.usuario.model.TipoUsuario tipoUsuario, Boolean activo, LocalDateTime ultimoAcceso, String label, String value) {
            this.id = id;
            this.nombreCompleto = nombreCompleto;
            this.email = email;
            this.tipoUsuario = tipoUsuario != null ? tipoUsuario.name() : null;
            this.activo = activo;
            this.ultimoAcceso = ultimoAcceso;
            this.label = label;
            this.value = value;
        }
}