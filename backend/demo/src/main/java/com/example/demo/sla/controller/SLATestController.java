package com.example.demo.sla.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sla-test")
@CrossOrigin(origins = "*")
public class SLATestController {
    
    /**
     * Endpoint simple para probar conectividad
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("SLA Test Controller funcionando correctamente");
    }
    
    /**
     * Endpoint simple para probar base de datos
     */
    @GetMapping("/db-test")
    public ResponseEntity<String> testDatabase() {
        try {
            // Aquí podrías hacer una consulta simple a la base de datos
            return ResponseEntity.ok("Base de datos conectada correctamente");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error en base de datos: " + e.getMessage());
        }
    }
}