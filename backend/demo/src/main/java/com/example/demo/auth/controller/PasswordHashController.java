package com.example.demo.auth.controller;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class PasswordHashController {
    
    /**
     * Endpoint temporal para generar hash de contraseñas
     * SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN
     */
    @GetMapping("/generate-hash")
    public String generatePasswordHash(@RequestParam String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }
    
    /**
     * Endpoint para verificar si una contraseña coincide con un hash
     */
    @PostMapping("/verify-hash")
    public boolean verifyPasswordHash(@RequestParam String password, @RequestParam String hash) {
        return BCrypt.checkpw(password, hash);
    }
}
