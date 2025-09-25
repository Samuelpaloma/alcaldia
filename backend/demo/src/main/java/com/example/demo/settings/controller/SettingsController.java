package com.example.demo.settings.controller;

import com.example.demo.settings.dto.request.LanguageRequestDTO;
import com.example.demo.settings.dto.response.LanguageResponseDTO;
import com.example.demo.settings.service.SettingsService;
import com.example.demo.shared.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    /**
     * Cambiar idioma del sistema
     */
    @PostMapping("/language")
    public ResponseEntity<ApiResponse> cambiarIdioma(
            @RequestBody LanguageRequestDTO request,
            Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            LanguageResponseDTO response = settingsService.cambiarIdioma(request, emailUsuario);
            return ResponseEntity.ok(ApiResponse.success("Idioma cambiado exitosamente", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al cambiar idioma: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener idioma actual
     */
    @GetMapping("/language")
    public ResponseEntity<ApiResponse> obtenerIdiomaActual(Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            LanguageResponseDTO response = settingsService.obtenerIdiomaActual(emailUsuario);
            return ResponseEntity.ok(ApiResponse.success("Idioma actual obtenido", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener idioma: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener idiomas disponibles
     */
    @GetMapping("/languages")
    public ResponseEntity<ApiResponse> obtenerIdiomasDisponibles() {
        try {
            var idiomas = settingsService.obtenerIdiomasDisponibles();
            return ResponseEntity.ok(ApiResponse.success("Idiomas disponibles obtenidos", idiomas));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener idiomas: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener configuración del usuario
     */
    @GetMapping("/user-config")
    public ResponseEntity<ApiResponse> obtenerConfiguracionUsuario(Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            var config = settingsService.obtenerConfiguracionUsuario(emailUsuario);
            return ResponseEntity.ok(ApiResponse.success("Configuración obtenida", config));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener configuración: " + e.getMessage())
            );
        }
    }

    /**
     * Actualizar configuración del usuario
     */
    @PutMapping("/user-config")
    public ResponseEntity<ApiResponse> actualizarConfiguracionUsuario(
            @RequestBody Object configuracion,
            Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            settingsService.actualizarConfiguracionUsuario(emailUsuario, configuracion);
            return ResponseEntity.ok(ApiResponse.success("Configuración actualizada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al actualizar configuración: " + e.getMessage())
            );
        }
    }
}