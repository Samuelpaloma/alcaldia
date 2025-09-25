package com.example.demo.settings.service;

import com.example.demo.settings.dto.request.LanguageRequestDTO;
import com.example.demo.settings.dto.response.LanguageResponseDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SettingsService {

    public LanguageResponseDTO cambiarIdioma(LanguageRequestDTO request, String emailUsuario) {
        // TODO: Implementar lógica de negocio
        return new LanguageResponseDTO(
            request.getLanguage(),
            request.getLanguage().equals("es") ? "Español" : "English",
            request.getLanguage(),
            LocalDateTime.now(),
            emailUsuario
        );
    }

    public LanguageResponseDTO obtenerIdiomaActual(String emailUsuario) {
        // TODO: Implementar lógica de negocio
        return new LanguageResponseDTO(
            "es",
            "Español",
            "es",
            LocalDateTime.now(),
            emailUsuario
        );
    }

    public Object obtenerIdiomasDisponibles() {
        // TODO: Implementar lógica de negocio
        return new Object();
    }

    public Object obtenerConfiguracionUsuario(String emailUsuario) {
        // TODO: Implementar lógica de negocio
        return new Object();
    }

    public void actualizarConfiguracionUsuario(String emailUsuario, Object configuracion) {
        // TODO: Implementar lógica de negocio
    }
}






