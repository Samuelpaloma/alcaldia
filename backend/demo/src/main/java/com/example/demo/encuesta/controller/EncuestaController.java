package com.example.demo.encuesta.controller;

import com.example.demo.encuesta.dto.request.EncuestaSatisfaccionRequestDTO;
import com.example.demo.encuesta.dto.response.EncuestaSatisfaccionResponseDTO;
import com.example.demo.encuesta.service.EncuestaService;
import com.example.demo.shared.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/encuestas")
@CrossOrigin(origins = "*")
public class EncuestaController {

    @Autowired
    private EncuestaService encuestaService;

    /**
     * Enviar encuesta de satisfacción
     */
    @PostMapping("/satisfaccion")
    public ResponseEntity<ApiResponse> enviarEncuestaSatisfaccion(
            @RequestBody EncuestaSatisfaccionRequestDTO request,
            Authentication authentication) {
        try {
            String emailUsuario = authentication.getName();
            EncuestaSatisfaccionResponseDTO encuesta = encuestaService.enviarEncuestaSatisfaccion(request, emailUsuario);
            
            return ResponseEntity.ok(ApiResponse.success("Encuesta enviada exitosamente", encuesta));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al enviar encuesta: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener encuestas de un ticket
     */
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<ApiResponse> obtenerEncuestasPorTicket(@PathVariable Long ticketId) {
        try {
            List<EncuestaSatisfaccionResponseDTO> encuestas = encuestaService.obtenerEncuestasPorTicket(ticketId);
            return ResponseEntity.ok(ApiResponse.success("Encuestas obtenidas exitosamente", encuestas));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener encuestas: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener estadísticas de satisfacción
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<ApiResponse> obtenerEstadisticasSatisfaccion() {
        try {
            var estadisticas = encuestaService.obtenerEstadisticasSatisfaccion();
            return ResponseEntity.ok(ApiResponse.success("Estadísticas obtenidas exitosamente", estadisticas));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener estadísticas: " + e.getMessage())
            );
        }
    }
}






