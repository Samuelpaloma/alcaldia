package com.example.demo.evidencia.controller;

import com.example.demo.evidencia.dto.EvidenciaMovilDTO;
import com.example.demo.evidencia.model.Evidencia;
import com.example.demo.evidencia.service.EvidenciaService;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
     * Obtener evidencias de un ticket para móvil
     * GET /api/evidencias/movil/ticket/{ticketId}
     */
    @GetMapping("/movil/ticket/{ticketId}")
    public ResponseEntity<?> obtenerEvidenciasPorTicketMovil(@PathVariable Long ticketId) {
        System.out.println("📱 [EVIDENCIA] ===== OBTENIENDO EVIDENCIAS MÓVIL =====");
        System.out.println("📱 [EVIDENCIA] Ticket ID: " + ticketId);
        
        try {
            List<EvidenciaMovilDTO> evidencias = evidenciaService.obtenerEvidenciasPorTicketMovil(ticketId);
            System.out.println("📱 [EVIDENCIA] Evidencias encontradas: " + evidencias.size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Evidencias obtenidas exitosamente");
            response.put("data", evidencias);
            
            System.out.println("✅ [EVIDENCIA] ===== EVIDENCIAS MÓVIL ENVIADAS =====");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ [EVIDENCIA] Error obteniendo evidencias móviles: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al obtener evidencias: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Endpoint de prueba para verificar FormData
     * POST /api/evidencias/test
     */
    @PostMapping("/test")
    public ResponseEntity<?> testFormData(
            @RequestParam(required = false) Long ticketId,
            @RequestParam(required = false) String descripcion,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo,
            Authentication authentication) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test endpoint funcionando");
            response.put("ticketId", ticketId);
            response.put("descripcion", descripcion);
            response.put("archivo", archivo != null ? archivo.getOriginalFilename() : "null");
            response.put("archivoSize", archivo != null ? archivo.getSize() : 0);
            response.put("authentication", authentication != null ? "presente" : "null");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error en test endpoint", e);
            return ResponseEntity.status(500).body(
                ApiResponse.error("Error en test: " + e.getMessage())
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
            log.info("🔍 [EVIDENCIA] ===== INICIANDO SUBIDA DE EVIDENCIA =====");
            log.info("🔍 [EVIDENCIA] Ticket ID: {}", ticketId);
            log.info("🔍 [EVIDENCIA] Descripción: {}", descripcion);
            log.info("🔍 [EVIDENCIA] Archivo: {} ({} bytes)", archivo.getOriginalFilename(), archivo.getSize());
            log.info("🔍 [EVIDENCIA] Content Type: {}", archivo.getContentType());
            log.info("🔍 [EVIDENCIA] Authentication: {}", authentication != null ? "Presente" : "Null");
            
            if (authentication == null || authentication.getPrincipal() == null) {
                log.error("❌ [EVIDENCIA] No hay autenticación válida para subir evidencia");
                return ResponseEntity.status(401).body(
                    ApiResponse.error("Token de autenticación requerido")
                );
            }
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            
            log.info("🔍 [EVIDENCIA] Usuario autenticado: {}", emailUsuario);
            log.info("🔍 [EVIDENCIA] Llamando a evidenciaService.subirEvidencia...");
            
            Evidencia evidencia = evidenciaService.subirEvidencia(ticketId, archivo, descripcion, emailUsuario);
            
            log.info("✅ [EVIDENCIA] Evidencia guardada exitosamente con ID: {}", evidencia.getIdEvidencia());
            return ResponseEntity.ok(evidencia);
        } catch (Exception e) {
            log.error("❌ [EVIDENCIA] Error subiendo evidencia", e);
            e.printStackTrace();
            return ResponseEntity.status(500).body(
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
            
            // Verificar si es un archivo adjunto del ticket
            if (evidenciaService.esArchivoAdjunto(ticketId, nombreArchivo)) {
                log.info("Descargando archivo adjunto del ticket: {}", nombreArchivo);
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombreArchivo + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body("Archivo adjunto: " + nombreArchivo);
            } else {
                // Es una evidencia normal
                Evidencia evidencia = evidenciaService.obtenerEvidenciaParaDescarga(ticketId, nombreArchivo);
                
                // En una implementación real, aquí cargarías el archivo del sistema de archivos
                // Por ahora retornamos información de la evidencia
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + evidencia.getNombreCompletoArchivo() + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(evidencia);
            }
        } catch (Exception e) {
            log.error("Error descargando evidencia", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al descargar evidencia: " + e.getMessage())
            );
        }
    }
}


