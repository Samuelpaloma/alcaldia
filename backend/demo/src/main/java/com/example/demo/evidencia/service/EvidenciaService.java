package com.example.demo.evidencia.service;

import com.example.demo.evidencia.dto.EvidenciaMovilDTO;
import com.example.demo.evidencia.model.Evidencia;
import com.example.demo.evidencia.repository.EvidenciaRepository;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class EvidenciaService {
    
    private final EvidenciaRepository evidenciaRepository;
    private final TicketRepository ticketRepository;
    private final UsuarioRepository usuarioRepository;
    
    /**
     * Obtener evidencia por ID
     */
    public Optional<Evidencia> obtenerEvidenciaPorId(Long idEvidencia) {
        return evidenciaRepository.findById(idEvidencia);
    }
    
    /**
     * Obtener evidencias de un ticket
     */
    public List<Evidencia> obtenerEvidenciasPorTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        return evidenciaRepository.findActivasByTicket(ticket);
    }
    
    /**
     * Obtener evidencias de un ticket en formato móvil
     */
    public List<EvidenciaMovilDTO> obtenerEvidenciasPorTicketMovil(Long ticketId) {
        log.info("Obteniendo evidencias del ticket {} para móvil", ticketId);
        
        List<EvidenciaMovilDTO> evidenciasDTO = new ArrayList<>();
        
        // 1. Obtener evidencias de la tabla evidencias
        List<Evidencia> evidencias = obtenerEvidenciasPorTicket(ticketId);
        evidenciasDTO.addAll(evidencias.stream()
            .map(this::convertirAEvidenciaMovilDTO)
            .collect(Collectors.toList()));
        
        // 2. Obtener archivo adjunto del ticket si existe
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        if (ticket.getArchivoAdjunto() != null && !ticket.getArchivoAdjunto().trim().isEmpty()) {
            log.info("Ticket {} tiene archivo adjunto: {}", ticketId, ticket.getArchivoAdjunto());
            
            EvidenciaMovilDTO archivoAdjuntoDTO = EvidenciaMovilDTO.builder()
                .idEvidencia(-1L) // ID especial para archivo adjunto
                .ticketId(ticketId)
                .tipoEvidencia(determinarTipoEvidencia(ticket.getArchivoAdjunto()))
                .descripcion("Archivo adjunto del ticket")
                .nombreArchivo(ticket.getArchivoAdjunto())
                .extensionArchivo(obtenerExtensionArchivo(ticket.getArchivoAdjunto()))
                .tamanioArchivo(0L) // No tenemos el tamaño real
                .tamanioFormateado("N/A")
                .urlArchivo(null)
                .fechaSubida(ticket.getFechaActualizacion()) // Usar fecha de actualización
                .subidoPorNombre(ticket.getTecnicoAsignado() != null ? 
                    ticket.getTecnicoAsignado().getNombre() + " " + ticket.getTecnicoAsignado().getApellido() : null)
                .subidoPorEmail(ticket.getTecnicoAsignado() != null ? 
                    ticket.getTecnicoAsignado().getEmail() : null)
                .build();
            
            evidenciasDTO.add(archivoAdjuntoDTO);
            log.info("Archivo adjunto agregado como evidencia: {}", ticket.getArchivoAdjunto());
        }
        
        log.info("Total evidencias encontradas para ticket {}: {}", ticketId, evidenciasDTO.size());
        return evidenciasDTO;
    }
    
    /**
     * Convertir Evidencia a EvidenciaMovilDTO
     */
    private EvidenciaMovilDTO convertirAEvidenciaMovilDTO(Evidencia evidencia) {
        return EvidenciaMovilDTO.builder()
            .idEvidencia(evidencia.getIdEvidencia())
            .ticketId(evidencia.getTicket().getId())
            .tipoEvidencia(evidencia.getTipoEvidencia())
            .descripcion(evidencia.getDescripcion())
            .nombreArchivo(evidencia.getNombreArchivo())
            .extensionArchivo(evidencia.getExtensionArchivo())
            .tamanioArchivo(evidencia.getTamanioArchivo())
            .tamanioFormateado(evidencia.getTamanioFormateado())
            .urlArchivo(evidencia.getUrlArchivo())
            .fechaSubida(evidencia.getFechaSubida())
            .subidoPorNombre(evidencia.getSubidoPor() != null ? 
                evidencia.getSubidoPor().getNombre() + " " + evidencia.getSubidoPor().getApellido() : null)
            .subidoPorEmail(evidencia.getSubidoPor() != null ? evidencia.getSubidoPor().getEmail() : null)
            .build();
    }
    
    /**
     * Obtener evidencia para descarga
     */
    public Evidencia obtenerEvidenciaParaDescarga(Long ticketId, String nombreArchivo) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        return evidenciaRepository.findActivasByTicket(ticket).stream()
            .filter(e -> e.getNombreArchivo().equals(nombreArchivo))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Evidencia no encontrada"));
    }
    
    /**
     * Subir evidencia a un ticket
     */
    @Transactional
    public Evidencia subirEvidencia(Long ticketId, MultipartFile archivo, String descripcion, String emailUsuario) {
        log.info("🔍 [EVIDENCIA SERVICE] ===== INICIANDO SUBIDA DE EVIDENCIA =====");
        log.info("🔍 [EVIDENCIA SERVICE] Ticket ID: {}", ticketId);
        log.info("🔍 [EVIDENCIA SERVICE] Email usuario: {}", emailUsuario);
        log.info("🔍 [EVIDENCIA SERVICE] Archivo: {} ({} bytes)", archivo.getOriginalFilename(), archivo.getSize());
        log.info("🔍 [EVIDENCIA SERVICE] Content Type: {}", archivo.getContentType());
        
        log.info("🔍 [EVIDENCIA SERVICE] Buscando ticket...");
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        log.info("🔍 [EVIDENCIA SERVICE] Ticket encontrado: {}", ticket.getId());
        
        // Validar archivo
        log.info("🔍 [EVIDENCIA SERVICE] Validando archivo...");
        if (archivo.isEmpty()) {
            throw new RuntimeException("El archivo no puede estar vacío");
        }
        
        // Validar tamaño (máximo 10MB)
        if (archivo.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("El archivo no puede ser mayor a 10MB");
        }
        
        // Validar tipo de archivo - solo imágenes y videos
        String contentType = archivo.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
            throw new RuntimeException("Solo se permiten archivos de imagen y video");
        }
        log.info("🔍 [EVIDENCIA SERVICE] Validaciones de archivo pasadas");
        
        // Obtener usuario por email
        log.info("🔍 [EVIDENCIA SERVICE] Buscando usuario por email...");
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        log.info("🔍 [EVIDENCIA SERVICE] Usuario encontrado: {}", usuario.getEmail());
        
        // Determinar tipo de evidencia basado en el content type
        String tipoEvidencia = "IMAGEN"; // Por defecto
        if (contentType.startsWith("image/")) {
            tipoEvidencia = "IMAGEN";
        } else if (contentType.startsWith("video/")) {
            tipoEvidencia = "VIDEO";
        }
        log.info("🔍 [EVIDENCIA SERVICE] Tipo de evidencia: {}", tipoEvidencia);
        
        // Obtener extensión del archivo
        String nombreOriginal = archivo.getOriginalFilename();
        String extension = "";
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            extension = nombreOriginal.substring(nombreOriginal.lastIndexOf(".") + 1);
        }
        log.info("🔍 [EVIDENCIA SERVICE] Extensión: {}", extension);
        
        // Crear evidencia
        log.info("🔍 [EVIDENCIA SERVICE] Creando objeto Evidencia...");
        Evidencia evidencia = Evidencia.builder()
            .ticket(ticket)
            .subidoPor(usuario)
            .tipoEvidencia(tipoEvidencia)
            .descripcion(descripcion)
            .nombreArchivo(nombreOriginal)
            .extensionArchivo(extension)
            .tamanioArchivo(archivo.getSize())
            .rutaArchivo("/uploads/evidencias/" + ticketId + "/" + nombreOriginal)
            .activa(true)
            .build();
        
        log.info("🔍 [EVIDENCIA SERVICE] Guardando evidencia en base de datos...");
        Evidencia evidenciaGuardada = evidenciaRepository.save(evidencia);
        log.info("✅ [EVIDENCIA SERVICE] Evidencia guardada con ID: {}", evidenciaGuardada.getIdEvidencia());
        
        return evidenciaGuardada;
    }
    
    /**
     * Determinar el tipo de evidencia basado en la extensión del archivo
     */
    private String determinarTipoEvidencia(String nombreArchivo) {
        if (nombreArchivo == null) return "DOCUMENTO";
        
        String extension = obtenerExtensionArchivo(nombreArchivo).toLowerCase();
        
        if (extension.matches("(jpg|jpeg|png|gif|bmp|webp)")) {
            return "IMAGEN";
        } else if (extension.matches("(mp4|avi|mov|wmv|flv|webm)")) {
            return "VIDEO";
        } else if (extension.matches("(mp3|wav|ogg|aac)")) {
            return "AUDIO";
        } else {
            return "DOCUMENTO";
        }
    }
    
    /**
     * Obtener la extensión del archivo
     */
    private String obtenerExtensionArchivo(String nombreArchivo) {
        if (nombreArchivo == null || !nombreArchivo.contains(".")) {
            return "";
        }
        return nombreArchivo.substring(nombreArchivo.lastIndexOf(".") + 1);
    }
    
    /**
     * Verificar si un archivo es un archivo adjunto del ticket
     */
    public boolean esArchivoAdjunto(Long ticketId, String nombreArchivo) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
            
            return ticket.getArchivoAdjunto() != null && 
                   ticket.getArchivoAdjunto().equals(nombreArchivo);
        } catch (Exception e) {
            log.error("Error verificando archivo adjunto", e);
            return false;
        }
    }
}
