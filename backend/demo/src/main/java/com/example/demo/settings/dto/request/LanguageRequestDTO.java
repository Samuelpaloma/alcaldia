package com.example.demo.settings.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class LanguageRequestDTO {
    
    @NotBlank(message = "El idioma es obligatorio")
    @Pattern(regexp = "^(es|en)$", message = "El idioma debe ser 'es' o 'en'")
    private String language;

    // Constructores
    public LanguageRequestDTO() {}

    public LanguageRequestDTO(String language) {
        this.language = language;
    }

    // Getters y Setters
    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}






