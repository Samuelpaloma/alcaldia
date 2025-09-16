package com.example.demo.ticket.service;

import com.example.demo.ticket.dto.request.TicketRequestDTO;
import com.example.demo.ticket.dto.response.TicketResponseDTO;

public interface TicketService {

     TicketResponseDTO crearTicket(TicketRequestDTO request, String emailUsuario);
    
}
