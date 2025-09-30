package com.example.demo.config;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;
import java.util.Map;

@Controller
public class WebSocketTestController {

    @MessageMapping("/test")
    @SendTo("/topic/test")
    public String testMessage(String message) {
        System.out.println("🔥🔥🔥 [WEBSOCKET TEST] Mensaje recibido: " + message);
        return "Respuesta del servidor: " + message + " - " + LocalDateTime.now();
    }

    @GetMapping("/api/websocket/test")
    @ResponseBody
    public Map<String, String> testEndpoint() {
        System.out.println("🔥🔥🔥 [WEBSOCKET TEST] Endpoint de prueba llamado");
        return Map.of(
            "status", "ok",
            "message", "WebSocket endpoint funcionando",
            "timestamp", LocalDateTime.now().toString()
        );
    }
}
