package com.example.demo.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // TEMPORAL: Comentado para debugging - el interceptor puede estar causando el error 500
        // registration.interceptors(webSocketAuthInterceptor);
        System.out.println("🔥🔥🔥 [WEBSOCKET CONFIG] Interceptor de autenticación DESHABILITADO temporalmente");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        System.out.println("🔥🔥🔥 [WEBSOCKET CONFIG] Registrando endpoint /ws");
        registry.addEndpoint("/ws")
                .setAllowedOrigins(
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "http://localhost:4173",
                    "http://127.0.0.1:4173",
                    "http://localhost:8081",
                    "http://127.0.0.1:8081",
                    "http://10.0.2.2:8080",
                    "http://10.0.2.2:3000",
                    "http://10.0.2.2:5173",
                    "http://10.0.2.2:4173",
                    "http://10.0.2.2:8081",
                    "http://192.168.1.10:3000",
                    "http://192.168.1.10:5173",
                    "http://192.168.1.10:4173",
                    "http://192.168.1.10:8081",
                    "exp://192.168.1.10:8081",
                    "exp://192.168.1.10:19000"
                )
                .withSockJS();
        System.out.println("🔥🔥🔥 [WEBSOCKET CONFIG] Endpoint registrado exitosamente");
    }
}
