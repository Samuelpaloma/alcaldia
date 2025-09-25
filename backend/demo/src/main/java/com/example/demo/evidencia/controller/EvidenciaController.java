package com.example.demo.evidencia.controller;

import com.example.demo.evidencia.model.Evidencia;
import com.example.demo.evidencia.service.EvidenciaService;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/evidencias")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class EvidenciaController {
    
    private final EvidenciaService evidenciaService;
    
    /**
     * Obtener evidencias de un ticket
     * GET /api/evidencias/ticket/{ticketId}
     */
    @GetMapping("/ticket/{ticketId}")
    // @PreAuthorize("hasAnyRole('TECNICO', 'ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> obtenerEvidenciasPorTicket(@PathVariable Long ticketId) {
        try {
            log.info("Obteniendo evidencias del ticket {}", ticketId);
            List<Evidencia> evidencias = evidenciaService.obtenerEvidenciasPorTicket(ticketId);
            return ResponseEntity.ok(evidencias);
        } catch (Exception e) {
            log.error("Error obteniendo evidencias", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener evidencias: " + e.getMessage())
            );
        }
    }
    
    /**
     * Subir evidencia a un ticket
     * POST /api/evidencias/subir
     */
    @PostMapping("/subir")
    // @PreAuthorize("hasAnyRole('TECNICO', 'ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> subirEvidencia(
            @RequestParam Long ticketId,
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam String descripcion,
            Authentication authentication) {
        try {
            log.info("Subiendo evidencia al ticket {}", ticketId);
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            
            Evidencia evidencia = evidenciaService.subirEvidencia(ticketId, archivo, descripcion, emailUsuario);
            
            return ResponseEntity.ok(evidencia);
        } catch (Exception e) {
            log.error("Error subiendo evidencia", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al subir evidencia: " + e.getMessage())
            );
        }
    }
    
    /**
     * Descargar evidencia
     * GET /api/evidencias/descargar/{ticketId}/{nombreArchivo}
     */
    @GetMapping("/descargar/{ticketId}/{nombreArchivo}")
    // @PreAuthorize("hasAnyRole('TECNICO', 'ADMINISTRADOR', 'SUPERADMIN')") // Temporalmente deshabilitado
    public ResponseEntity<?> descargarEvidencia(
            @PathVariable Long ticketId,
            @PathVariable String nombreArchivo) {
        try {
            log.info("Descargando evidencia {} del ticket {}", nombreArchivo, ticketId);
            
            Evidencia evidencia = evidenciaService.obtenerEvidenciaParaDescarga(ticketId, nombreArchivo);
            
            // En una implementación real, aquí cargarías el archivo del sistema de archivos
            // Por ahora retornamos información de la evidencia
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + evidencia.getNombreCompletoArchivo() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(evidencia);
        } catch (Exception e) {
            log.error("Error descargando evidencia", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al descargar evidencia: " + e.getMessage())
            );
        }
    }
}


