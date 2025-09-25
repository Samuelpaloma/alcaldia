package com.example.demo.encuesta.service;

import com.example.demo.encuesta.dto.request.EncuestaSatisfaccionRequestDTO;
import com.example.demo.encuesta.dto.response.EncuestaSatisfaccionResponseDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EncuestaService {

    public EncuestaSatisfaccionResponseDTO enviarEncuestaSatisfaccion(
            EncuestaSatisfaccionRequestDTO request, String emailUsuario) {
        // TODO: Implementar lógica de negocio
        return new EncuestaSatisfaccionResponseDTO();
    }

    public List<EncuestaSatisfaccionResponseDTO> obtenerEncuestasPorTicket(Long ticketId) {
        // TODO: Implementar lógica de negocio
        return List.of();
    }

    public Object obtenerEstadisticasSatisfaccion() {
        // TODO: Implementar lógica de negocio
        return new Object();
    }
}






