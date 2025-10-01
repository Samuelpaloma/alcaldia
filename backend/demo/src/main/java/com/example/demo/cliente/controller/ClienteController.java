package com.example.demo.cliente.controller;

import com.example.demo.cliente.dto.request.ResponderResolucionRequestDTO;
import com.example.demo.cliente.service.ClienteService;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/cliente")
@RequiredArgsConstructor
public class ClienteController {
    
    private final ClienteService clienteService;
    
    /**
     * Responder a un ticket resuelto (confirmar o escalar)
     * POST /api/cliente/tickets/responder-resolucion
     */
    @PostMapping("/tickets/responder-resolucion")
    public ResponseEntity<?> responderResolucion(
            @Valid @RequestBody ResponderResolucionRequestDTO request,
            Authentication authentication) {
        try {
            log.info("Cliente respondiendo a ticket resuelto: {}", request.getTicketId());
            log.info("Acción del cliente: {}", request.getAccion());
            
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailCliente = userDetails.getEmail();
            
            clienteService.responderResolucion(request, emailCliente);
            
            String mensaje = request.getAccion().equals("CONFIRMAR") 
                ? "Ticket cerrado exitosamente" 
                : "Ticket escalado. Un técnico de mayor nivel lo atenderá pronto.";
            
            return ResponseEntity.ok(ApiResponse.success(mensaje));
        } catch (Exception e) {
            log.error("Error al responder resolución de ticket", e);
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al procesar la respuesta: " + e.getMessage())
            );
        }
    }
}

