package com.example.demo.ticket.controller;

import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import com.example.demo.ticket.dto.request.SubirArchivoRequestDTO;
import com.example.demo.ticket.service.ArchivoConversacionSimpleService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/archivos-conversacion")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ArchivoConversacionSimpleController {
    
    private final ArchivoConversacionSimpleService archivoService;
    
    /**
     * Subir archivo a la conversación del ticket
     * POST /api/archivos-conversacion/subir
     */
    @PostMapping("/subir")
    public ResponseEntity<?> subirArchivo(
            @Valid @RequestBody SubirArchivoRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Subiendo archivo al ticket {}", request.getTicketId());
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            
            String nombreArchivo = archivoService.subirArchivoConversacion(
                request.getTicketId(),
                request.getNombreArchivo(),
                request.getTipoMime(),
                request.getTamañoArchivo(),
                request.getExtension(),
                request.getContenidoArchivo(),
                request.getComentario(),
                emailUsuario
            );
            
            return ResponseEntity.ok(ApiResponse.success("Archivo subido exitosamente", nombreArchivo));
        } catch (Exception e) {
            log.error("Error subiendo archivo", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al subir archivo: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener información del archivo del ticket
     * GET /api/archivos-conversacion/ticket/{ticketId}
     */
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<?> obtenerArchivoInfo(@PathVariable Long ticketId) {
        try {
            log.info("Obteniendo información del archivo del ticket {}", ticketId);
            
            String nombreArchivo = archivoService.obtenerInfoArchivo(ticketId);
            
            if (nombreArchivo == null) {
                return ResponseEntity.ok(ApiResponse.success("No hay archivo adjunto", null));
            }
            
            return ResponseEntity.ok(ApiResponse.success("Archivo encontrado", nombreArchivo));
        } catch (Exception e) {
            log.error("Error obteniendo archivo del ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener archivo: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener información completa del archivo
     * GET /api/archivos-conversacion/info/{ticketId}
     */
    @GetMapping("/info/{ticketId}")
    public ResponseEntity<?> obtenerInfoCompletaArchivo(@PathVariable Long ticketId) {
        try {
            log.info("Obteniendo información completa del archivo del ticket {}", ticketId);
            
            Map<String, Object> infoArchivo = archivoService.obtenerInfoCompletaArchivo(ticketId);
            
            if (infoArchivo == null) {
                return ResponseEntity.ok(ApiResponse.success("No hay archivo adjunto", null));
            }
            
            return ResponseEntity.ok(ApiResponse.success("Información del archivo", infoArchivo));
        } catch (Exception e) {
            log.error("Error obteniendo información del archivo", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener información del archivo: " + e.getMessage())
            );
        }
    }
    
    /**
     * Descargar archivo
     * GET /api/archivos-conversacion/descargar/{ticketId}
     */
    @GetMapping("/descargar/{ticketId}")
    public ResponseEntity<?> descargarArchivo(@PathVariable Long ticketId) {
        try {
            log.info("Descargando archivo del ticket {}", ticketId);
            
            byte[] contenido = archivoService.descargarArchivo(ticketId);
            Map<String, Object> infoArchivo = archivoService.obtenerInfoCompletaArchivo(ticketId);
            
            if (infoArchivo == null) {
                throw new RuntimeException("No hay archivo adjunto");
            }
            
            // Determinar el tipo de contenido
            String extension = (String) infoArchivo.get("extension");
            MediaType mediaType = determinarMediaType(extension);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(mediaType);
            headers.setContentDispositionFormData("attachment", (String) infoArchivo.get("nombreArchivo"));
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
     * GET /api/archivos-conversacion/preview/{ticketId}
     */
    @GetMapping("/preview/{ticketId}")
    public ResponseEntity<?> previsualizarArchivo(@PathVariable Long ticketId) {
        try {
            log.info("Previsualizando archivo del ticket {}", ticketId);
            
            Map<String, Object> infoArchivo = archivoService.obtenerInfoCompletaArchivo(ticketId);
            
            if (infoArchivo == null) {
                throw new RuntimeException("No hay archivo adjunto");
            }
            
            Boolean esImagen = (Boolean) infoArchivo.get("esImagen");
            Boolean esPDF = (Boolean) infoArchivo.get("esPDF");
            
            // Solo permitir previsualización de imágenes y PDFs
            if (!esImagen && !esPDF) {
                return ResponseEntity.badRequest().body(
                    ApiResponse.error("Este tipo de archivo no se puede previsualizar")
                );
            }
            
            byte[] contenido = archivoService.descargarArchivo(ticketId);
            
            // Determinar el tipo de contenido
            String extension = (String) infoArchivo.get("extension");
            MediaType mediaType = determinarMediaType(extension);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(mediaType);
            headers.setContentDispositionFormData("inline", (String) infoArchivo.get("nombreArchivo"));
            headers.setContentLength(contenido.length);
            
            return new ResponseEntity<>(contenido, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error previsualizando archivo", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al previsualizar archivo: " + e.getMessage())
            );
        }
    }
    
    /**
     * Obtener información de tipos de archivo permitidos
     * GET /api/archivos-conversacion/tipos-permitidos
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
            case "bmp":
                return MediaType.valueOf("image/bmp");
            case "webp":
                return MediaType.valueOf("image/webp");
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
