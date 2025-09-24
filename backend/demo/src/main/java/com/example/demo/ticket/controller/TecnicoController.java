package com.example.demo.ticket.controller;

import com.example.demo.ticket.dto.TecnicoDashboardDTO;
import com.example.demo.ticket.service.TecnicoService;
import com.example.demo.usuario.model.User;
import com.example.demo.usuario.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/tecnico")
@CrossOrigin(origins = "*")
public class TecnicoController {
    
    @Autowired
    private TecnicoService tecnicoService;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Endpoint para obtener estadísticas del dashboard del técnico
     * GET /api/tecnico/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        try {
            // Obtener el usuario autenticado
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("🔍 [TECNICO] Authentication: " + authentication);
            System.out.println("🔍 [TECNICO] Authentication name: " + (authentication != null ? authentication.getName() : "null"));
            System.out.println("🔍 [TECNICO] Authentication principal: " + (authentication != null ? authentication.getPrincipal() : "null"));
            
            if (authentication == null || authentication.getName() == null || authentication.getName().equals("anonymousUser")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Usuario no autenticado");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            String userIdOrEmail = authentication.getName();
            System.out.println("🔍 [TECNICO] User ID or email: " + userIdOrEmail);
            
            // Determinar si es ID o email y obtener el usuario
            User user;
            try {
                // Intentar parsear como ID primero
                Integer userId = Integer.parseInt(userIdOrEmail);
                System.out.println("🔍 [TECNICO] Parsed as user ID: " + userId);
                user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
            } catch (NumberFormatException e) {
                // Si no es un número, tratar como email
                System.out.println("🔍 [TECNICO] Treating as email: " + userIdOrEmail);
                user = userRepository.findByEmail(userIdOrEmail)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + userIdOrEmail));
            }
            
            System.out.println("🔍 [TECNICO] User found: " + user.getNombre() + " (" + user.getEmail() + ")");
            
            // Obtener estadísticas del técnico usando el ID
            TecnicoDashboardDTO stats = tecnicoService.getDashboardStats(user.getId());
            
            // Crear respuesta con el formato esperado por el frontend
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Estadísticas obtenidas exitosamente");
            response.put("stats", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al obtener estadísticas: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Endpoint alternativo para obtener estadísticas por ID de técnico
     * GET /api/tecnico/dashboard/{tecnicoId}
     */
    @GetMapping("/dashboard/{tecnicoId}")
    public ResponseEntity<?> getDashboardStatsById(@PathVariable Integer tecnicoId) {
        try {
            TecnicoDashboardDTO stats = tecnicoService.getDashboardStats(tecnicoId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Estadísticas obtenidas exitosamente");
            response.put("stats", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al obtener estadísticas: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
