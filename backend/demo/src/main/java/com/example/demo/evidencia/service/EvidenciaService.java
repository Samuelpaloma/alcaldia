package com.example.demo.evidencia.service;

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

import java.util.List;
import java.util.Optional;

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
        log.info("Subiendo evidencia al ticket {} por usuario {}", ticketId, emailUsuario);
        
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
        
        // Validar archivo
        if (archivo.isEmpty()) {
            throw new RuntimeException("El archivo no puede estar vacío");
        }
        
        // Validar tamaño (máximo 10MB)
        if (archivo.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("El archivo no puede ser mayor a 10MB");
        }
        
        // Validar tipo de archivo
        String contentType = archivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/") && !contentType.startsWith("application/pdf")) {
            throw new RuntimeException("Solo se permiten archivos de imagen y PDF");
        }
        
        // Obtener usuario por email
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Determinar tipo de evidencia basado en el content type
        String tipoEvidencia = "DOCUMENTO";
        if (contentType.startsWith("image/")) {
            tipoEvidencia = "IMAGEN";
        } else if (contentType.startsWith("video/")) {
            tipoEvidencia = "VIDEO";
        } else if (contentType.startsWith("audio/")) {
            tipoEvidencia = "AUDIO";
        }
        
        // Obtener extensión del archivo
        String nombreOriginal = archivo.getOriginalFilename();
        String extension = "";
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            extension = nombreOriginal.substring(nombreOriginal.lastIndexOf(".") + 1);
        }
        
        // Crear evidencia
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
        
        return evidenciaRepository.save(evidencia);
    }
}
