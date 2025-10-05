package com.example.demo.ticket.service;

import com.example.demo.ticket.dto.request.TicketRequestDTO;
import com.example.demo.ticket.dto.response.HistorialTicketResponseDTO;
import com.example.demo.ticket.dto.response.TicketResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TicketService {

    // Crear ticket desde formulario
    TicketResponseDTO crearTicket(TicketRequestDTO request, String emailUsuario);
    
    // Seguimiento de tickets
    TicketResponseDTO obtenerTicketParaSeguimiento(Long ticketId, String emailUsuario);
    
    // Historial de tickets
    Page<HistorialTicketResponseDTO> obtenerHistorialTickets(String emailUsuario, Pageable pageable);
    
    // Búsqueda de ticketss
    List<TicketResponseDTO> buscarTickets(String emailUsuario, String categoria, String estado, String prioridad);
    
    // Obtener ticket por ID
    TicketResponseDTO obtenerTicketPorId(Long id, String emailUsuario);
    
    // Obtener categorías disponibles
    List<String> obtenerCategoriasDisponibles();
    
    // Obtener nombre del usuario
    String obtenerNombreUsuario(String emailUsuario);
    
    // Responder a resolución de ticket (para clientes)
    void responderResolucionTicket(Long ticketId, String accion, String comentario);
    
}
