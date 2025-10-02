package com.example.demo.ticket.service;

import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ArchivoConversacionSimpleService {
    
    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;
    
    // Configuración de archivos
    private static final String UPLOAD_DIR = "uploads/conversacion/";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_EXTENSIONS = List.of(
        "jpg", "jpeg", "png", "gif", "bmp", "webp", // Imágenes
        "pdf", // PDF
        "doc", "docx", // Word
        "xls", "xlsx", // Excel
        "ppt", "pptx", // PowerPoint
        "txt", "rtf", // Texto
        "zip", "rar", "7z", // Comprimidos
        "mp4", "avi", "mov", "wmv", // Videos
        "mp3", "wav", "ogg" // Audio
    );
    
    /**
     * Subir archivo a la conversación del ticket (usando campos existentes)
     * Nota: Este sistema mantiene solo un archivo por ticket, pero permite reemplazarlo
     */
    public String subirArchivoConversacion(Long ticketId, String nombreArchivo, String tipoMime, 
                                         Long tamañoArchivo, String extension, String contenidoBase64, 
                                         String comentario, String emailUsuario) {
        log.info("Subiendo archivo al ticket {} por usuario {}", ticketId, emailUsuario);
        
        // Validaciones
        validarArchivo(tamañoArchivo, extension);
        
        // Buscar ticket
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // Verificar que el usuario existe (sin almacenar la variable)
        usuarioRepository.findByEmail(emailUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Generar nombre único para el archivo
        String nombreArchivoUnico = generarNombreUnico(nombreArchivo, extension);
        
        // Guardar archivo físicamente
        String rutaArchivo = guardarArchivoFisico(contenidoBase64, nombreArchivoUnico);
        
        // Actualizar ticket con el nuevo archivo (esto sobrescribe el anterior)
        ticket.setAttachedFile(rutaArchivo);
        ticket.setFileName(nombreArchivoUnico);
        ticket.setUpdatedAt(LocalDateTime.now());
        
        ticketRepository.save(ticket);
        
        log.info("Archivo subido exitosamente: {}", nombreArchivoUnico);
        
        return nombreArchivoUnico;
    }
    
    /**
     * Obtener archivo del ticket
     */
    @Transactional(readOnly = true)
    public byte[] descargarArchivo(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        if (ticket.getAttachedFile() == null || ticket.getFileName() == null) {
            throw new RuntimeException("No hay archivo adjunto en este ticket");
        }
        
        try {
            Path path = Paths.get(ticket.getAttachedFile());
            return Files.readAllBytes(path);
        } catch (IOException e) {
            log.error("Error descargando archivo: {}", e.getMessage());
            throw new RuntimeException("Error al descargar el archivo");
        }
    }
    
    /**
     * Obtener información del archivo del ticket
     */
    @Transactional(readOnly = true)
    public String obtenerInfoArchivo(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        if (ticket.getAttachedFile() == null || ticket.getFileName() == null) {
            return null;
        }
        
        return ticket.getFileName();
    }
    
    /**
     * Obtener información completa del archivo del ticket
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerInfoCompletaArchivo(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        if (ticket.getAttachedFile() == null || ticket.getFileName() == null) {
            return null;
        }
        
        // Determinar el tipo MIME basado en la extensión
        String extension = ticket.getFileName().substring(ticket.getFileName().lastIndexOf('.') + 1).toLowerCase();
        String tipoMime = determinarTipoMime(extension);
        
        // Obtener el tamaño del archivo
        long tamañoArchivo = 0;
        try {
            Path path = Paths.get(ticket.getAttachedFile());
            if (Files.exists(path)) {
                tamañoArchivo = Files.size(path);
            }
        } catch (IOException e) {
            log.warn("No se pudo obtener el tamaño del archivo: {}", e.getMessage());
        }
        
        Map<String, Object> infoArchivo = new HashMap<>();
        infoArchivo.put("nombreArchivo", ticket.getFileName());
        infoArchivo.put("rutaArchivo", ticket.getAttachedFile());
        infoArchivo.put("extension", extension);
        infoArchivo.put("tipoMime", tipoMime);
        infoArchivo.put("tamañoArchivo", tamañoArchivo);
        infoArchivo.put("esImagen", tipoMime.startsWith("image/"));
        infoArchivo.put("esPDF", tipoMime.equals("application/pdf"));
        infoArchivo.put("esVideo", tipoMime.startsWith("video/"));
        
        return infoArchivo;
    }
    
    /**
     * Determinar el tipo MIME basado en la extensión
     */
    private String determinarTipoMime(String extension) {
        switch (extension.toLowerCase()) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "bmp":
                return "image/bmp";
            case "webp":
                return "image/webp";
            case "pdf":
                return "application/pdf";
            case "doc":
                return "application/msword";
            case "docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls":
                return "application/vnd.ms-excel";
            case "xlsx":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "ppt":
                return "application/vnd.ms-powerpoint";
            case "pptx":
                return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "txt":
                return "text/plain";
            case "rtf":
                return "text/rtf";
            case "zip":
                return "application/zip";
            case "rar":
                return "application/x-rar-compressed";
            case "7z":
                return "application/x-7z-compressed";
            case "mp4":
                return "video/mp4";
            case "avi":
                return "video/x-msvideo";
            case "mov":
                return "video/quicktime";
            case "wmv":
                return "video/x-ms-wmv";
            case "mp3":
                return "audio/mpeg";
            case "wav":
                return "audio/wav";
            case "ogg":
                return "audio/ogg";
            default:
                return "application/octet-stream";
        }
    }
    
    /**
     * Validar archivo
     */
    private void validarArchivo(Long tamañoArchivo, String extension) {
        // Validar tamaño
        if (tamañoArchivo > MAX_FILE_SIZE) {
            throw new RuntimeException("El archivo no puede ser mayor a 10MB");
        }
        
        // Validar extensión
        String ext = extension.toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new RuntimeException("Tipo de archivo no permitido. Extensiones permitidas: " + String.join(", ", ALLOWED_EXTENSIONS));
        }
    }
    
    /**
     * Generar nombre único para el archivo
     */
    private String generarNombreUnico(String nombreOriginal, String extension) {
        String uuid = UUID.randomUUID().toString();
        return uuid + "_" + System.currentTimeMillis() + "." + extension;
    }
    
    /**
     * Guardar archivo físicamente en el servidor
     */
    private String guardarArchivoFisico(String contenidoBase64, String nombreArchivo) {
        try {
            // Crear directorio si no existe
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            // Decodificar Base64
            byte[] contenido = Base64.getDecoder().decode(contenidoBase64);
            
            // Crear archivo
            String rutaCompleta = UPLOAD_DIR + nombreArchivo;
            File archivo = new File(rutaCompleta);
            
            // Escribir archivo
            try (FileOutputStream fos = new FileOutputStream(archivo)) {
                fos.write(contenido);
            }
            
            return rutaCompleta;
        } catch (IOException e) {
            log.error("Error guardando archivo: {}", e.getMessage());
            throw new RuntimeException("Error al guardar el archivo");
        }
    }
}
