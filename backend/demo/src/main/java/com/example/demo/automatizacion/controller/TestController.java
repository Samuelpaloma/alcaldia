package com.example.demo.automatizacion.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/automation")
    public ResponseEntity<Map<String, Object>> testAutomation() {
        System.out.println("🧪 TEST: Endpoint de prueba llamado");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Automation module is working!");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/automation")
    public ResponseEntity<Map<String, Object>> testPostAutomation(@RequestBody Map<String, Object> data) {
        System.out.println("🧪 TEST: POST request recibido con datos: " + data);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "POST request received!");
        response.put("received_data", data);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
