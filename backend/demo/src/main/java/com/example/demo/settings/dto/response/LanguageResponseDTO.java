package com.example.demo.settings.dto.response;

import java.time.LocalDateTime;

public class LanguageResponseDTO {
    
    private String language;
    private String languageName;
    private String languageCode;
    private LocalDateTime lastUpdated;
    private String updatedBy;

    // Constructores
    public LanguageResponseDTO() {}

    public LanguageResponseDTO(String language, String languageName, String languageCode, 
                              LocalDateTime lastUpdated, String updatedBy) {
        this.language = language;
        this.languageName = languageName;
        this.languageCode = languageCode;
        this.lastUpdated = lastUpdated;
        this.updatedBy = updatedBy;
    }

    // Getters y Setters
    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getLanguageName() {
        return languageName;
    }

    public void setLanguageName(String languageName) {
        this.languageName = languageName;
    }

    public String getLanguageCode() {
        return languageCode;
    }

    public void setLanguageCode(String languageCode) {
        this.languageCode = languageCode;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}






