package com.example.demo.usuario.controller;

import com.example.demo.security.CustomUserDetails;
import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuario")
@CrossOrigin(origins = "*")
public class PreferenciasTemaController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/preferencias-tema")
    public ResponseEntity<Map<String, Object>> obtenerPreferenciasTema(Authentication authentication) {
        try {
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
            }

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String email = userDetails.getEmail();

            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Usuario no encontrado"));
            }

            Usuario usuario = usuarioOpt.get();
            String tema = usuario.getTemaPreferido() != null ? usuario.getTemaPreferido() : "light";

            Map<String, Object> response = new HashMap<>();
            response.put("tema", tema);
            response.put("email", email);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error obteniendo preferencias de tema: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error interno del servidor"));
        }
    }

    @PostMapping("/preferencias-tema")
    public ResponseEntity<Map<String, Object>> guardarPreferenciasTema(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
            }

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String email = userDetails.getEmail();
            String tema = request.get("tema");

            if (tema == null || (!tema.equals("light") && !tema.equals("dark"))) {
                return ResponseEntity.status(400).body(Map.of("error", "Tema inválido. Debe ser 'light' o 'dark'"));
            }

            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Usuario no encontrado"));
            }

            Usuario usuario = usuarioOpt.get();
            usuario.setTemaPreferido(tema);
            usuarioRepository.save(usuario);

            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Preferencias de tema actualizadas correctamente");
            response.put("tema", tema);
            response.put("email", email);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error guardando preferencias de tema: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Error interno del servidor"));
        }
    }
}
