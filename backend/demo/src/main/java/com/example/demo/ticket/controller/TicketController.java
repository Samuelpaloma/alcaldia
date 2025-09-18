package com.example.demo.ticket.controller;

import com.example.demo.security.CustomUserDetails;
import com.example.demo.shared.dto.ApiResponse;
import com.example.demo.ticket.dto.request.TicketRequestDTO;
import com.example.demo.ticket.dto.response.HistorialTicketResponseDTO;
import com.example.demo.ticket.dto.response.TicketResponseDTO;
import com.example.demo.ticket.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    /**
     * Crear un nuevo ticket desde el formulario de funcionarios
     * POST /api/tickets/crear
     */
    @PostMapping("/crear")
    public ResponseEntity<?> crearTicket(
            @Valid @RequestBody TicketRequestDTO request,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            TicketResponseDTO ticket = ticketService.crearTicket(request, emailUsuario);
            
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al crear el ticket: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener seguimiento de un ticket específico
     * GET /api/tickets/seguimiento/{ticketId}
     */
    @GetMapping("/seguimiento/{ticketId}")
    public ResponseEntity<?> obtenerSeguimiento(
            @PathVariable Long ticketId,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            TicketResponseDTO ticket = ticketService.obtenerTicketParaSeguimiento(ticketId, emailUsuario);
            
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener el ticket: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener historial de tickets del usuario
     * GET /api/tickets/historial
     */
    @GetMapping("/historial")
    public ResponseEntity<?> obtenerHistorial(
            Authentication authentication,
            Pageable pageable) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            Page<HistorialTicketResponseDTO> historial = ticketService.obtenerHistorialTickets(emailUsuario, pageable);
            
            return ResponseEntity.ok(historial);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener el historial: " + e.getMessage())
            );
        }
    }

    /**
     * Buscar tickets por criterios
     * GET /api/tickets/buscar
     */
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarTickets(
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String prioridad,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            List<TicketResponseDTO> tickets = ticketService.buscarTickets(emailUsuario, categoria, estado, prioridad);
            
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error en la búsqueda: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener un ticket específico por ID
     * GET /api/tickets/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerTicket(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            TicketResponseDTO ticket = ticketService.obtenerTicketPorId(id, emailUsuario);
            
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener el ticket: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener categorías disponibles
     * GET /api/tickets/categorias
     */
    @GetMapping("/categorias")
    public ResponseEntity<?> obtenerCategorias() {
        try {
            List<String> categorias = ticketService.obtenerCategoriasDisponibles();
            return ResponseEntity.ok(categorias);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener las categorías: " + e.getMessage())
            );
        }
    }

    /**
     * Obtener información del usuario logueado
     * GET /api/tickets/usuario-info
     */
    @GetMapping("/usuario-info")
    public ResponseEntity<?> obtenerInfoUsuario(Authentication authentication) {
        try {
            // Obtener el CustomUserDetails del contexto de seguridad
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String emailUsuario = userDetails.getEmail();
            String nombreUsuario = userDetails.getUsuario().getNombre();
            
            return ResponseEntity.ok(Map.of(
                "email", emailUsuario,
                "nombre", nombreUsuario
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error al obtener información del usuario: " + e.getMessage())
            );
        }
    }

    /**
     * Endpoint de prueba para verificar autenticación
     * GET /api/tickets/test-auth
     */
    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuth(Authentication authentication) {
        try {
            return ResponseEntity.ok(Map.of(
                "message", "Autenticación exitosa",
                "user", authentication.getName(),
                "authorities", authentication.getAuthorities()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Error en autenticación: " + e.getMessage())
            );
        }
    }
}
