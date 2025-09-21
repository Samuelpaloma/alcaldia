package com.example.demo.admin.controller;

import com.example.demo.admin.service.AdminTecnicoService;
import com.example.demo.usuario.dto.request.CreateTecnicoRequest;
import com.example.demo.usuario.dto.response.UsuarioDTO;
import com.example.demo.admin.dto.response.EstadisticasTecnicosResponseDTO;
import com.example.demo.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tecnicos")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdminTecnicoController {
    
    private final AdminTecnicoService adminTecnicoService;
    
    /**
     * Crear técnico
     * POST /api/admin/tecnicos
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> crearTecnico(@Valid @RequestBody CreateTecnicoRequest request) {
        try {
            log.info("Creando técnico: {}", request.getEmail());
            UsuarioDTO tecnico = adminTecnicoService.crearTecnico(request);
            return ResponseEntity.ok(tecnico);
        } catch (Exception e) {
            log.error("Error creando técnico", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al crear técnico: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener todos los técnicos
     * GET /api/admin/tecnicos
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> obtenerTodosLosTecnicos() {
        try {
            log.info("Obteniendo todos los técnicos");
            List<UsuarioDTO> tecnicos = adminTecnicoService.obtenerTodosLosTecnicos();
            return ResponseEntity.ok(tecnicos);
        } catch (Exception e) {
            log.error("Error obteniendo técnicos", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener técnicos: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener técnico por ID
     * GET /api/admin/tecnicos/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> obtenerTecnicoPorId(@PathVariable Long id) {
        try {
            log.info("Obteniendo técnico por ID: {}", id);
            UsuarioDTO tecnico = adminTecnicoService.obtenerTecnicoPorId(id);
            return ResponseEntity.ok(tecnico);
        } catch (Exception e) {
            log.error("Error obteniendo técnico", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener técnico: " + e.getMessage())
            );
        }
    }
    
    /**
     * Activar/desactivar técnico
     * PUT /api/admin/tecnicos/{id}/toggle-estado
     */
    @PutMapping("/{id}/toggle-estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> toggleEstadoTecnico(@PathVariable Long id) {
        try {
            log.info("Cambiando estado del técnico: {}", id);
            UsuarioDTO tecnico = adminTecnicoService.toggleEstadoTecnico(id);
            return ResponseEntity.ok(tecnico);
        } catch (Exception e) {
            log.error("Error cambiando estado del técnico", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al cambiar estado del técnico: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener estadísticas de técnicos
     * GET /api/admin/tecnicos/estadisticas
     */
    @GetMapping("/estadisticas")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> obtenerEstadisticasTecnicos() {
        try {
            log.info("Obteniendo estadísticas de técnicos");
            EstadisticasTecnicosResponseDTO estadisticas = adminTecnicoService.obtenerEstadisticasTecnicos();
            return ResponseEntity.ok(estadisticas);
        } catch (Exception e) {
            log.error("Error obteniendo estadísticas de técnicos", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener estadísticas: " + e.getMessage())
            );
        }
    }
}
