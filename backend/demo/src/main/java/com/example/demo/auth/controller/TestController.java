package com.example.demo.auth.controller;

import com.example.demo.usuario.model.Usuario;
import com.example.demo.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {
    
    private final UsuarioRepository usuarioRepository;
    
    @GetMapping("/user/{email}")
    public ResponseEntity<Map<String, Object>> testFindUser(@PathVariable String email) {
        log.info("🔍 [TEST] Buscando usuario con email: '{}'", email);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Buscar usuario
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
            
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                log.info("✅ [TEST] Usuario encontrado: {}", usuario.getEmail());
                
                response.put("found", true);
                response.put("id", usuario.getId());
                response.put("email", usuario.getEmail());
                response.put("nombre", usuario.getFirstName());
                response.put("apellido", usuario.getLastName());
                response.put("tipoUsuario", usuario.getUserType());
                response.put("activo", usuario.getActive());
                response.put("emailVerificado", usuario.getEmailVerified());
                
                // Información adicional de debug
                Map<String, Object> debug = new HashMap<>();
                debug.put("emailLength", email.length());
                debug.put("emailHex", bytesToHex(email.getBytes()));
                debug.put("dbEmailLength", usuario.getEmail().length());
                debug.put("dbEmailHex", bytesToHex(usuario.getEmail().getBytes()));
                debug.put("emailsEqual", email.equals(usuario.getEmail()));
                debug.put("emailsEqualIgnoreCase", email.equalsIgnoreCase(usuario.getEmail()));
                
                response.put("debug", debug);
                
            } else {
                log.warn("❌ [TEST] Usuario NO encontrado con email: '{}'", email);
                response.put("found", false);
                response.put("message", "Usuario no encontrado");
                
                // Buscar usuarios similares
                log.info("🔍 [TEST] Buscando usuarios con email similar...");
                // Aquí podrías agregar una búsqueda LIKE si es necesario
            }
            
        } catch (Exception e) {
            log.error("❌ [TEST] Error buscando usuario: {}", e.getMessage(), e);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/users/all")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        log.info("🔍 [TEST] Obteniendo todos los usuarios...");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            var usuarios = usuarioRepository.findAll();
            response.put("total", usuarios.size());
            response.put("users", usuarios.stream().map(u -> {
                Map<String, Object> user = new HashMap<>();
                user.put("id", u.getId());
                user.put("email", u.getEmail());
                user.put("nombre", u.getFirstName());
                user.put("apellido", u.getLastName());
                user.put("tipoUsuario", u.getUserType());
                user.put("activo", u.getActive());
                return user;
            }).toList());
            
        } catch (Exception e) {
            log.error("❌ [TEST] Error obteniendo usuarios: {}", e.getMessage(), e);
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}

