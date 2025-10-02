package com.example.demo.ticket.service;

import com.example.demo.ticket.dto.response.ArchivoTicketResponseDTO;
import com.example.demo.ticket.model.ArchivoTicket;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.ArchivoTicketRepository;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.model.Usuario;
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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ArchivoTicketService {
    
    private final ArchivoTicketRepository archivoRepository;
    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;
    
    // Configuración de archivos
    private static final String UPLOAD_DIR = "uploads/tickets/";
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
     * Subir archivo a un ticket
     */
    public ArchivoTicketResponseDTO subirArchivo(Long ticketId, String nombreArchivo, String tipoMime, 
                                               Long tamañoArchivo, String extension, String contenidoBase64, 
                                               String comentario, String emailUsuario) {
        log.info("Subiendo archivo al ticket {} por usuario {}", ticketId, emailUsuario);
        
        // Validaciones
        validarArchivo(tamañoArchivo, extension);
        
        // Buscar ticket
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // Buscar usuario
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Generar nombre único para el archivo
        String nombreArchivoUnico = generarNombreUnico(nombreArchivo, extension);
        
        // Guardar archivo físicamente
        String rutaArchivo = guardarArchivoFisico(contenidoBase64, nombreArchivoUnico);
        
        // Crear registro en base de datos
        ArchivoTicket archivo = ArchivoTicket.builder()
            .ticket(ticket)
            .usuario(usuario)
            .nombreArchivo(nombreArchivoUnico)
            .nombreOriginal(nombreArchivo)
            .tipoMime(tipoMime)
            .tamañoArchivo(tamañoArchivo)
            .rutaArchivo(rutaArchivo)
            .extension(extension)
            .fechaSubida(LocalDateTime.now())
            .comentario(comentario)
            .activo(true)
            .build();
        
        ArchivoTicket archivoGuardado = archivoRepository.save(archivo);
        
        log.info("Archivo subido exitosamente: {}", archivoGuardado.getNombreCompleto());
        
        return convertirADTO(archivoGuardado);
    }
    
    /**
     * Obtener archivos de un ticket
     */
    @Transactional(readOnly = true)
    public List<ArchivoTicketResponseDTO> obtenerArchivosPorTicket(Long ticketId) {
        List<ArchivoTicket> archivos = archivoRepository
            .findByTicketIdAndActivoTrueOrderByFechaSubidaAsc(ticketId);
        
        return archivos.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Descargar archivo
     */
    @Transactional(readOnly = true)
    public byte[] descargarArchivo(Long ticketId, Long archivoId) {
        ArchivoTicket archivo = archivoRepository
            .findByIdAndTicketIdAndActivoTrue(archivoId, ticketId)
            .orElseThrow(() -> new RuntimeException("Archivo no encontrado"));
        
        try {
            Path path = Paths.get(archivo.getRutaArchivo());
            return Files.readAllBytes(path);
        } catch (IOException e) {
            log.error("Error descargando archivo: {}", e.getMessage());
            throw new RuntimeException("Error al descargar el archivo");
        }
    }
    
    /**
     * Obtener archivo para previsualización
     */
    @Transactional(readOnly = true)
    public ArchivoTicketResponseDTO obtenerArchivo(Long ticketId, Long archivoId) {
        ArchivoTicket archivo = archivoRepository
            .findByIdAndTicketIdAndActivoTrue(archivoId, ticketId)
            .orElseThrow(() -> new RuntimeException("Archivo no encontrado"));
        
        return convertirADTO(archivo);
    }
    
    /**
     * Eliminar archivo (soft delete)
     */
    public void eliminarArchivo(Long ticketId, Long archivoId, String emailUsuario) {
        ArchivoTicket archivo = archivoRepository
            .findByIdAndTicketIdAndActivoTrue(archivoId, ticketId)
            .orElseThrow(() -> new RuntimeException("Archivo no encontrado"));
        
        // Verificar que el usuario tenga permisos para eliminar
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        if (!archivo.getUsuario().getIdUsuario().equals(usuario.getIdUsuario())) {
            throw new RuntimeException("No tienes permisos para eliminar este archivo");
        }
        
        archivo.setActivo(false);
        archivoRepository.save(archivo);
        
        log.info("Archivo eliminado: {}", archivo.getNombreCompleto());
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
    
    /**
     * Convertir a DTO
     */
    private ArchivoTicketResponseDTO convertirADTO(ArchivoTicket archivo) {
        // Debug logs
        log.info("🔍 [ARCHIVO DEBUG] Convirtiendo archivo ID: {}", archivo.getId());
        log.info("🔍 [ARCHIVO DEBUG] Usuario: {}", archivo.getUsuario());
        log.info("🔍 [ARCHIVO DEBUG] Usuario ID: {}", archivo.getUsuario() != null ? archivo.getUsuario().getIdUsuario() : "NULL");
        log.info("🔍 [ARCHIVO DEBUG] Usuario Nombre Completo: {}", archivo.getUsuario() != null ? archivo.getUsuario().getNombreCompleto() : "NULL");
        log.info("🔍 [ARCHIVO DEBUG] Usuario Email: {}", archivo.getUsuario() != null ? archivo.getUsuario().getEmail() : "NULL");
        
        return ArchivoTicketResponseDTO.builder()
            .id(archivo.getId())
            .ticketId(archivo.getTicket().getId())
            .nombreArchivo(archivo.getNombreArchivo())
            .nombreOriginal(archivo.getNombreOriginal())
            .nombreCompleto(archivo.getNombreCompleto())
            .tipoMime(archivo.getTipoMime())
            .extension(archivo.getExtension())
            .tamañoArchivo(archivo.getTamañoArchivo())
            .tamañoFormateado(archivo.getTamañoFormateado())
            .rutaArchivo(archivo.getRutaArchivo())
            .fechaSubida(archivo.getFechaSubida())
            .subidoPor(archivo.getUsuario() != null ? archivo.getUsuario().getNombreCompleto() : "Usuario Desconocido")
            .subidoPorEmail(archivo.getUsuario() != null ? archivo.getUsuario().getEmail() : null)
            .comentario(archivo.getComentario())
            .esImagen(archivo.esImagen())
            .esPDF(archivo.esPDF())
            .esVideo(archivo.esVideo())
            .build();
    }
}
