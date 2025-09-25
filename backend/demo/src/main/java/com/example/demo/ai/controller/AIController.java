package com.example.demo.ai.controller;

import com.example.demo.ai.dto.response.ClasificacionIAResponseDTO;
import com.example.demo.ai.dto.response.SugerenciaIAResponseDTO;
import com.example.demo.ai.service.AIService;
import com.example.demo.shared.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    @Autowired
    private AIService aiService;

    /**
     * Clasificar ticket con IA
     */
    @PostMapping("/clasificar/{ticketId}")
    public ResponseEntity<ApiResponse> clasificarTicketConIA(@PathVariable Long ticketId) {
        try {
            ClasificacionIAResponseDTO clasificacion = aiService.clasificarTicket(ticketId);
            return ResponseEntity.ok(ApiResponse.success("Clasificación realizada exitosamente", clasificacion));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error en clasificación IA: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener sugerencias de IA para un ticket
     */
    @GetMapping("/sugerencias/{ticketId}")
    public ResponseEntity<ApiResponse> obtenerSugerenciasIA(@PathVariable Long ticketId) {
        try {
            SugerenciaIAResponseDTO sugerencias = aiService.obtenerSugerencias(ticketId);
            return ResponseEntity.ok(ApiResponse.success("Sugerencias obtenidas exitosamente", sugerencias));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener sugerencias: " + e.getMessage())
            );
        }
    }

    /**
     * Entrenar modelo de IA con nuevos datos
     */
    @PostMapping("/entrenar")
    public ResponseEntity<ApiResponse> entrenarModeloIA() {
        try {
            aiService.entrenarModelo();
            return ResponseEntity.ok(ApiResponse.success("Modelo entrenado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al entrenar modelo: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener estadísticas del modelo de IA
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<ApiResponse> obtenerEstadisticasIA() {
        try {
            var estadisticas = aiService.obtenerEstadisticasModelo();
            return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas exitosamente", estadisticas));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener estadísticas: " + e.getMessage())
            );
        }
    }
}






