package com.example.demo.ticket.controller;

import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import com.example.demo.ticket.dto.request.SubirArchivoRequestDTO;
import com.example.demo.ticket.dto.response.ArchivoTicketResponseDTO;
import com.example.demo.ticket.service.ArchivoTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/archivos-ticket")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ArchivoTicketController {
    
    private final ArchivoTicketService archivoService;
    
    /**
     * Subir archivo a un ticket
     * POST /api/archivos-ticket/subir
     */
    @PostMapping("/subir")
    public ResponseEntity<?> subirArchivo(
            @Valid @RequestBody SubirArchivoRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Subiendo archivo al ticket {}", request.getTicketId());
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            
            ArchivoTicketResponseDTO archivo = archivoService.subirArchivo(
                request.getTicketId(), 
                request.getNombreArchivo(), 
                request.getTipoMime(), 
                request.getTamañoArchivo(), 
                request.getExtension(), 
                request.getContenidoArchivo(), 
                request.getComentario(), 
                emailUsuario
            );
            
            return ResponseEntity.ok(archivo);
        } catch (Exception e) {
            log.error("Error subiendo archivo", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al subir archivo: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener archivos de un ticket
     * GET /api/archivos-ticket/ticket/{ticketId}
     */
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<?> obtenerArchivosPorTicket(@PathVariable Long ticketId) {
        try {
            log.info("Obteniendo archivos del ticket {}", ticketId);
            
            List<ArchivoTicketResponseDTO> archivos = archivoService.obtenerArchivosPorTicket(ticketId);
            
            return ResponseEntity.ok(archivos);
        } catch (Exception e) {
            log.error("Error obteniendo archivos del ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener archivos: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener información de un archivo específico
     * GET /api/archivos-ticket/{ticketId}/{archivoId}
     */
    @GetMapping("/{ticketId}/{archivoId}")
    public ResponseEntity<?> obtenerArchivo(@PathVariable Long ticketId, @PathVariable Long archivoId) {
        try {
            log.info("Obteniendo archivo {} del ticket {}", archivoId, ticketId);
            
            ArchivoTicketResponseDTO archivo = archivoService.obtenerArchivo(ticketId, archivoId);
            
            return ResponseEntity.ok(archivo);
        } catch (Exception e) {
            log.error("Error obteniendo archivo", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener archivo: " + e.getMessage())
            );
        }
    }
    
    /**
     * Descargar archivo
     * GET /api/archivos-ticket/descargar/{ticketId}/{archivoId}
     */
    @GetMapping("/descargar/{ticketId}/{archivoId}")
    public ResponseEntity<?> descargarArchivo(@PathVariable Long ticketId, @PathVariable Long archivoId) {
        try {
            log.info("Descargando archivo {} del ticket {}", archivoId, ticketId);
            
            byte[] contenido = archivoService.descargarArchivo(ticketId, archivoId);
            
            // Obtener información del archivo para el nombre
            ArchivoTicketResponseDTO archivoInfo = archivoService.obtenerArchivo(ticketId, archivoId);
            
            // Determinar el tipo de contenido
            MediaType mediaType = determinarMediaType(archivoInfo.getExtension());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(mediaType);
            headers.setContentDispositionFormData("attachment", archivoInfo.getNombreCompleto());
            headers.setContentLength(contenido.length);
            
            return new ResponseEntity<>(contenido, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error descargando archivo", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al descargar archivo: " + e.getMessage())
            );
        }
    }
    
    /**
     * Previsualizar archivo (para imágenes y PDFs)
     * GET /api/archivos-ticket/preview/{ticketId}/{archivoId}
     */
    @GetMapping("/preview/{ticketId}/{archivoId}")
    public ResponseEntity<?> previsualizarArchivo(@PathVariable Long ticketId, @PathVariable Long archivoId) {
        try {
            log.info("🔍 [DEBUG] Previsualizando archivo {} del ticket {}", archivoId, ticketId);
            
            ArchivoTicketResponseDTO archivoInfo = archivoService.obtenerArchivo(ticketId, archivoId);
            log.info("🔍 [DEBUG] Archivo encontrado: {}", archivoInfo.getNombreCompleto());
            
            // Solo permitir previsualización de imágenes y PDFs
            if (!archivoInfo.isEsImagen() && !archivoInfo.isEsPDF()) {
                log.warn("⚠️ [DEBUG] Tipo de archivo no permitido para previsualización: {}", archivoInfo.getTipoMime());
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Este tipo de archivo no se puede previsualizar")
                );
            }
            
            log.info("🔍 [DEBUG] Descargando contenido del archivo...");
            byte[] contenido = archivoService.descargarArchivo(ticketId, archivoId);
            log.info("✅ [DEBUG] Contenido descargado: {} bytes", contenido.length);
            
            // Determinar el tipo de contenido
            MediaType mediaType = determinarMediaType(archivoInfo.getExtension());
            log.info("🔍 [DEBUG] MediaType determinado: {}", mediaType);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(mediaType);
            headers.setContentDispositionFormData("inline", archivoInfo.getNombreCompleto());
            headers.setContentLength(contenido.length);
            
            log.info("✅ [DEBUG] Enviando respuesta de previsualización");
            return new ResponseEntity<>(contenido, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("❌ [DEBUG] Error previsualizando archivo", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al previsualizar archivo: " + e.getMessage())
            );
        }
    }
    
    /**
     * Eliminar archivo
     * DELETE /api/archivos-ticket/{ticketId}/{archivoId}
     */
    @DeleteMapping("/{ticketId}/{archivoId}")
    public ResponseEntity<?> eliminarArchivo(
            @PathVariable Long ticketId,
            @PathVariable Long archivoId,
            Authentication authentication) {
        try {
            log.info("Eliminando archivo {} del ticket {}", archivoId, ticketId);
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            
            archivoService.eliminarArchivo(ticketId, archivoId, emailUsuario);
            
            return ResponseEntity.ok(ApiResponse.success("Archivo eliminado exitosamente"));
        } catch (Exception e) {
            log.error("Error eliminando archivo", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al eliminar archivo: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener información de tipos de archivo permitidos
     * GET /api/archivos-ticket/tipos-permitidos
     */
    @GetMapping("/tipos-permitidos")
    public ResponseEntity<?> obtenerTiposPermitidos() {
        try {
            return ResponseEntity.ok(ApiResponse.success("Tipos de archivo permitidos", 
                List.of(
                    "Imágenes: JPG, JPEG, PNG, GIF, BMP, WEBP (previsualización disponible)",
                    "Documentos: PDF (previsualización disponible), DOC, DOCX, TXT, RTF",
                    "Hojas de cálculo: XLS, XLSX",
                    "Presentaciones: PPT, PPTX",
                    "Archivos comprimidos: ZIP, RAR, 7Z",
                    "Videos: MP4, AVI, MOV, WMV",
                    "Audio: MP3, WAV, OGG",
                    "Tamaño máximo: 10MB"
                )));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener tipos permitidos: " + e.getMessage())
            );
        }
    }
    
    /**
     * Determinar el tipo de contenido basado en la extensión
     */
    private MediaType determinarMediaType(String extension) {
        switch (extension.toLowerCase()) {
            case "jpg":
            case "jpeg":
                return MediaType.IMAGE_JPEG;
            case "png":
                return MediaType.IMAGE_PNG;
            case "gif":
                return MediaType.IMAGE_GIF;
            case "pdf":
                return MediaType.APPLICATION_PDF;
            case "txt":
                return MediaType.TEXT_PLAIN;
            case "mp4":
                return MediaType.valueOf("video/mp4");
            case "mp3":
                return MediaType.valueOf("audio/mpeg");
            default:
                return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
