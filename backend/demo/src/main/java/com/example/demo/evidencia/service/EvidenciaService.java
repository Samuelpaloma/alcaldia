package com.example.demo.evidencia.service;

import com.example.demo.evidencia.model.Evidencia;
import com.example.demo.evidencia.repository.EvidenciaRepository;
import com.example.demo.ticket.model.Ticket;
import com.example.demo.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class EvidenciaService {
    
    private final EvidenciaRepository evidenciaRepository;
    private final TicketRepository ticketRepository;
    
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
}
